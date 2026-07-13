import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('TransparencyRegistry', () => {
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes('donation-1'))

  it('records and verifies a donation proof', async () => {
    const registry = await ethers.deployContract('TransparencyRegistry')
    await registry.registerDonation(1, 10, proofHash)

    expect(await registry.verifyDonation(1, proofHash)).to.equal(true)
    expect(await registry.donationCount()).to.equal(1n)

    const proof = await registry.getDonation(1)
    expect(proof.campaignId).to.equal(10n)
    expect(proof.proofHash).to.equal(proofHash)
  })

  it('rejects duplicate donation proofs', async () => {
    const registry = await ethers.deployContract('TransparencyRegistry')
    await registry.registerDonation(1, 10, proofHash)

    await expect(registry.registerDonation(1, 10, proofHash)).to.be.revertedWithCustomError(
      registry,
      'ProofAlreadyExists',
    )
  })

  it('blocks a non-owner from recording proofs', async () => {
    const registry = await ethers.deployContract('TransparencyRegistry')
    const [, other] = await ethers.getSigners()

    await expect(
      registry.connect(other).registerDonation(1, 10, proofHash),
    ).to.be.revertedWithCustomError(registry, 'NotOwner')
  })

  it('records donation and disbursement independently', async () => {
    const registry = await ethers.deployContract('TransparencyRegistry')
    const disbHash = ethers.keccak256(ethers.toUtf8Bytes('disbursement-1'))

    await registry.registerDonation(1, 10, proofHash)
    await registry.registerDisbursement(1, 10, disbHash)

    expect(await registry.verifyDisbursement(1, disbHash)).to.equal(true)
    expect(await registry.disbursementCount()).to.equal(1n)
  })
})
