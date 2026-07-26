import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'
import { useTradeRuntime } from '../tradeRuntime/TradeRuntimeContext'

const Strip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  margin: 0 0 10px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(244, 196, 48, 0.08);
  border: 1px solid rgba(244, 196, 48, 0.16);
  flex-shrink: 0;
`

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${tradeColors.gold};
  flex-shrink: 0;
  animation: trade-status-pulse 1.2s ease-in-out infinite;

  @keyframes trade-status-pulse {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
  }
`

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #f0e6c8;
  line-height: 1.2;
`

function statusForPhase(phase: string, loadingLabel?: string): string | null {
  switch (phase) {
    case 'routing':
      return loadingLabel ?? 'Loading quote'
    case 'wallet_required':
      return 'Waiting wallet'
    case 'approval_required':
      return 'Preparing transaction'
    case 'ready':
      return null
    case 'error':
      return null
    default:
      return null
  }
}

/** Presentation-only feedback so Instant/Smart never leave the user without status. */
export const TradeExecutionStatusStrip: React.FC = () => {
  const { phase, loadingLabel } = useTradeRuntime()
  const label = statusForPhase(phase, loadingLabel)
  if (!label) return null

  return (
    <Strip data-trade-execution-status data-trade-status-phase={phase} role="status" aria-live="polite">
      <Dot aria-hidden />
      <Label>{label}</Label>
    </Strip>
  )
}

export default TradeExecutionStatusStrip
