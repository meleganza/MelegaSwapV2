/**
 * Section 3 — Trading embed. Reuses SmartSwapForm (do not modify Swap/Smart Swap sources).
 * Chain is forced from the Project Page deployment — no manual chain picker.
 */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useWeb3React } from '@pancakeswap/wagmi'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useAppDispatch } from 'state'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import TradeCockpit from 'views/Trade/TradeCockpit'
import type { SmartSwapProductAction } from 'views/SmartSwapStudio/SmartSwapProductActions'
import TradeTerminalGlobalStyle from 'views/Trade/TradeTerminalGlobalStyle'
import { TradeRuntimeProvider } from 'views/Trade/tradeRuntime/TradeRuntimeContext'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import {
  getMelegaChain,
  getMelegaRouterAddress,
  isMelegaCapabilityEnabled,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import { shortenRouter } from './helpers'
import { Band, BandHead, BandMeta, BandTitle, Chip, Grid, Muted, pp } from './theme'
import { Metric, indexed, UNAVAILABLE } from './Metric'

const MARCO_BASE_ADDRESS = '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7'

const QuietSwapShell = styled.div`
  border-radius: 10px;
  overflow: hidden;
  background: #0d0d0d;
  border: 0;

  [data-trade-cockpit] {
    width: 100%;
    max-width: none;
  }

  [data-trade-cockpit-shell] {
    padding: 14px;
    border: 0;
    border-radius: 10px;
  }
`

const SwapSkeleton = styled.div<{ $hero?: boolean }>`
  min-height: ${({ $hero }) => ($hero ? '200px' : '260px')};
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%);
  border: 1px solid ${pp.line};
`

const HeroTradeBand = styled(Band)`
  margin-bottom: 0;
  padding: 6px 8px 8px;
  border: 0;
  background: transparent;
  box-shadow: none;

  @media (min-width: 768px) {
    padding: 4px 8px 8px;
  }
`

const VisuallyHiddenTitle = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

const ComingSoonBox = styled.div`
  padding: 28px 16px;
  text-align: center;
  border-radius: 10px;
  border: 1px dashed ${pp.line};
  background: rgba(255, 255, 255, 0.02);
`

interface Props {
  slug: string
  marketsDocument: ProjectMarketsDocument
  /** Project deployment chain — drives router + pair; no manual selection. */
  projectChainId: number
  contractAddress?: string | null
  /** Hero: compact Smart Swap (no diagnostic metric grid). */
  variant?: 'full' | 'hero'
}

interface InnerProps extends Props {
  projectChainId: number
  /** When true, never blank the form while the wallet chain aligns. */
  nonBlockingChainAlign?: boolean
}

function resolveDefaultPair(
  slug: string,
  marketsDocument: ProjectMarketsDocument,
  projectChainId: number,
  contractAddress?: string | null,
) {
  const native = getMelegaChain(projectChainId)?.nativeCurrency.symbol ?? 'BNB'
  if (slug === 'marco') {
    if (projectChainId === 8453) {
      return { inputCurrencyId: 'ETH', outputCurrencyId: MARCO_BASE_ADDRESS }
    }
    return { inputCurrencyId: 'BNB', outputCurrencyId: MARCO_BSC_ADDRESS }
  }
  const onChainBuy =
    marketsDocument.swapDestinations.find(
      (d) => d.status === 'READY' && d.chainId === projectChainId && d.label.includes('buy'),
    ) || marketsDocument.swapDestinations.find((d) => d.status === 'READY' && d.chainId === projectChainId)
  if (onChainBuy) {
    return {
      inputCurrencyId: onChainBuy.inputCurrencyParam,
      outputCurrencyId: onChainBuy.outputCurrencyParam,
    }
  }
  if (contractAddress && isMelegaChainLive(projectChainId)) {
    return {
      inputCurrencyId: native,
      outputCurrencyId: contractAddress,
    }
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

function ProjectSwapInner({
  slug,
  marketsDocument,
  projectChainId,
  contractAddress,
  nonBlockingChainAlign = false,
}: InnerProps) {
  const [productAction, setProductAction] = useState<SmartSwapProductAction>('swap')
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const native = useNativeCurrency()
  const { account } = useWeb3React()

  // Defer wallet chain align — never block hero paint on MetaMask prompts.
  useEffect(() => {
    if (!account) return
    if (!isMelegaChainLive(projectChainId)) return
    if (chainId === projectChainId) return
    if (!canSwitch) return
    const timer = window.setTimeout(
      () => {
        void switchNetworkAsync(projectChainId)
      },
      nonBlockingChainAlign ? 800 : 0,
    )
    return () => window.clearTimeout(timer)
  }, [account, projectChainId, chainId, canSwitch, switchNetworkAsync, nonBlockingChainAlign])

  const queryInputCurrency = typeof router.query.inputCurrency === 'string' ? router.query.inputCurrency : undefined
  const queryOutputCurrency = typeof router.query.outputCurrency === 'string' ? router.query.outputCurrency : undefined
  const tradeSource = typeof router.query.source === 'string' ? router.query.source : undefined

  const queryPair = useMemo(() => {
    if (!queryInputCurrency || !queryOutputCurrency) return null
    return { inputCurrencyId: queryInputCurrency, outputCurrencyId: queryOutputCurrency }
  }, [queryInputCurrency, queryOutputCurrency])

  const defaultPair = useMemo(
    () => resolveDefaultPair(slug, marketsDocument, projectChainId, contractAddress),
    [slug, marketsDocument, projectChainId, contractAddress],
  )
  const effectivePair = queryPair ?? defaultPair

  useEffect(() => {
    if (!chainId || !native || !effectivePair) return
    if (chainId !== projectChainId && isMelegaChainLive(projectChainId)) return
    dispatch(
      replaceSwapState({
        typedValue: '',
        field: Field.INPUT,
        inputCurrencyId: effectivePair.inputCurrencyId,
        outputCurrencyId: effectivePair.outputCurrencyId,
        recipient: null,
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, projectChainId, effectivePair?.inputCurrencyId, effectivePair?.outputCurrencyId, dispatch, native])

  if (!effectivePair) {
    return <Muted>Buying is not available for this project on Melega DEX yet.</Muted>
  }

  const chainMisaligned = chainId !== projectChainId && isMelegaChainLive(projectChainId)
  if (chainMisaligned && !nonBlockingChainAlign) {
    return (
      <Muted data-testid="project-v1-swap-chain-aligning">
        Aligning wallet to {getMelegaChain(projectChainId)?.shortLabel ?? 'project chain'}…
      </Muted>
    )
  }

  return (
    <QuietSwapShell data-testid="project-v1-trading-embed" data-trade-source={tradeSource} data-trade-terminal-screen>
      <TradeTerminalGlobalStyle />
      {chainMisaligned && nonBlockingChainAlign ? (
        <Muted data-testid="project-v1-swap-chain-aligning" style={{ marginBottom: 6, fontSize: 11 }}>
          Aligning wallet to {getMelegaChain(projectChainId)?.shortLabel ?? 'project chain'}…
        </Muted>
      ) : null}
      <TradeRuntimeProvider>
        <TradeCockpit productAction={productAction} onProductActionChange={setProductAction} />
      </TradeRuntimeProvider>
    </QuietSwapShell>
  )
}

const ProjectTradingEmbed: React.FC<Props> = ({
  slug,
  marketsDocument,
  projectChainId,
  contractAddress = null,
  variant = 'full',
}) => {
  const chain = getMelegaChain(projectChainId)
  const chainName = chain?.shortLabel ?? `Chain ${projectChainId}`
  const live = isMelegaChainLive(projectChainId)
  const swapReady = isMelegaCapabilityEnabled(projectChainId, 'swap')
  const routerAddress = live ? getMelegaRouterAddress(projectChainId) : null
  const ready =
    (marketsDocument.swapDestinations.some(
      (d) => d.status === 'READY' && (d.chainId == null || d.chainId === projectChainId),
    ) ||
      slug === 'marco') &&
    swapReady
  const hero = variant === 'hero'
  const Shell = hero ? HeroTradeBand : Band

  return (
    <Shell
      id="pp-v1-trading"
      aria-labelledby="pp-v1-trading-title"
      data-project-section="trading"
      data-project-chain-id={projectChainId}
      data-project-router={routerAddress ?? ''}
      data-trading-variant={variant}
      data-testid={hero ? 'project-v1-smart-swap-hero' : 'project-v1-trading-full'}
    >
      {hero ? (
        <VisuallyHiddenTitle id="pp-v1-trading-title">Smart Swap</VisuallyHiddenTitle>
      ) : (
        <BandHead>
          <BandTitle id="pp-v1-trading-title">Buy Token</BandTitle>
          <BandMeta>
            <Chip $on={live} $disabled={!live} data-testid="project-v1-trading-chain-badge">
              {chainName}
              {!live ? ' · Coming soon' : ''}
            </Chip>
          </BandMeta>
        </BandHead>
      )}
      {!hero ? (
        <Grid $cols={4} style={{ marginBottom: 10 }}>
          <Metric label="Chain" value={chainName} provenance={indexed('melega-chain-registry')} />
          <Metric
            label="Router"
            value={routerAddress ? shortenRouter(routerAddress) : 'Coming soon'}
            provenance={routerAddress ? indexed('melega-chain-registry') : UNAVAILABLE}
          />
          <Metric
            label="Swap target"
            value={contractAddress ? `${chain?.nativeCurrency.symbol ?? '—'} → Token` : 'Unavailable'}
            provenance={contractAddress ? indexed('project-registry') : UNAVAILABLE}
          />
          <Metric
            label="Best route"
            value={ready ? 'Smart Swap' : live ? 'Unavailable' : 'Coming soon'}
            provenance={ready ? indexed('melega-smart-swap') : UNAVAILABLE}
          />
          <Metric label="Liquidity" value="See Live Market" provenance={indexed('project-page-cross-ref')} />
          <Metric
            label="Buy / Sell"
            value={ready ? 'Available' : live ? 'Unavailable' : 'Coming soon'}
            tone={ready ? 'ok' : 'mute'}
            provenance={ready ? indexed('swap-destinations') : UNAVAILABLE}
          />
        </Grid>
      ) : null}
      {!live || !swapReady ? (
        <ComingSoonBox data-testid="project-v1-trading-coming-soon">
          <Muted style={{ marginBottom: 6, color: pp.gold }}>Coming soon on {chainName}</Muted>
          <Muted>Smart Swap for this network is preparing. Switch to a LIVE deployment (BNB or Base) to buy now.</Muted>
        </ComingSoonBox>
      ) : (
        <SwapFeaturesProvider>
          <ProjectSwapInner
            slug={slug}
            marketsDocument={marketsDocument}
            projectChainId={projectChainId}
            contractAddress={contractAddress}
            nonBlockingChainAlign={hero}
          />
        </SwapFeaturesProvider>
      )}
    </Shell>
  )
}

export default ProjectTradingEmbed
