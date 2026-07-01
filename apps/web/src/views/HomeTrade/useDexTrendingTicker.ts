import { useMemo } from 'react'
import type { MelegaTickerItem } from 'design-system/melega'
import useHomeTradeData from './useHomeTradeData'

export const useDexTrendingTicker = (): { items: MelegaTickerItem[]; isIndexing: boolean } => {
  const { trendingTickerItems } = useHomeTradeData()

  return useMemo(
    () => ({
      items: trendingTickerItems,
      isIndexing: trendingTickerItems.length === 0,
    }),
    [trendingTickerItems],
  )
}

export default useDexTrendingTicker
