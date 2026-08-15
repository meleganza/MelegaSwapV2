import dynamic from 'next/dynamic'
import React, { createContext, startTransition, useContext, useEffect, useState } from 'react'
import type useHomeTradeData from './useHomeTradeData'

export type HomeCriticalData = Pick<
  ReturnType<typeof useHomeTradeData>,
  | 'farmRows'
  | 'homeTopMoversEntries'
  | 'indexedRibbonAssets'
  | 'liveEconomyMetrics'
  | 'marketCards'
  | 'poolRows'
  | 'topMoversPrefixResult'
  | 'topMoversSnapshotId'
>

const EMPTY_HOME_DATA: HomeCriticalData = {
  farmRows: [],
  homeTopMoversEntries: [],
  indexedRibbonAssets: [],
  liveEconomyMetrics: [],
  marketCards: [],
  poolRows: [],
  topMoversPrefixResult: 'IDENTICAL_PREFIX',
  topMoversSnapshotId: 'tm-pending-home-runtime',
}

const HomeTradeDataContext = createContext<HomeCriticalData>(EMPTY_HOME_DATA)

const HomeTradeDataRuntime = dynamic(() => import('./HomeTradeDataRuntime'), {
  ssr: false,
  loading: () => null,
})

/** Critical Home UI renders immediately; market/yield producers join after the first paint. */
export const HomeTradeDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [value, setValue] = useState<HomeCriticalData>(EMPTY_HOME_DATA)
  const [runtimeReady, setRuntimeReady] = useState(false)

  useEffect(() => {
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(() => startTransition(() => setRuntimeReady(true)), {
        // Ranking cards are above the fold. Keep the producer out of the first
        // paint without postponing Farms long after the other three cards.
        timeout: 120,
      })
      return () => idleWindow.cancelIdleCallback?.(idleHandle)
    }

    const timeoutHandle = window.setTimeout(() => startTransition(() => setRuntimeReady(true)), 0)
    return () => window.clearTimeout(timeoutHandle)
  }, [])

  return (
    <HomeTradeDataContext.Provider value={value}>
      {runtimeReady ? <HomeTradeDataRuntime onData={setValue} /> : null}
      {children}
    </HomeTradeDataContext.Provider>
  )
}

export const useHomeCriticalData = () => useContext(HomeTradeDataContext)

export default HomeTradeDataProvider
