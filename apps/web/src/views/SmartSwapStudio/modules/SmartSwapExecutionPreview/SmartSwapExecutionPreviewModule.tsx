import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { formatImpactLabel } from 'lib/smart-swap-execution-preview'
import { SmartSwapExecutionPreviewPanel } from './SmartSwapExecutionPreviewPanel'
import { SmartSwapVisualRoute } from './SmartSwapVisualRoute'
import { SmartSwapCompactMetrics } from './SmartSwapCompactMetrics'
import { SmartSwapInsightCard } from './SmartSwapInsightCard'
import { resolveExecutionSourceLabel } from './resolveExecutionSourceLabel'
import { useSmartSwapExecutionPreview } from './useSmartSwapExecutionPreview'
import { useSmartSwapFeeTransparency } from 'views/SmartSwapStudio/modules/SmartSwapFeeTransparency'
import { SmartSwapFeeTransparencyPanel } from 'views/SmartSwapStudio/modules/SmartSwapFeeTransparency'
import { useSmartSwapAIAssistance } from 'views/SmartSwapStudio/modules/SmartSwapAIAssistance'
import {
  SmartSwapExecutionHandoffPanel,
  useSmartSwapExecutionHandoff,
} from 'views/SmartSwapStudio/modules/SmartSwapExecutionHandoff'

export type SmartSwapIntelMode = 'instant' | 'smart'

export type SmartSwapExecutionPreviewModuleProps = {
  /** @deprecated use mode */
  showSmartTransparency?: boolean
  /** Instant = Details only; Smart = Route/Metrics/Fee/AI + Details */
  mode?: SmartSwapIntelMode
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;

  /* Explicit visual order — Swap CTA lives outside this stack. */
  & > [data-smart-route-card] {
    order: 1;
  }
  & > [data-smart-compact-metrics] {
    order: 2;
  }
  & > [data-smart-swap-module='004'] {
    order: 3;
  }
  & > [data-insight='ai'] {
    order: 4;
  }
  & > [data-execution-details-accordion] {
    order: 5;
  }
`

const AccordionShell = styled.div`
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.22);
  overflow: hidden;
`

const Toggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  &:focus-visible {
    outline: 2px solid #f7c948;
    outline-offset: -2px;
  }
`

const Chevron = styled.span<{ $open: boolean }>`
  color: #9ca3af;
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 180ms ease;
`

const Panel = styled.div<{ $open: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
  transition: grid-template-rows 220ms ease;
`

const PanelInner = styled.div`
  overflow: hidden;
  min-height: 0;
`

const PanelBody = styled.div`
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: min(40vh, 280px);
  overflow-y: auto;
  overscroll-behavior: contain;
`

/**
 * Shared Instant/Smart intel surface.
 * Instant: Details accordion only (after Swap button).
 * Smart: Route → Metrics → Fee → AI → Details.
 * Details open state persists across Instant ↔ Smart switches (same mount).
 */
function TransparencyStack({ mode }: { mode: SmartSwapIntelMode }) {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const aiResult = useSmartSwapAIAssistance(result, feeModel)
  const handoff = useSmartSwapExecutionHandoff(result, feeModel)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const toggleDetails = useCallback(() => setDetailsOpen((v) => !v), [])
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const idle = !typedValue || !String(typedValue).trim()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const isSmart = mode === 'smart'

  // Keep accordion state when switching Instant ↔ Smart (do not reset).
  useEffect(() => {
    /* intentional: mode changes must not clear detailsOpen */
  }, [mode])

  const preview = result.status === 'ok' ? result.preview : null
  const hops = preview?.hopVisualization ?? []
  const source = resolveExecutionSourceLabel(preview)

  const impact = preview
    ? formatImpactLabel(preview.priceImpactPercent, preview.priceImpactSeverity)
    : '—'
  const impactTone =
    preview?.priceImpactSeverity === 'HIGH'
      ? 'warn'
      : preview?.priceImpactSeverity === 'LOW'
        ? 'ok'
        : 'neutral'
  const feeLabel =
    preview?.protocolFee.availability === 'available' && preview.protocolFee.bps != null
      ? preview.protocolFee.label
      : '—'
  const confidenceTone =
    preview && preview.confidence >= 70 ? 'ok' : preview && preview.confidence < 40 ? 'warn' : 'neutral'

  const expected =
    preview?.expectedOutputFormatted != null
      ? `${preview.expectedOutputFormatted} ${preview.outputToken.symbol}`
      : '—'
  const minimum =
    preview?.minimumReceivedFormatted != null
      ? `${preview.minimumReceivedFormatted} ${preview.outputToken.symbol}`
      : '—'

  const metrics = [
    { label: 'Expected output', value: expected },
    { label: 'Minimum received', value: minimum },
    { label: 'Price impact', value: impact, tone: impactTone as 'ok' | 'warn' | 'neutral' },
    { label: 'Protocol fee', value: feeLabel },
    {
      label: 'Confidence',
      value: preview ? `${preview.confidence}%` : '—',
      tone: confidenceTone as 'ok' | 'warn' | 'neutral',
    },
  ]

  const aiBody =
    idle
      ? '—'
      : aiResult.status === 'ok' && aiResult.assistance
        ? aiResult.assistance.explanation
        : 'AI insight unavailable for this quote.'

  return (
    <Stack
      data-smart-transparency-stack
      data-smart-ux-composition="true"
      data-intel-mode={mode}
      data-smart-idle={idle ? 'true' : 'false'}
    >
      {isSmart ? (
        <>
          <SmartSwapVisualRoute
            hops={hops}
            executionSourceLabel={source.label || undefined}
            executionSourceDetail={source.detail || undefined}
            inputCurrency={inputCurrency}
            outputCurrency={outputCurrency}
            idle={idle}
          />
          <SmartSwapCompactMetrics items={metrics} />
          <SmartSwapFeeTransparencyPanel model={feeModel} compact />
          <SmartSwapInsightCard data-insight="ai" title="AI Insight" body={aiBody} />
        </>
      ) : null}

      <AccordionShell data-execution-details-accordion data-execution-details-open={detailsOpen ? 'true' : 'false'}>
        <Toggle
          type="button"
          id="smart-execution-details-toggle"
          aria-expanded={detailsOpen}
          aria-controls="smart-execution-details-panel"
          onClick={toggleDetails}
        >
          <span>Details</span>
          <Chevron $open={detailsOpen} aria-hidden>
            ▾
          </Chevron>
        </Toggle>
        <Panel $open={detailsOpen}>
          <PanelInner>
            <PanelBody id="smart-execution-details-panel" role="region" aria-labelledby="smart-execution-details-toggle">
              <SmartSwapExecutionPreviewPanel result={result} embedded idle={idle} />
              {preview?.freshness ? (
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Freshness: {preview.freshness}</p>
              ) : null}
              {isSmart ? <SmartSwapExecutionHandoffPanel handoff={handoff} compact /> : null}
            </PanelBody>
          </PanelInner>
        </Panel>
      </AccordionShell>
    </Stack>
  )
}

export function SmartSwapExecutionPreviewModule({
  showSmartTransparency = true,
  mode = 'smart',
}: SmartSwapExecutionPreviewModuleProps) {
  if (!showSmartTransparency) return null
  return <TransparencyStack mode={mode} />
}
