import React, { createContext, useContext } from 'react'
import { useLiquidityMintRuntime, type LiquidityMintRuntime } from './useLiquidityMintRuntime'

const LiquidityRuntimeContext = createContext<LiquidityMintRuntime | null>(null)

export const LiquidityRuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runtime = useLiquidityMintRuntime()
  return <LiquidityRuntimeContext.Provider value={runtime}>{children}</LiquidityRuntimeContext.Provider>
}

export function useLiquidityRuntime(): LiquidityMintRuntime {
  const ctx = useContext(LiquidityRuntimeContext)
  if (!ctx) {
    throw new Error('useLiquidityRuntime must be used within LiquidityRuntimeProvider')
  }
  return ctx
}

export default LiquidityRuntimeProvider
