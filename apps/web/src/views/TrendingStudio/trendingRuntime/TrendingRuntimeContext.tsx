import React, { createContext, useContext } from 'react'
import {
  useTrendingIntelligenceRuntime,
  type TrendingIntelligenceRuntime,
} from './useTrendingIntelligenceRuntime'

const TrendingRuntimeContext = createContext<TrendingIntelligenceRuntime | null>(null)

export const TrendingRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useTrendingIntelligenceRuntime()
  return <TrendingRuntimeContext.Provider value={runtime}>{children}</TrendingRuntimeContext.Provider>
}

export function useTrendingRuntime(): TrendingIntelligenceRuntime {
  const ctx = useContext(TrendingRuntimeContext)
  if (!ctx) {
    throw new Error('useTrendingRuntime must be used within TrendingRuntimeProvider')
  }
  return ctx
}

export default TrendingRuntimeProvider
