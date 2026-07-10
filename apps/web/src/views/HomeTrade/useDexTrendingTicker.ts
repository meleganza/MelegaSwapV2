import useHomeTradeData from './useHomeTradeData'

export default function useDexTrendingTicker() {
  const { trendingTickerItems, indexedRibbonAssets, trendingUnavailableReason } = useHomeTradeData()

  return {
    items: trendingTickerItems,
    indexedRibbonAssets,
    unavailableReason: trendingUnavailableReason,
  }
}
