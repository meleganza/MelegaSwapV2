import BigNumber from 'bignumber.js'

export async function fetchCurrentLotteryIdAndMaxBuy(): Promise<{ currentLotteryId: string }> {
  return { currentLotteryId: '0' }
}

export async function fetchLottery(_lotteryId?: string): Promise<{ amountCollectedInDexToken: BigNumber }> {
  return { amountCollectedInDexToken: new BigNumber(0) }
}
