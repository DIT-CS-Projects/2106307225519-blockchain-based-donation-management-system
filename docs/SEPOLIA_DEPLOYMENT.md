# DEPLOYING TO SEPOLIA (public block explorer trace)

By default the system records donation and disbursement proofs on a **local Hardhat node** (`BLOCKCHAIN_NETWORK=local`). A local chain runs only on your machine, so there is no public page to link to. The transaction hash is real, but nobody outside your machine can open it.

Deploying the same contract to the **Sepolia** public testnet turns on real, external traceability: every "View transaction" link in the app becomes a public `https://sepolia.etherscan.io/tx/0x…` page that anyone in the world can open. No application code changes are needed. The client already builds the Etherscan link whenever the network is Sepolia (`client/src/utils/blockchain.ts`).

---

## What you must provide

These need real credentials and free testnet funds; they cannot be generated for you.

1. **A Sepolia RPC URL** from a free provider (Alchemy or Infura). Looks like `https://eth-sepolia.g.alchemy.com/v2/<key>`.
2. **A dedicated test wallet private key.** Create a throwaway wallet (e.g. in MetaMask). Never use a wallet that holds real funds.
3. **Free Sepolia test ETH** for that wallet, from a faucet (e.g. sepoliafaucet.com). A small amount covers thousands of proof transactions.
4. *(Optional)* an **Etherscan API key**, only if you want to verify the contract source on Etherscan.

---

## Steps

### 1. Deploy the contract

In `contracts/`, create a `.env` (see `contracts/.env.example`):

```
SEPOLIA_RPC_URL=<your Alchemy/Infura Sepolia URL>
BACKEND_WALLET_PRIVATE_KEY=<your test wallet private key>
ETHERSCAN_API_KEY=<optional>
```

Then:

```
cd contracts
npm run compile
npm run deploy:sepolia
```

The script prints the deployed `TransparencyRegistry` address. Copy it.

### 2. Point the backend at Sepolia

In `server/.env`, set:

```
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=<same Sepolia RPC URL>
BACKEND_WALLET_PRIVATE_KEY=<same test wallet private key>
CONTRACT_ADDRESS=<address printed in step 1>
```

Restart the server. `blockchain.service.ts` reads these lazily on first use; if any are missing it logs a warning and proof recording is simply disabled (donations still succeed).

### 3. Verify

Make a donation. Once the proof confirms (a few seconds on Sepolia), the donation detail page and the public `/verify` page show **"View transaction"** linking to Etherscan. The donor can open it and independently confirm the record exists and is immutable.

---

## What the donor sees on Etherscan (and what they don't)

The on-chain record is **proof only** (Decision 010, blockchain philosophy). Etherscan shows the transaction, block, timestamp, the contract it called, and the encoded proof hash. It does **not** show the donor's name or the amount in plaintext — those never leave PostgreSQL. So the trace proves *"this donation record exists and can never be altered"*; the human-readable details (campaign, amount) come from the app and the receipt. The `/verify` page ties the two together by recomputing the proof hash and checking it against the on-chain value.

Impact Points (Decision 022) are off-chain and never appear on Etherscan.
