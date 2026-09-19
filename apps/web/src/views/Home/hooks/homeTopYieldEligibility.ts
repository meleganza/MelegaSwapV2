/** Home highlights require a known, finite USD TVL on every chain. */
export const HOME_TOP_YIELD_MIN_TVL_USD = 250

export function meetsHomeTopYieldTvl(tvlUsd: number | null | undefined): boolean {
  return typeof tvlUsd === 'number' && Number.isFinite(tvlUsd) && tvlUsd >= HOME_TOP_YIELD_MIN_TVL_USD
}
