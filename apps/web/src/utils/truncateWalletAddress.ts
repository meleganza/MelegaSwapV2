export default function truncateWalletAddress(address?: string | null): string {
  if (!address) return ''
  return address.length > 10 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
