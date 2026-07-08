export function normalizeTokenAddress(address?: string | null): string | undefined {
  if (!address) return undefined
  return address.toLowerCase()
}
