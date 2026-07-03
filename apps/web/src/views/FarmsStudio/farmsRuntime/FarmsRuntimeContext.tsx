import React, { createContext, useContext } from 'react'
import { useFarmsStakingRuntime, type FarmsStakingRuntime } from './useFarmsStakingRuntime'

const FarmsRuntimeContext = createContext<FarmsStakingRuntime | null>(null)

export const FarmsRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useFarmsStakingRuntime()
  return <FarmsRuntimeContext.Provider value={runtime}>{children}</FarmsRuntimeContext.Provider>
}

export function useFarmsRuntime(): FarmsStakingRuntime {
  const ctx = useContext(FarmsRuntimeContext)
  if (!ctx) {
    throw new Error('useFarmsRuntime must be used within FarmsRuntimeProvider')
  }
  return ctx
}

export default FarmsRuntimeProvider
