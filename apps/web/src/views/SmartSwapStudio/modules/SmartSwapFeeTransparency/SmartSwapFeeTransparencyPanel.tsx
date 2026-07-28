/**
 * Smart Swap Module 004 — Fee Transparency (compact card).
 * No fee mutation, Treasury execution, or KERL authority.
 */

import styled from 'styled-components'
import type { SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'

const UNAVAILABLE = '—'

const Root = styled.section`
  width: 100%;
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
  color: #9ca3af;
`

const Flow = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
`

const Step = styled.li`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  font-size: 12px;
`

const Label = styled.span`
  color: #9ca3af;
`

const Value = styled.span`
  text-align: right;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
`

const Note = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: #9ca3af;
`

/** Compact fee rows: Protocol Fee → Treasury Runtime → KERL. */
function compactFeeRows(model: SmartSwapFeeTransparency): Array<{ label: string; value: string }> {
  const protocol =
    model.flowSteps.find((s) => /protocol fee/i.test(s.label))?.value ||
    model.unavailableReason ||
    UNAVAILABLE
  const treasury =
    model.flowSteps.find((s) => /destination|treasury/i.test(s.label))?.value ||
    model.treasuryDestination ||
    'Treasury Runtime'
  const kerl =
    model.flowSteps.find((s) => /attribution|kerl/i.test(s.label))?.value ||
    model.economicAttribution ||
    'KERL'

  return [
    { label: 'Protocol Fee', value: protocol },
    { label: 'Treasury Runtime', value: treasury },
    { label: 'KERL attribution', value: kerl },
  ]
}

export type SmartSwapFeeTransparencyPanelProps = {
  model: SmartSwapFeeTransparency
  compact?: boolean
}

export function SmartSwapFeeTransparencyPanel({ model, compact = false }: SmartSwapFeeTransparencyPanelProps) {
  const showUnavailableCopy =
    model.state === 'UNAVAILABLE' || model.state === 'NOT_APPLICABLE' || model.state === 'STALE'

  if (compact) {
    const rows = compactFeeRows(model)
    return (
      <Root
        data-smart-swap-module="004"
        data-fee-state={model.state}
        data-fee-source={model.source}
        data-fee-compact="true"
      >
        <Title>Fee</Title>
        <Flow aria-label="Fee transparency">
          {rows.map((step) => (
            <Step key={step.label}>
              <Label>{step.label}</Label>
              <Value>{step.value || UNAVAILABLE}</Value>
            </Step>
          ))}
        </Flow>
      </Root>
    )
  }

  return (
    <Root
      data-smart-swap-module="004"
      data-fee-state={model.state}
      data-fee-source={model.source}
      data-fee-compact="false"
    >
      <Title>Fee transparency</Title>

      {showUnavailableCopy &&
      !model.flowSteps.some((s) => s.label === 'Protocol fee' && s.value !== 'Fee information unavailable') ? (
        <Note role="status">{model.unavailableReason ?? 'Fee information unavailable'}</Note>
      ) : (
        <Flow aria-label="Fee transparency flow">
          {model.flowSteps.map((step, i) => (
            <Step key={`${step.label}-${i}`}>
              <Label>{step.label}</Label>
              <Value>{step.value || UNAVAILABLE}</Value>
            </Step>
          ))}
        </Flow>
      )}
    </Root>
  )
}
