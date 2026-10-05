import BigNumber from 'bignumber.js'

export type FarmLpHolding = {
  chainId: number
  pairAddress: string
  stakedLpRaw: string
  totalSupplyRaw: string
  poolTvlUsd: string
}

export type FarmLpReconciliation = {
  farmLpValueUsd: string
  alreadyIncludedInPoolTvlUsd: string
  globalDexLiquidityUsd: string
}

/** Farm-held LP is a share of reserves already counted by whole-pool TVL. */
export function reconcileFarmLpHoldings(
  globalPoolTvlUsd: string,
  holdings: FarmLpHolding[],
): FarmLpReconciliation {
  const farmLpValue = holdings.reduce((total, holding) => {
    const supply = new BigNumber(holding.totalSupplyRaw)
    if (!supply.isPositive()) return total
    return total.plus(new BigNumber(holding.poolTvlUsd).times(holding.stakedLpRaw).div(supply))
  }, new BigNumber(0))
  return {
    farmLpValueUsd: farmLpValue.toFixed(),
    alreadyIncludedInPoolTvlUsd: farmLpValue.toFixed(),
    globalDexLiquidityUsd: new BigNumber(globalPoolTvlUsd).toFixed(),
  }
}
