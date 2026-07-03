import React, { createContext, useContext } from 'react'
import {
  useBuildOrchestrationRuntime,
  type BuildOrchestrationRuntime,
} from './useBuildOrchestrationRuntime'

const BuildRuntimeContext = createContext<BuildOrchestrationRuntime | null>(null)

export const BuildRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useBuildOrchestrationRuntime()
  return <BuildRuntimeContext.Provider value={runtime}>{children}</BuildRuntimeContext.Provider>
}

export function useBuildRuntime(): BuildOrchestrationRuntime {
  const ctx = useContext(BuildRuntimeContext)
  if (!ctx) {
    throw new Error('useBuildRuntime must be used within BuildRuntimeProvider')
  }
  return ctx
}

export default BuildRuntimeProvider
