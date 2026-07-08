import { useMemo } from 'react'
import type { MelegaTickerItem } from 'design-system/melega'
import useHomeTradeData from './useHomeTradeData'

export const useDexTrendingTicker = (): { items: MelegaTickerItem[]; isIndexing: boolean } => {
  const { trendingTickerItems, isTrendingIndexing } = useHomeTradeData()

  return useMemo(
    () => ({
      items: trendingTickerItems,
      isIndexing: isTrendingIndexing,
    }),
    [trendingTickerItems, isTrendingIndexing],
  )
}

export default useDexTrendingTicker
