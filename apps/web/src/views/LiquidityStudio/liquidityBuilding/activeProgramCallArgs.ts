/**
 * Args for Factory.activeProgram(owner, projectToken).
 * Returns null when the call must be skipped.
 *
 * Important: `useSingleCallResult` treats `inputs === undefined` as a valid *zero-arg*
 * encode (see isValidMethodArgs in state/multicall/hooks). Passing undefined for a
 * 2-arg method throws ethers INVALID_ARGUMENT "types/values length mismatch" and
 * crashes /liquidity/ under the Sentry Error Boundary.
 */
export function activeProgramCallArgs(
  owner: string | null | undefined,
  projectTokenAddress: string | null | undefined,
): [string, string] | null {
  if (!owner || !projectTokenAddress) return null
  return [owner, projectTokenAddress]
}
