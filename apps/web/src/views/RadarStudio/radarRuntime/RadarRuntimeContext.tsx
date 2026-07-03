import React, { createContext, useContext } from 'react'
import {
  useRadarIntelligenceRuntime,
  type RadarIntelligenceRuntime,
} from './useRadarIntelligenceRuntime'

const RadarRuntimeContext = createContext<RadarIntelligenceRuntime | null>(null)

export const RadarRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useRadarIntelligenceRuntime()
  return <RadarRuntimeContext.Provider value={runtime}>{children}</RadarRuntimeContext.Provider>
}

export function useRadarRuntime(): RadarIntelligenceRuntime {
  const ctx = useContext(RadarRuntimeContext)
  if (!ctx) {
    throw new Error('useRadarRuntime must be used within RadarRuntimeProvider')
  }
  return ctx
}

export default RadarRuntimeProvider
