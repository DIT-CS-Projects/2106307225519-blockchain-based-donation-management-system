import { createHash } from 'node:crypto'
import { Contract, JsonRpcProvider, Wallet, type ContractTransactionReceipt } from 'ethers'
import { env } from '../config/env'
import { logger } from '../utils/logger'

// Hand-maintained fragment: only the functions and events the backend calls.
// The full artifact lives in contracts/artifacts (gitignored build output),
// so the server carries its own copy rather than reaching across packages.
const REGISTRY_ABI = [
  'function registerDonation(uint256 donationId, uint256 campaignId, bytes32 proofHash) external',
  'function getDonation(uint256 donationId) external view returns (tuple(uint256 recordId, uint256 campaignId, bytes32 proofHash, uint64 timestamp, uint8 recordType, bool exists))',
  'event DonationRecorded(uint256 indexed donationId, uint256 indexed campaignId, bytes32 proofHash, uint64 timestamp)',
  'function registerDisbursement(uint256 disbursementId, uint256 campaignId, bytes32 proofHash) external',
  'function getDisbursement(uint256 disbursementId) external view returns (tuple(uint256 recordId, uint256 campaignId, bytes32 proofHash, uint64 timestamp, uint8 recordType, bool exists))',
  'event DisbursementRecorded(uint256 indexed disbursementId, uint256 indexed campaignId, bytes32 proofHash, uint64 timestamp)',
] as const

const NETWORK_LABEL: Record<typeof env.BLOCKCHAIN_NETWORK, string> = {
  local: 'Hardhat Local',
  sepolia: 'Sepolia',
}

/** Human-readable name of the chain this instance records proofs on. */
export function currentNetworkLabel(): string {
  return NETWORK_LABEL[env.BLOCKCHAIN_NETWORK]
}

interface Client {
  provider: JsonRpcProvider
  wallet: Wallet
  contract: Contract
}

let client: Client | null | undefined // undefined = not yet resolved, null = unavailable

/**
 * Lazily build the ethers client from env. Returns null when blockchain isn't
 * configured (missing wallet key or contract address) so the rest of the app
 * degrades gracefully instead of crashing (docs/prompts/blockchain.md:
 * "Blockchain failure must never lose donation data").
 */
function getClient(): Client | null {
  if (client !== undefined) return client

  if (!env.BACKEND_WALLET_PRIVATE_KEY || !env.CONTRACT_ADDRESS) {
    logger.warn('Blockchain not configured (BACKEND_WALLET_PRIVATE_KEY / CONTRACT_ADDRESS missing). Proof recording is disabled.')
    client = null
    return client
  }

  const provider = new JsonRpcProvider(env.BLOCKCHAIN_RPC_URL)
  const wallet = new Wallet(env.BACKEND_WALLET_PRIVATE_KEY, provider)
  const contract = new Contract(env.CONTRACT_ADDRESS, REGISTRY_ABI, wallet)
  client = { provider, wallet, contract }
  return client
}

export function isBlockchainConfigured(): boolean {
  return getClient() !== null
}

/**
 * Deterministic proof hash (Decision 010): SHA-256 over donation ID, campaign
 * ID, amount, receipt number, payment reference and timestamp. Recomputable
 * from the donation row alone, so verification never needs extra storage.
 */
export function computeProofHash(input: {
  donationId: number
  campaignId: number
  amount: number
  receiptNumber: string
  paymentReference: string
  createdAt: Date
}): string {
  const payload = [
    input.donationId,
    input.campaignId,
    input.amount,
    input.receiptNumber,
    input.paymentReference,
    input.createdAt.toISOString(),
  ].join(':')
  return `0x${createHash('sha256').update(payload).digest('hex')}`
}

export interface RecordProofResult {
  txHash: string
  blockNumber: number
  network: string
}

/**
 * Write a donation proof on-chain and wait for one confirmation. One
 * transaction per donation, never batched (Decision 010). Callers run this
 * without awaiting the response back to the donor (flows/payment-flow.md).
 */
export async function recordDonationProof(input: {
  donationId: number
  campaignId: number
  proofHash: string
}): Promise<RecordProofResult> {
  const c = getClient()
  if (!c) throw new Error('Blockchain is not configured')

  try {
    const tx = await c.contract.registerDonation(input.donationId, input.campaignId, input.proofHash)
    const receipt = (await tx.wait()) as ContractTransactionReceipt
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      network: NETWORK_LABEL[env.BLOCKCHAIN_NETWORK],
    }
  } catch (error) {
    // A retry after a crashed DB write can hit an already-recorded proof.
    // Reconcile instead of failing: the chain is the source of truth here.
    if (error instanceof Error && /ProofAlreadyExists/.test(error.message)) {
      const onChain = await getOnChainDonation(input.donationId)
      if (onChain.exists && onChain.proofHash === input.proofHash) {
        logger.warn(`Donation ${input.donationId} was already recorded on-chain; reconciling.`)
        const found = await findRecordedTx(input.donationId)
        if (!found) {
          throw new Error(
            `Proof exists on-chain for donation ${input.donationId} but its event log is missing`,
            { cause: error },
          )
        }
        return found
      }
    }
    throw error
  }
}

