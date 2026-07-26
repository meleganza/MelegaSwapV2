/**
 * Smart Swap Module 003 — Execution Preview panel (presentation only).
 * No signing, custody, or Router execution.
 */

import React from 'react'
import styled from 'styled-components'
import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import { formatImpactLabel } from 'lib/smart-swap-execution-preview'

const UNAVAILABLE = '—'

const Root = styled.section`
  width: 100%;
  margin-top: 10px;
  padding: 12px 12px 10px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.96) 100%);
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
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
  color: #94a3b8;
`

const Dd = styled.dd`
  margin: 0;
  text-align: right;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
`

const RouteViz = styled.ol`
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #e2e8f0;
`

const Arrow = styled.li`
  color: #64748b;
  font-size: 11px;
  line-height: 1;
`

const Hop = styled.li<{ $muted?: boolean }>`
  text-align: center;
  font-weight: ${({ $muted }) => ($muted ? 500 : 600)};
  color: ${({ $muted }) => ($muted ? '#cbd5e1' : '#f8fafc')};
`

const WarnList = styled.ul`
  margin: 8px 0 0;
  padding: 0 0 0 14px;
  color: #fca5a5;
  font-size: 11px;
`

const Confidence = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
`

const ImpactHigh = styled.span`
  color: #f87171;
  font-weight: 700;
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
}

export function SmartSwapExecutionPreviewPanel({ result }: SmartSwapExecutionPreviewPanelProps) {
  if (result.status !== 'ok' || !result.preview) {
    const failure = result.status === 'failure' ? result : null
    return (
      <Root
        data-smart-swap-module="003"
        data-preview-state="failure"
        data-failure-code={failure?.failure ?? 'EXECUTION_UNAVAILABLE'}
      >
        <Title>Execution preview</Title>
        <Failure role="status">
          {(failure?.failure ?? 'EXECUTION_UNAVAILABLE').replace(/_/g, ' ')}
          {failure?.message ? ` — ${failure.message}` : ''}
        </Failure>
        <Confidence>Preview is not ready. This panel does not execute swaps.</Confidence>
      </Root>
    )
  }

  const p = result.preview
  const impactLabel = formatImpactLabel(p.priceImpactPercent, p.priceImpactSeverity)
  const impactHigh = p.priceImpactSeverity === 'HIGH'
  const gasDisplay =
    p.gasEstimateAvailability === 'available' && p.gasEstimateUnits != null
      ? String(p.gasEstimateUnits)
      : UNAVAILABLE
  const feeDisplay =
    p.protocolFee.availability === 'available' && p.protocolFee.bps != null
      ? p.protocolFee.label
      : UNAVAILABLE
  const minDisplay = p.minimumReceivedFormatted ?? UNAVAILABLE
  const expectedDisplay = p.expectedOutputFormatted ?? UNAVAILABLE

  return (
    <Root data-smart-swap-module="003" data-preview-state="ready" data-route-id={p.routeId}>
      <Title>Execution preview</Title>
      <Grid>
        <Row label="Input" value={`${p.inputAmount} ${p.inputToken.symbol}`} />
        <Row label="Output (expected)" value={`${expectedDisplay} ${p.outputToken.symbol}`} />
        <Row label="Minimum received" value={`${minDisplay} ${p.outputToken.symbol}`} />
        <Row label="Slippage" value={`${(p.slippageBips / 100).toFixed(2)}%`} />
        <Row label="Price impact" value={impactLabel} />
        {impactHigh ? (
          <>
            <Dt />
            <Dd>
              <ImpactHigh>High impact — not hidden</ImpactHigh>
            </Dd>
          </>
        ) : null}
        <Row label="Gas estimate" value={gasDisplay} />
        <Row label="Protocol fee" value={feeDisplay} />
        <Row label="Confidence" value={`${p.confidence}%`} />
        <Row label="Freshness" value={p.freshness ?? UNAVAILABLE} />
      </Grid>

      {p.hopVisualization.length > 0 ? (
        <RouteViz aria-label="Route hops">
          {p.hopVisualization.map((step, i) => (
            <React.Fragment key={`${step.kind}-${step.label}-${i}`}>
              {i > 0 ? <Arrow aria-hidden>↓</Arrow> : null}
              <Hop $muted={step.kind === 'pool'}>{step.label}</Hop>
            </React.Fragment>
          ))}
        </RouteViz>
      ) : null}

      {p.warnings.length > 0 ? (
        <WarnList>
          {p.warnings.map((w) => (
            <li key={w.code}>
              {w.message} <span style={{ opacity: 0.7 }}>({w.source})</span>
            </li>
          ))}
        </WarnList>
      ) : null}

      <Confidence>
        {p.explanation} Factors: {p.confidenceFactors.join('; ')}.
      </Confidence>
    </Root>
  )
}
