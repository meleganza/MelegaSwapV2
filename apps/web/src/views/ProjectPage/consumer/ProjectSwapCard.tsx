import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
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
import { EmptyState, EmptyStateBody, EmptyStateTitle, MutedText, Section, SectionTitle } from './theme'
import { getBuySectionTitle } from './helpers'

const BuySurface = styled.div<{ $dense?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $dense }) => ($dense ? '10px' : '14px')};
  background: ${({ $dense }) => ($dense ? '#111111' : 'transparent')};
  border: ${({ $dense }) => ($dense ? '1px solid rgba(255, 255, 255, 0.075)' : 'none')};
  border-radius: ${({ $dense }) => ($dense ? '16px' : '0')};
  padding: ${({ $dense }) => ($dense ? '18px' : '0')};
  box-shadow: ${({ $dense }) => ($dense ? '0 14px 40px rgba(0, 0, 0, 0.28)' : 'none')};
  min-height: ${({ $dense }) => ($dense ? '270px' : 'auto')};

  @media (min-width: 1024px) {
    min-height: ${({ $dense }) => ($dense ? '280px' : 'auto')};
    max-height: ${({ $dense }) => ($dense ? '306px' : 'none')};
    overflow: auto;
  }
`

const QuietSwapShell = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.065);

  .home-trade-swap {
    padding: 0;
  }

  [class*='HomeSwapPanelShell'] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
`

const SwapSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
`

const SwapSkeleton = styled.div`
  min-height: 280px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const SwapInner = dynamic(
  () => Promise.resolve({ default: ProjectSwapInner }),
  {
    ssr: false,
    loading: () => <SwapSkeleton aria-label="Loading buy form" />,
  },
) as React.ComponentType<Props>

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
  dense?: boolean
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

  const defaultPair = useMemo(() => resolveDefaultPair(slug, marketsDocument), [slug, marketsDocument])

  useEffect(() => {
    if (!chainId || !native || !defaultPair) return
    dispatch(
      replaceSwapState({
        typedValue: '',
        field: Field.INPUT,
        inputCurrencyId: defaultPair.inputCurrencyId,
        outputCurrencyId: defaultPair.outputCurrencyId,
        recipient: null,
      }),
    )
  }, [chainId, defaultPair, dispatch, native])

  const inputSymbol = inputCurrency?.symbol ?? '—'
  const outputSymbol = outputCurrency?.symbol ?? '—'

  const pairIndicator = useMemo(
    () => (
      <span style={{ fontSize: 12, fontWeight: 600, color: '#8a8a8a' }}>
        {inputSymbol} / {outputSymbol}
      </span>
    ),
    [inputSymbol, outputSymbol],
  )

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

  if (!defaultPair) {
    return (
      <EmptyState>
        <EmptyStateTitle>Not available yet</EmptyStateTitle>
        <EmptyStateBody>Buying is not available for this project on Melega DEX right now.</EmptyStateBody>
      </EmptyState>
    )
  }

  return (
    <QuietSwapShell>
      <HomeSwapPanelShell
        pairIndicator={pairIndicator}
        toolbar={
          <>
            <HomeSwapIconButton type="button" aria-label="Buy settings" onClick={onPresentSettingsModal}>
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

const ProjectSwapCard: React.FC<Props> = ({ slug, marketsDocument, dense = false }) => {
  const preferred = marketsDocument.preferredMarkets[0]
  const symbol =
    slug === 'marco'
      ? 'MARCO'
      : preferred?.baseSymbol ?? preferred?.quoteSymbol ?? null
  const title = getBuySectionTitle(slug, symbol)
  const chainId = preferred?.chainId ?? 56
  const chainName = humanChainName(chainId)

  return (
    <Section aria-labelledby="buy-heading" style={{ margin: 0 }}>
      <BuySurface $dense={dense}>
        <SectionTitle as="h2" id="buy-heading" style={{ fontSize: dense ? 22 : undefined }}>
          {title}
        </SectionTitle>
        {dense ? (
          <SwapSubtitle>Trade instantly on Melega DEX</SwapSubtitle>
        ) : (
          <MutedText>Buy with BNB on {chainName}</MutedText>
        )}
        <SwapFeaturesProvider>
          <SwapInner slug={slug} marketsDocument={marketsDocument} />
        </SwapFeaturesProvider>
      </BuySurface>
    </Section>
  )
}

export default ProjectSwapCard
