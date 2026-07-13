import { ethers, network } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying to network: ${network.name}`)
  console.log(`Deployer (backend wallet): ${deployer.address}`)

  const registry = await ethers.deployContract('TransparencyRegistry')
  await registry.waitForDeployment()

  const address = await registry.getAddress()
  console.log(`TransparencyRegistry deployed to: ${address}`)
  console.log('Set CONTRACT_ADDRESS in the server .env to this address.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
