const EVM_ADDRESS = /^0x[a-f0-9]{40}$/

function normalizedAddress(value?: string | null): string | null {
  const address = value?.trim().toLowerCase() ?? ''
  return EVM_ADDRESS.test(address) ? address : null
}

export type PairResponseIdentity = {
  chainId?: number
  pairAddress?: string | null
  tokenAddress?: string | null
}

/** Prevent stale SWR data for a previous pool from appearing under the newly selected pair. */
export function pairResponseMatchesRequest(
  response: PairResponseIdentity | null | undefined,
  expectedChainId: number | undefined,
  expectedPairAddress?: string | null,
  expectedTokenAddress?: string | null,
): boolean {
  const pair = normalizedAddress(expectedPairAddress)
  const token = normalizedAddress(expectedTokenAddress)
  if (!response || !Number.isFinite(expectedChainId) || !pair) return false
  if (response.chainId !== expectedChainId || normalizedAddress(response.pairAddress) !== pair) return false
  return token ? normalizedAddress(response.tokenAddress) === token : true
}
