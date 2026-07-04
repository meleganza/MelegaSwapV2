import React, { createContext, useContext } from 'react'
import type { TradeMode } from './tradeTokens'

export interface TradeUiState {
  mode: TradeMode
  setMode: (mode: TradeMode) => void
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
}

const TradeUiContext = createContext<TradeUiState | null>(null)

export const TradeUiProvider: React.FC<{ value: TradeUiState; children: React.ReactNode }> = ({
  value,
  children,
}) => <TradeUiContext.Provider value={value}>{children}</TradeUiContext.Provider>

export function useTradeUi(): TradeUiState {
  const ctx = useContext(TradeUiContext)
  if (!ctx) {
    throw new Error('useTradeUi must be used within TradeUiProvider')
  }
  return ctx
}

export default TradeUiProvider
