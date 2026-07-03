import React, { createContext, useContext } from 'react'
import { usePoolsStakingRuntime, type PoolsStakingRuntime } from './usePoolsStakingRuntime'

const PoolsRuntimeContext = createContext<PoolsStakingRuntime | null>(null)

export const PoolsRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = usePoolsStakingRuntime()
  return <PoolsRuntimeContext.Provider value={runtime}>{children}</PoolsRuntimeContext.Provider>
}

export function usePoolsRuntime(): PoolsStakingRuntime {
  const ctx = useContext(PoolsRuntimeContext)
  if (!ctx) {
    throw new Error('usePoolsRuntime must be used within PoolsRuntimeProvider')
  }
  return ctx
}

export default PoolsRuntimeProvider
