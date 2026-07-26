/**
 * Smart Swap Module 004 — Fee Transparency panel (presentation only).
 * No fee mutation, Treasury execution, or KERL authority.
 */

import React from 'react'
import styled from 'styled-components'
import type { SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'

const UNAVAILABLE = '—'

const Root = styled.section`
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(2, 6, 23, 0.55);
  color: #e2e8f0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`

const Title = styled.h4`
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
`

const Flow = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
`

const Step = styled.li`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  font-size: 12px;
`

const Label = styled.span`
  color: #94a3b8;
`

const Value = styled.span`
  text-align: right;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
`

const Arrow = styled.li`
  color: #64748b;
  font-size: 11px;
  text-align: center;
  line-height: 1;
  list-style: none;
`

const Note = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: #94a3b8;
`

const StateBadge = styled.span<{ $state: string }>`
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: ${({ $state }) =>
    $state === 'AVAILABLE' ? '#86efac' : $state === 'PARTIAL' ? '#fcd34d' : '#fca5a5'};
`

export type SmartSwapFeeTransparencyPanelProps = {
  model: SmartSwapFeeTransparency
}

export function SmartSwapFeeTransparencyPanel({ model }: SmartSwapFeeTransparencyPanelProps) {
  const showUnavailableCopy =
    model.state === 'UNAVAILABLE' || model.state === 'NOT_APPLICABLE' || model.state === 'STALE'

  return (
    <Root
      data-smart-swap-module="004"
      data-fee-state={model.state}
      data-fee-source={model.source}
    >
      <Title>
        Fee transparency
        <StateBadge $state={model.state}>{model.state.replace(/_/g, ' ')}</StateBadge>
      </Title>

      {showUnavailableCopy && !model.flowSteps.some((s) => s.label === 'Protocol fee' && s.value !== 'Fee information unavailable') ? (
        <Note role="status">{model.unavailableReason ?? 'Fee information unavailable'}</Note>
      ) : (
        <Flow aria-label="Fee transparency flow">
          {model.flowSteps.map((step, i) => (
            <React.Fragment key={`${step.label}-${i}`}>
              {i > 0 ? <Arrow aria-hidden>↓</Arrow> : null}
              <Step>
                <Label>{step.label}</Label>
                <Value>{step.value || UNAVAILABLE}</Value>
              </Step>
            </React.Fragment>
          ))}
        </Flow>
      )}

      <Note>{model.explanation}</Note>
      {model.freshness ? <Note>Freshness: {model.freshness}</Note> : null}
    </Root>
  )
}
