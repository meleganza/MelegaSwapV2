/**
 * Section 3 — Trading embed. Reuses SmartSwapForm (do not modify Swap/Smart Swap sources).
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { useAppDispatch } from 'state'
import { currencyId } from 'utils/currencyId'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import { HomeSwapIconButton, HomeSwapPanelShell } from 'views/HomeTrade/HomeSwapPanelShell'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { humanChainName } from '../presentation/humanLabels'
import { Band, BandHead, BandMeta, BandTitle, Grid, Muted, pp } from './theme'
import { Metric, indexed, UNAVAILABLE } from './Metric'

const QuietSwapShell = styled.div`
  border-radius: 10px;
  overflow: hidden;
  background: rgba(8, 8, 8, 0.7);
  border: 1px solid ${pp.line};

  .home-trade-swap {
    padding: 0;
  }
`

const SwapSkeleton = styled.div`
  min-height: 260px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
  border: 1px solid ${pp.line};
`

const SwapInner = dynamic(() => Promise.resolve({ default: ProjectSwapInner }), {
  ssr: false,
  loading: () => <SwapSkeleton aria-label="Loading trade form" />,
}) as React.ComponentType<Props>

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
}

function resolveDefaultPair(slug: string, marketsDocument: ProjectMarketsDocument) {
  if (slug === 'marco') {
    return { inputCurrencyId: 'BNB', outputCurrencyId: MARCO_BSC_ADDRESS }
  }
  const preferred = marketsDocument.preferredMarkets[0]
  const buy =
    (preferred &&
      marketsDocument.swapDestinations.find(
        (d) => d.marketId === preferred.marketId && d.status === 'READY' && d.label.includes('buy'),
      )) ||
    marketsDocument.swapDestinations.find((d) => d.status === 'READY') ||
    null
  if (buy) {
    return {
      inputCurrencyId: buy.inputCurrencyParam,
      outputCurrencyId: buy.outputCurrencyParam,
    }
  }
  return null
}

function ProjectSwapInner({ slug, marketsDocument }: Props) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency()
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  // Founder amendment P0-2: an explicit ?inputCurrency=&outputCurrency= pair (e.g. from
  // Home Featured Trade, source=featured-home) always wins over the project's default pair.
  const queryInputCurrency =
    typeof router.query.inputCurrency === 'string' ? router.query.inputCurrency : undefined
  const queryOutputCurrency =
    typeof router.query.outputCurrency === 'string' ? router.query.outputCurrency : undefined
  const focusSwap = router.query.focus === 'swap'
  const tradeSource = typeof router.query.source === 'string' ? router.query.source : undefined

  const queryPair = useMemo(() => {
    if (!queryInputCurrency || !queryOutputCurrency) return null
    return { inputCurrencyId: queryInputCurrency, outputCurrencyId: queryOutputCurrency }
  }, [queryInputCurrency, queryOutputCurrency])

  const defaultPair = useMemo(() => resolveDefaultPair(slug, marketsDocument), [slug, marketsDocument])
  const effectivePair = queryPair ?? defaultPair

  useEffect(() => {
    if (!chainId || !native || !effectivePair) return
    dispatch(
      replaceSwapState({
        typedValue: '',
        field: Field.INPUT,
        inputCurrencyId: effectivePair.inputCurrencyId,
        outputCurrencyId: effectivePair.outputCurrencyId,
        recipient: null,
      }),
    )
    // Re-run only when the resolved pair identity changes (query wins over default).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, effectivePair?.inputCurrencyId, effectivePair?.outputCurrencyId, dispatch, native])

  // Founder amendment P0-2: ?focus=swap (from Home Featured Trade) scrolls to and
  // focuses the swap embed instead of leaving the shopper to find it manually.
  useEffect(() => {
    if (!focusSwap) return
    const timer = window.setTimeout(() => {
      const root = swapBodyRef.current
      root?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input =
        root?.querySelector<HTMLElement>('input.token-amount-input') || root?.querySelector<HTMLElement>('input')
      input?.focus({ preventScroll: true })
    }, 280)
    return () => window.clearTimeout(timer)
  }, [focusSwap])

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)
      const newCurrencyOutputId = currencyId(newCurrencyOutput)
      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },
    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )

  const handleRefresh = useCallback(() => {
    const root = swapBodyRef.current
    if (!root) return
    const btn =
      root.querySelector('[class*="RefreshIcon"]') ||
      root.querySelector('button[aria-label*="Refresh"]') ||
      root.querySelector('[class*="CurrencyInputHeader"] button')
    if (btn instanceof HTMLElement) btn.click()
  }, [])

  if (!effectivePair) {
    return <Muted>Buying is not available for this project on Melega DEX yet.</Muted>
  }

  const pairIndicator = (
    <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8a8a' }}>
      {inputCurrency?.symbol ?? '—'} / {outputCurrency?.symbol ?? '—'}
    </span>
  )

  return (
    <QuietSwapShell data-testid="project-v1-trading-embed" data-trade-source={tradeSource}>
      <HomeSwapPanelShell
        pairIndicator={pairIndicator}
        toolbar={
          <>
            <HomeSwapIconButton type="button" aria-label="Trade settings" onClick={onPresentSettingsModal}>
              ⚙
            </HomeSwapIconButton>
            <HomeSwapIconButton type="button" aria-label="Refresh price" onClick={handleRefresh}>
              ↻
            </HomeSwapIconButton>
          </>
        }
      >
        <div ref={swapBodyRef} className={`home-trade-swap${account ? '' : ' is-disconnected'}`}>
          <SmartSwapForm handleOutputSelect={handleOutputSelect} />
        </div>
      </HomeSwapPanelShell>
    </QuietSwapShell>
  )
}

const ProjectTradingEmbed: React.FC<Props> = ({ slug, marketsDocument }) => {
  const preferred = marketsDocument.preferredMarkets[0]
  const chainName = humanChainName(preferred?.chainId ?? 56)
  const ready = marketsDocument.swapDestinations.some((d) => d.status === 'READY') || slug === 'marco'

  return (
    <Band aria-labelledby="pp-v1-trading" data-project-section="trading">
      <BandHead>
        <BandTitle id="pp-v1-trading">Trading</BandTitle>
        <BandMeta>{chainName}</BandMeta>
      </BandHead>
      <Grid $cols={4} style={{ marginBottom: 10 }}>
        <Metric
          label="Best route"
          value={ready ? 'Smart Swap' : 'Unavailable'}
          provenance={ready ? indexed('melega-smart-swap') : UNAVAILABLE}
        />
        <Metric label="Liquidity" value="See Live Market" provenance={indexed('project-page-cross-ref')} />
        <Metric label="Spread" value="Unavailable" provenance={UNAVAILABLE} />
        <Metric label="Slippage" value="Wallet settings" provenance={indexed('swap-settings')} />
        <Metric label="Protocol fee" value="Policy — unproven on-chain" provenance={indexed('d87-display')} />
        <Metric
          label="Buy / Sell"
          value={ready ? 'Available' : 'Unavailable'}
          tone={ready ? 'ok' : 'mute'}
          provenance={ready ? indexed('swap-destinations') : UNAVAILABLE}
        />
      </Grid>
      <SwapFeaturesProvider>
        <SwapInner slug={slug} marketsDocument={marketsDocument} />
      </SwapFeaturesProvider>
    </Band>
  )
}

export default ProjectTradingEmbed
