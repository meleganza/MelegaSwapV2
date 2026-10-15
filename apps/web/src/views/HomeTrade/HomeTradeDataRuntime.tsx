import React, { memo, startTransition, useEffect, useMemo } from 'react'
import useHomeTradeData from './useHomeTradeData'
import type { HomeCriticalData } from './HomeTradeDataContext'
import HomeFarmPoll from './HomeFarmPoll'
import { useHomeYieldVisibility } from './homeYieldVisibility'

export interface HomeTradeDataRuntimeProps {
  onData: React.Dispatch<React.SetStateAction<HomeCriticalData>>
}

/** Heavy Home market/yield producer, excluded from the critical route chunk. */
export const HomeTradeDataRuntime: React.FC<HomeTradeDataRuntimeProps> = ({ onData }) => {
  const yieldVisibility = useHomeYieldVisibility()
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
    startTransition(() => onData(criticalData))
  }, [criticalData, onData])

  return <HomeFarmPoll enabled={yieldVisibility.kpiNear || yieldVisibility.discoveryNear} />
}

export default memo(HomeTradeDataRuntime)
