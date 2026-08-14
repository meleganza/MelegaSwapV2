/**
 * Args for Factory.activeProgram(owner, projectToken, quoteAsset, pair).
 * Returns null when any required input is missing — callers must skip the eth_call.
 */
export function activeProgramCallArgs(
  owner: string | null | undefined,
  projectToken: string | null | undefined,
  quoteAsset: string | null | undefined,
  pair: string | null | undefined,
): [string, string, string, string] | null {
  if (!owner || !projectToken || !quoteAsset || !pair) return null
  if (![owner, projectToken, quoteAsset, pair].every((a) => /^0x[a-fA-F0-9]{40}$/.test(a))) return null
  return [owner, projectToken, quoteAsset, pair]
}
