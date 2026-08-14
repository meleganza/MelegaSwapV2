import React, { startTransition, useEffect, useMemo } from 'react'
import useHomeTradeData from './useHomeTradeData'
import type { HomeCriticalData } from './HomeTradeDataContext'

export interface HomeTradeDataRuntimeProps {
  onData: React.Dispatch<React.SetStateAction<HomeCriticalData>>
}

/** Heavy Home market/yield producer, excluded from the critical route chunk. */
export const HomeTradeDataRuntime: React.FC<HomeTradeDataRuntimeProps> = ({ onData }) => {
  const data = useHomeTradeData()
  const criticalData = useMemo<HomeCriticalData>(
    () => ({
      farmRows: data.farmRows,
      homeTopMoversEntries: data.homeTopMoversEntries,
      indexedRibbonAssets: data.indexedRibbonAssets,
      liveEconomyMetrics: data.liveEconomyMetrics,
      marketCards: data.marketCards,
      poolRows: data.poolRows,
      topMoversPrefixResult: data.topMoversPrefixResult,
      topMoversSnapshotId: data.topMoversSnapshotId,
    }),
    [
      data.farmRows,
      data.homeTopMoversEntries,
      data.indexedRibbonAssets,
      data.liveEconomyMetrics,
      data.marketCards,
      data.poolRows,
      data.topMoversPrefixResult,
      data.topMoversSnapshotId,
    ],
  )

  useEffect(() => {
    // Farm/pool and market refreshes must not pre-empt input or the global
    // compositor-driven ticker. React may interrupt and resume this update.
    startTransition(() => onData(criticalData))
  }, [criticalData, onData])

  return null
}

export default HomeTradeDataRuntime