/** Find the transaction that recorded a donation's proof, via its event log. */
async function findRecordedTx(donationId: number): Promise<RecordProofResult | null> {
  const c = getClient()
  if (!c) return null
  const filter = c.contract.filters.DonationRecorded(donationId)
  const [log] = await c.contract.queryFilter(filter)
  if (!log) return null
  return {
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    network: NETWORK_LABEL[env.BLOCKCHAIN_NETWORK],
  }
}

/**
 * Live check: is this donation's expected proof actually on-chain? Used by
 * the verify endpoint to heal a donation whose background recording crashed
 * or is still catching up, without duplicating the recording logic.
 */
export async function reconcileProof(
  donationId: number,
  expectedProofHash: string,
): Promise<RecordProofResult | null> {
  const onChain = await getOnChainDonation(donationId)
  if (!onChain.exists || onChain.proofHash !== expectedProofHash) return null
  return findRecordedTx(donationId)
}

export interface OnChainProof {
  exists: boolean
  proofHash: string
  campaignId: number
  timestamp: number
}

/**
 * Read a donation's proof directly from the contract (read-only, no gas).
 * The contract reverts with ProofNotFound for an unrecorded donation; that is
 * an expected state here (e.g. recording still pending), not an error.
 */
export async function getOnChainDonation(donationId: number): Promise<OnChainProof> {
  const c = getClient()
  if (!c) throw new Error('Blockchain is not configured')

  try {
    const proof = await c.contract.getDonation(donationId)
    return {
      exists: proof.exists,
      proofHash: proof.proofHash,
      campaignId: Number(proof.campaignId),
      timestamp: Number(proof.timestamp),
    }
  } catch (error) {
    if (error instanceof Error && /ProofNotFound/.test(error.message)) {
      return { exists: false, proofHash: '', campaignId: 0, timestamp: 0 }
    }
    throw error
  }
}

// --- Disbursements: same recording flow as donations (Decision 016). ---

/**
 * Deterministic proof hash for a disbursement, mirroring computeProofHash:
 * SHA-256 over disbursement ID, campaign ID, amount, and completion timestamp.
 */
export function computeDisbursementProofHash(input: {
  disbursementId: number
  campaignId: number
  amount: number
  completedAt: Date
}): string {
  const payload = [
    input.disbursementId,
    input.campaignId,
    input.amount,
    input.completedAt.toISOString(),
  ].join(':')
  return `0x${createHash('sha256').update(payload).digest('hex')}`
}

/** Write a disbursement proof on-chain and wait for one confirmation. */
export async function recordDisbursementProof(input: {
  disbursementId: number
  campaignId: number
  proofHash: string
}): Promise<RecordProofResult> {
  const c = getClient()
  if (!c) throw new Error('Blockchain is not configured')

  try {
    const tx = await c.contract.registerDisbursement(
      input.disbursementId,
      input.campaignId,
      input.proofHash,
    )
    const receipt = (await tx.wait()) as ContractTransactionReceipt
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      network: NETWORK_LABEL[env.BLOCKCHAIN_NETWORK],
    }
  } catch (error) {
    if (error instanceof Error && /ProofAlreadyExists/.test(error.message)) {
      const onChain = await getOnChainDisbursement(input.disbursementId)
      if (onChain.exists && onChain.proofHash === input.proofHash) {
        logger.warn(`Disbursement ${input.disbursementId} was already recorded on-chain; reconciling.`)
        const found = await findRecordedDisbursementTx(input.disbursementId)
        if (!found) {
          throw new Error(
            `Proof exists on-chain for disbursement ${input.disbursementId} but its event log is missing`,
            { cause: error },
          )
        }
        return found
      }
    }
    throw error
  }
}

async function findRecordedDisbursementTx(disbursementId: number): Promise<RecordProofResult | null> {
  const c = getClient()
  if (!c) return null
  const filter = c.contract.filters.DisbursementRecorded(disbursementId)
  const [log] = await c.contract.queryFilter(filter)
  if (!log) return null
  return {
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    network: NETWORK_LABEL[env.BLOCKCHAIN_NETWORK],
  }
}

export async function reconcileDisbursementProof(
  disbursementId: number,
  expectedProofHash: string,
): Promise<RecordProofResult | null> {
  const onChain = await getOnChainDisbursement(disbursementId)
  if (!onChain.exists || onChain.proofHash !== expectedProofHash) return null
  return findRecordedDisbursementTx(disbursementId)
}

export async function getOnChainDisbursement(disbursementId: number): Promise<OnChainProof> {
  const c = getClient()
  if (!c) throw new Error('Blockchain is not configured')

  try {
    const proof = await c.contract.getDisbursement(disbursementId)
    return {
      exists: proof.exists,
      proofHash: proof.proofHash,
      campaignId: Number(proof.campaignId),
      timestamp: Number(proof.timestamp),
    }
  } catch (error) {
    if (error instanceof Error && /ProofNotFound/.test(error.message)) {
      return { exists: false, proofHash: '', campaignId: 0, timestamp: 0 }
    }
    throw error
  }
}
