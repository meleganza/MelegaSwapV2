import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ApprovalState } from 'hooks/useApproveCallback'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsRightLabel, LsRightRow, LsRightValue, LsSectionTitle } from './liquidityStudioPrimitives'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
`

const shortenAddress = (address?: string): string => {
  if (!address || address.length < 10) return '—'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

const formatReserves = (
  token0?: string,
  amount0?: number,
  token1?: string,
  amount1?: number,
): string => {
  if (!amount0 && !amount1) return '—'
  const left = amount0
    ? `${amount0 >= 1000 ? `${(amount0 / 1000).toFixed(1)}K` : amount0.toFixed(2)} ${token0 ?? ''}`
    : '—'
  const right = amount1
    ? `${amount1 >= 1000 ? `${(amount1 / 1000).toFixed(1)}K` : amount1.toFixed(2)} ${token1 ?? ''}`
    : '—'
  return `${left} / ${right}`
}

/** R761 — institutional LP readout (Pair, Reserves, LP Balance, Pool Address, Transaction). */
export const LiquidityLpInfoPanel: React.FC = () => {
  const {
    pairLabel,
    preview,
    machine,
    loadingLabel,
    phase,
    mode,
    selectedPosition,
    positionDetails,
    terminal,
    noLiquidity,
    approvalA,
    approvalB,
  } = useLiquidityRuntime()

  const pool = terminal.selectedPool
  const isRemove = mode === 'Remove Liquidity'

  const lpBalance = useMemo(() => {
    if (selectedPosition?.lpBalance) {
      return selectedPosition.lpBalance.toSignificant(4)
    }
    if (preview.expectedLp && preview.expectedLp !== '—') return preview.expectedLp
    return '—'
  }, [selectedPosition, preview.expectedLp])

  const reserves = formatReserves(
    pool?.token0.symbol,
    pool?.liquidityToken0,
    pool?.token1.symbol,
    pool?.liquidityToken1,
  )

  const transactionLabel = useMemo(() => {
    if (loadingLabel?.includes('Broadcasting')) return 'Broadcasting'
    if (phase === 'approval_required') return 'Awaiting approval'
    if (loadingLabel) return loadingLabel.replace('…', '')
    if (noLiquidity && !isRemove) return 'Create pair pending'
    return '—'
  }, [loadingLabel, phase, noLiquidity, isRemove])

  const rows = [
    { label: 'Pair', value: pairLabel || '—' },
    { label: 'Reserves', value: reserves },
    { label: 'LP Balance', value: lpBalance },
    { label: 'Pool Address', value: shortenAddress(machine.poolAddress ?? pool?.address) },
    { label: 'Transaction', value: transactionLabel },
  ]

  return (
    <LsPanel
      data-ls-panel
      data-ls-lp-info
      $width={liquidityStudioLayout.rightWidth}
      $height="auto"
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
      style={{ minHeight: liquidityStudioLayout.lpInfoMinHeight }}
    >
      <LsSectionTitle>LP information</LsSectionTitle>
      <Stack>
        {rows.map((row) => (
          <LsRightRow key={row.label}>
            <LsRightLabel>{row.label}</LsRightLabel>
            <LsRightValue title={row.value}>{row.value}</LsRightValue>
          </LsRightRow>
        ))}
        {(approvalA === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.NOT_APPROVED) && !isRemove ? (
          <LsRightRow>
            <LsRightLabel style={{ color: liquidityStudioColors.gold }}>Next step</LsRightLabel>
            <LsRightValue style={{ color: liquidityStudioColors.gold }}>Approve token</LsRightValue>
          </LsRightRow>
        ) : null}
        {positionDetails.usdValue != null ? (
          <LsRightRow>
            <LsRightLabel>Position value</LsRightLabel>
            <LsRightValue>${positionDetails.usdValue.toFixed(2)}</LsRightValue>
          </LsRightRow>
        ) : null}
      </Stack>
    </LsPanel>
  )
}

export default LiquidityLpInfoPanel
