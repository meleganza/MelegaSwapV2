/**
 * Compact Execution Preview — primary metrics only.
 * Secondary diagnostics live in the parent details accordion.
 */

import styled from 'styled-components'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import { formatImpactLabel } from 'lib/smart-swap-execution-preview'
import { formatGasEstimateDisplay } from './formatGasEstimateDisplay'

const UNAVAILABLE = '—'

const Root = styled.section`
  width: 100%;
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
`

const Failure = styled.div`
  font-size: 12px;
  line-height: 1.45;
  color: #fbbf24;
`

const Grid = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 10px;
  font-size: 12px;
`

const Dt = styled.dt`
  margin: 0;
  color: #9ca3af;
`

const Dd = styled.dd`
  margin: 0;
  text-align: right;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
`

const GasBlock = styled.div<{ $tone: 'ok' | 'muted' | 'warn' }>`
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.22);
  color: ${({ $tone }) => ($tone === 'ok' ? '#22c55e' : '#9ca3af')};
`

const GasTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
`

const GasDetail = styled.div`
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.35;
  color: #9ca3af;
`

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Dt>{label}</Dt>
      <Dd>{value}</Dd>
    </>
  )
}

export type SmartSwapExecutionPreviewPanelProps = {
  result: SmartSwapPreviewResult
  /** When true, hide title (parent accordion supplies heading). */
  embedded?: boolean
}

export function SmartSwapExecutionPreviewPanel({
  result,
  embedded = false,
}: SmartSwapExecutionPreviewPanelProps) {
  if (result.status !== 'ok' || !result.preview) {
    const failure = result.status === 'failure' ? result : null
    const isGasOnly = failure?.failure === 'GAS_UNAVAILABLE'
    return (
      <Root
        data-smart-swap-module="003"
        data-preview-state="failure"
        data-failure-code={failure?.failure ?? 'EXECUTION_UNAVAILABLE'}
      >
        {!embedded ? <Title>Execution preview</Title> : null}
        <Failure role="status" style={isGasOnly ? { color: '#9ca3af' } : undefined}>
          {isGasOnly
            ? 'Gas estimate unavailable. Wallet will verify before signing.'
            : `${(failure?.failure ?? 'EXECUTION_UNAVAILABLE').replace(/_/g, ' ')}${
                failure?.message ? ` — ${failure.message}` : ''
              }`}
        </Failure>
      </Root>
    )
  }

  const p = result.preview
  const impactLabel = formatImpactLabel(p.priceImpactPercent, p.priceImpactSeverity)
  const feeDisplay =
    p.protocolFee.availability === 'available' && p.protocolFee.bps != null
      ? p.protocolFee.label
      : UNAVAILABLE
  const minDisplay = p.minimumReceivedFormatted ?? UNAVAILABLE
  const expectedDisplay = p.expectedOutputFormatted ?? UNAVAILABLE
  const gas = formatGasEstimateDisplay({
    availability: p.gasEstimateAvailability,
    units: p.gasEstimateUnits,
  })

  return (
    <Root data-smart-swap-module="003" data-preview-state="ready" data-route-id={p.routeId}>
      {!embedded ? <Title>Execution preview</Title> : null}
      <Grid>
        <Row label="Input" value={`${p.inputAmount} ${p.inputToken.symbol}`} />
        <Row label="Expected" value={`${expectedDisplay} ${p.outputToken.symbol}`} />
        <Row label="Minimum received" value={`${minDisplay} ${p.outputToken.symbol}`} />
        <Row label="Slippage" value={`${(p.slippageBips / 100).toFixed(2)}%`} />
        <Row label="Price impact" value={impactLabel} />
        <Row label="Protocol fee" value={feeDisplay} />
      </Grid>
      <GasBlock $tone={gas.tone} data-gas-state={gas.state}>
        <GasTitle>{gas.title}</GasTitle>
        {gas.detail ? <GasDetail>{gas.detail}</GasDetail> : null}
      </GasBlock>
    </Root>
  )
}
