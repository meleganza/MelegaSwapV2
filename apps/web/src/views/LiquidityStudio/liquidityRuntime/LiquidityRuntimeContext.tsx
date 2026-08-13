import React, { createContext, useContext } from 'react'
import {
  useLiquidityMintRuntime,
  type LiquidityMintRuntime,
  type LiquidityMintRuntimeOptions,
} from './useLiquidityMintRuntime'

const LiquidityRuntimeContext = createContext<LiquidityMintRuntime | null>(null)

type LiquidityRuntimeProviderProps = LiquidityMintRuntimeOptions & { children: React.ReactNode }

export const LiquidityRuntimeProvider: React.FC<LiquidityRuntimeProviderProps> = ({ children, ...options }) => {
  const runtime = useLiquidityMintRuntime(options)
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
