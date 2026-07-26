import { useCallback, useState } from 'react'
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
import { useSmartSwapAIAssistance } from 'views/SmartSwapStudio/modules/SmartSwapAIAssistance'
import {
  SmartSwapExecutionHandoffPanel,
  useSmartSwapExecutionHandoff,
} from 'views/SmartSwapStudio/modules/SmartSwapExecutionHandoff'

export type SmartSwapExecutionPreviewModuleProps = {
  showSmartTransparency?: boolean
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
`

const InsightRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
 * Premium Smart cockpit — compact route, metrics, insights.
 * Details accordion uses local controlled state (open/close without refresh).
 */
function SmartTransparencyStack() {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const aiResult = useSmartSwapAIAssistance(result, feeModel)
  const handoff = useSmartSwapExecutionHandoff(result, feeModel)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const toggleDetails = useCallback(() => setDetailsOpen((v) => !v), [])

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

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
    aiResult.status === 'ok' && aiResult.assistance
      ? aiResult.assistance.explanation
      : 'AI insight unavailable for this quote.'

  const feeBody =
    feeModel.flowSteps.find((s) => /protocol fee/i.test(s.label))?.value ||
    feeModel.unavailableReason ||
    'Fee information unavailable'

  return (
    <Stack data-smart-transparency-stack data-smart-ux-v3="true">
      <SmartSwapVisualRoute
        hops={hops}
        executionSourceLabel={source.label}
        executionSourceDetail={source.detail}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
      />
      <SmartSwapCompactMetrics items={metrics} />
      <InsightRow data-smart-insight-row>
        <SmartSwapInsightCard data-insight="route" title="Route" body={source.label} sub={source.detail} />
        <SmartSwapInsightCard data-insight="fee" title="Fee" body={feeBody} />
        <SmartSwapInsightCard data-insight="ai" title="AI Insight" body={aiBody} />
      </InsightRow>

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
              {detailsOpen ? (
                <>
                  <SmartSwapExecutionPreviewPanel result={result} embedded />
                  {preview?.freshness ? (
                    <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Freshness: {preview.freshness}</p>
                  ) : null}
                  <SmartSwapExecutionHandoffPanel handoff={handoff} compact />
                </>
              ) : null}
            </PanelBody>
          </PanelInner>
        </Panel>
      </AccordionShell>
    </Stack>
  )
}

export function SmartSwapExecutionPreviewModule({
  showSmartTransparency = true,
}: SmartSwapExecutionPreviewModuleProps) {
  if (!showSmartTransparency) return null
  return <SmartTransparencyStack />
}
