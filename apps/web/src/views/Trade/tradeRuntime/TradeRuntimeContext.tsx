import React, { createContext, useContext } from 'react'
import { useTradeSwapRuntime, type TradeSwapRuntime } from './useTradeSwapRuntime'

const TradeRuntimeContext = createContext<TradeSwapRuntime | null>(null)

export const TradeRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useTradeSwapRuntime()
  return <TradeRuntimeContext.Provider value={runtime}>{children}</TradeRuntimeContext.Provider>
}

export function useTradeRuntime(): TradeSwapRuntime {
  const ctx = useContext(TradeRuntimeContext)
  if (!ctx) {
    throw new Error('useTradeRuntime must be used within TradeRuntimeProvider')
  }
  return ctx
}

export default TradeRuntimeProvider
