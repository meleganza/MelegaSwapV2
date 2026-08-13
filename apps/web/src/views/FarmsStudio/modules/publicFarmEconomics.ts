export type FarmAprInputs = {
  dailyRewardTokens: number
  rewardTokenUsd?: number | null
  pairTvlBnb?: number | null
  bnbUsd?: number | null
}

/**
 * Returns a factual annual percentage rate from live token and pair inputs.
 * Missing or invalid market data must stay unavailable rather than becoming mock data.
 */
export function computeFarmAprPercent({
  dailyRewardTokens,
  rewardTokenUsd,
  pairTvlBnb,
  bnbUsd,
}: FarmAprInputs): number | null {
  if (
    !Number.isFinite(dailyRewardTokens) ||
    dailyRewardTokens <= 0 ||
    rewardTokenUsd == null ||
    !Number.isFinite(rewardTokenUsd) ||
    rewardTokenUsd <= 0 ||
    pairTvlBnb == null ||
    !Number.isFinite(pairTvlBnb) ||
    pairTvlBnb <= 0 ||
    bnbUsd == null ||
    !Number.isFinite(bnbUsd) ||
    bnbUsd <= 0
  ) {
    return null
  }

  const apr = ((dailyRewardTokens * rewardTokenUsd * 365) / (pairTvlBnb * bnbUsd)) * 100
  return Number.isFinite(apr) ? apr : null
}
