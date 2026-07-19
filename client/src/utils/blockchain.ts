/** Public block explorer URL for a transaction, or null when the network has none (local dev). */
export function blockExplorerUrl(network: string | null, txHash: string | null): string | null {
  if (!txHash) return null
  if (network === 'Sepolia') return `https://sepolia.etherscan.io/tx/${txHash}`
  return null
}
