import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useGasPrice } from 'state/user/hooks'
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
import {
  SMART_SWAP_PREVIEW_GAS_UNITS,
  useSmartSwapGasProtocolFeePreview,
} from 'lib/smart-swap-gas-protocol-fee'

export type SmartSwapIntelMode = 'instant' | 'smart'

export type SmartSwapExecutionPreviewModuleProps = {
  /** @deprecated use mode */
  showSmartTransparency?: boolean
  /** Instant = Details only; Smart = Route/Metrics/AI + Details */
  mode?: SmartSwapIntelMode
  /** Home/embedded surface: route + metrics only, without vertical diagnostic panels. */
  compact?: boolean
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
  & > [data-insight='ai'] {
    order: 3;
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
function TransparencyStack({ mode, compact = false }: { mode: SmartSwapIntelMode; compact?: boolean }) {
  const result = useSmartSwapExecutionPreview()
  const feeModel = useSmartSwapFeeTransparency(result)
  const { chainId } = useActiveChainId()
  const preview = result.status === 'ok' ? result.preview : null
  const quoteChainId = preview?.inputToken.chainId ?? chainId ?? 56
  // Keep the network estimate available before wallet connection: without the
  // explicit active-chain override useGasPrice can resolve against an undefined
  // connector chain and leave the UI at “—”.
  const gasPrice = useGasPrice(quoteChainId)
  const gasFeePlan = useSmartSwapGasProtocolFeePreview(preview?.gasEstimateUnits, Number(quoteChainId))
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

  const hops = preview?.hopVisualization ?? []
  const source = resolveExecutionSourceLabel(preview)

  const impact = preview ? formatImpactLabel(preview.priceImpactPercent, preview.priceImpactSeverity) : '—'
  const impactTone =
    preview?.priceImpactSeverity === 'HIGH' ? 'warn' : preview?.priceImpactSeverity === 'LOW' ? 'ok' : 'neutral'
  const confidenceTone =
    preview && preview.confidence >= 70 ? 'ok' : preview && preview.confidence < 40 ? 'warn' : 'neutral'

  const expected =
    preview?.expectedOutputFormatted != null ? `${preview.expectedOutputFormatted} ${preview.outputToken.symbol}` : '—'
  const minimum =
    preview?.minimumReceivedFormatted != null
      ? `${preview.minimumReceivedFormatted} ${preview.outputToken.symbol}`
      : '—'

  const estimatedGas = useMemo(() => {
    if (!preview) return '—'
    const gasUnits = preview.gasEstimateUnits ?? SMART_SWAP_PREVIEW_GAS_UNITS
    const normalizedChainId = Number(quoteChainId)
    const inputSymbol = preview.inputToken.symbol?.toUpperCase()
    const isBsc = normalizedChainId === 56 || normalizedChainId === 97 || inputSymbol === 'BNB'
    const liveGasPrice = gasPrice?.toString?.() ?? ''
    // BNB Chain exposes a canonical 5 gwei UI default when the disconnected
    // provider has not hydrated yet. The confirmation flow still replaces this
    // pre-trade estimate with wallet estimateGas + live gas price.
    const gasPriceWei = /^\d+(?:\.\d+)?$/.test(liveGasPrice) && liveGasPrice !== '0'
      ? isBsc && Number(liveGasPrice) < 1_000_000_000
        ? String(Number(liveGasPrice) * 1_000_000_000)
        : liveGasPrice
      : isBsc
        ? '5000000000'
        : null
    if (!gasPriceWei) return '—'
    const estimatedNative = (Number(gasUnits) * Number(gasPriceWei)) / 1e18
    if (!Number.isFinite(estimatedNative) || estimatedNative <= 0) return '—'
    const nativeSymbol =
      isBsc
        ? 'BNB'
        : normalizedChainId === 137
          ? 'POL'
          : normalizedChainId === 43114
            ? 'AVAX'
            : 'ETH'
    const formatted = estimatedNative.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
    return `~${formatted} ${nativeSymbol}`
  }, [preview, gasPrice, quoteChainId])
  const protocolFee = gasFeePlan
    ? `~${gasFeePlan.display.protocolFeeBnb} ${gasFeePlan.fee.feeAsset}`
    : '—'

  const metrics = [
    { label: 'Expected output', value: expected },
    { label: 'Minimum received', value: minimum },
    { label: 'Price impact', value: impact, tone: impactTone as 'ok' | 'warn' | 'neutral' },
    { label: 'Estimated gas', value: estimatedGas },
    {
      label: 'Protocol fee',
      value: protocolFee,
      sub: gasFeePlan
        ? `${gasFeePlan.display.protocolFeeLabel} · preview only · Not collected`
        : feeModel.unavailableReason ?? 'Fee estimate unavailable',
    },
  ]

  const aiBody = idle
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
          {!compact || !idle ? (
            <SmartSwapVisualRoute
              hops={hops}
              executionSourceLabel={source.label || undefined}
              executionSourceDetail={source.detail || undefined}
              inputCurrency={inputCurrency}
              outputCurrency={outputCurrency}
              idle={idle}
            />
          ) : null}
          <SmartSwapCompactMetrics items={metrics} />
          {!compact ? <SmartSwapInsightCard data-insight="ai" title="AI Insight" body={aiBody} /> : null}
        </>
      ) : null}

      {!compact ? (
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
              <PanelBody
                id="smart-execution-details-panel"
                role="region"
                aria-labelledby="smart-execution-details-toggle"
              >
                <SmartSwapExecutionPreviewPanel result={result} embedded idle={idle} />
                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }} data-execution-model-note>
                  Execution: non-custodial wallet transaction
                </p>
                {preview?.freshness ? (
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>Freshness: {preview.freshness}</p>
                ) : null}
                {isSmart ? <SmartSwapExecutionHandoffPanel handoff={handoff} compact /> : null}
              </PanelBody>
            </PanelInner>
          </Panel>
        </AccordionShell>
      ) : null}
    </Stack>
  )
}

export function SmartSwapExecutionPreviewModule({
  showSmartTransparency = true,
  mode = 'smart',
  compact = false,
}: SmartSwapExecutionPreviewModuleProps) {
  if (!showSmartTransparency) return null
  return <TransparencyStack mode={mode} compact={compact} />
}
