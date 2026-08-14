/**
 * Canonical SmartChef / pool contract explorer link for Pools Studio cards.
 */
export function resolvePoolContractAddress(input: {
  contractAddress?: string | null
  explorerUrl?: string | null
  contractExplorerUrl?: string | null
}): string | null {
  const direct = input.contractAddress?.trim()
  if (direct && /^0x[a-fA-F0-9]{40}$/.test(direct)) return direct

  for (const url of [input.contractExplorerUrl, input.explorerUrl]) {
    if (!url) continue
    const match = url.match(/0x[a-fA-F0-9]{40}/)
    if (match) return match[0]
  }
  return null
}

export function poolBscScanContractUrl(address: string | null | undefined): string | null {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return null
  return `https://bscscan.com/address/${address}`
}
