/**
 * Project Page V5 — pixel-perfect public landing (rebuild, not a V4 visual patch).
 * Progressive shell → market → chart/swap islands. Data Truth only (no duplicate formulas).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import { getFeaturedPackage, getTrendBoostPackage } from 'lib/monetization/packages'
import { CommercialCheckoutModal } from 'views/shared/monetization/CommercialCheckoutModal'
import { ClaimProjectWizardModal } from 'views/shared/monetization/ClaimProjectWizardModal'
import { COMMERCIAL_SERVICES, type CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'
import { truthDash, GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'
import { LIVE_POOL_INVENTORY_BY_CHAIN } from 'lib/data-truth/liveInventoryCounts'
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import { humanEnumLabel } from '../presentation/humanLabels'
import { Band, BandHead, BandMeta, BandTitle, Btn, Chip, Muted, Page, Row, pp } from '../v1/theme'
import {
  buildProjectChainDeployments,
  defaultSelectedChainId,
  explorerLabelFor,
  explorerUrlFor,
  filterParticipationByChain,
  getBuyTokenHref,
  getPrimaryAssetForChain,
  getSocialResources,
} from '../v1/helpers'
import { useProjectLiveMarket } from '../v1/useProjectLiveMarket'
import {
  afterFirstPaint,
  markProjectChartReady,
  markProjectMarketHydrated,
  markProjectNavClick,
  markProjectRouteChange,
  markProjectShellRender,
  markProjectSwapReady,
} from './projectPagePerf'

const dash = (v?: string | null) => truthDash(v)

const ChartSkeleton = styled.div`
  min-height: 200px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.6), rgba(10, 10, 10, 0.85));
  border: 1px solid ${pp.line};
`

const SwapSkeleton = styled.div`
  min-height: 180px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.55), rgba(10, 10, 10, 0.8));
  border: 1px solid ${pp.line};
`

const ProjectCharts = dynamic(() => import('../v1/ProjectCharts'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-label="Loading chart" data-testid="project-v5-chart-skeleton" />,
})

const ProjectTradingEmbed = dynamic(() => import('../v1/ProjectTradingEmbed'), {
  ssr: false,
  loading: () => <SwapSkeleton aria-label="Loading Smart Swap" data-testid="project-v5-swap-skeleton" />,
})

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 0.39fr) minmax(0, 0.61fr);
    gap: 22px;
    align-items: stretch;
    min-height: 0;
    max-height: 560px;
  }
`

const LogoWrap = styled.div`
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${pp.line};
  background: #111;
`

const HeroName = styled.h1`
  margin: 0;
  font-size: clamp(24px, 2.4vw, 30px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: #fff;
`

const Ticker = styled.span`
  font-size: 15px;
  font-weight: 750;
  color: ${pp.gold};
`

const Desc = styled.p`
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
  max-width: 36rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`

const SocialChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid ${pp.line};
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    border-color: ${pp.goldLine};
    color: #fff;
  }
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #c8c8c8;
  overflow: hidden;
`

const CopyBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${pp.gold};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
`

const HeroCtas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
`

const TradeWorkspace = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: ${pp.radius};
  border: 1px solid rgba(244, 196, 48, 0.18);
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.98), rgba(10, 10, 10, 0.98));
  overflow: hidden;
`

const ChartSlot = styled.div`
  flex: 1.5 1 0;
  min-height: 0;
  padding: 8px 10px 4px;
  border-bottom: 1px solid ${pp.line};
`

const SwapSlot = styled.div`
  flex: 1 1 0;
  min-height: 0;
  padding: 4px 8px 8px;

  #pp-v1-trading,
  [data-trading-variant='hero'] {
    border: 0;
    background: transparent;
    margin: 0;
    padding: 0;
  }
`

const MarketStrip = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(88px, 1fr);
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;

  @media (min-width: 960px) {
    grid-auto-flow: unset;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    overflow: visible;
  }
`

const StripCell = styled.div`
  min-width: 88px;
  padding: 10px 12px;
  border-right: 1px solid ${pp.line};

  &:last-child {
    border-right: 0;
  }
`

const StripLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${pp.mute2};
  margin-bottom: 3px;
`

const StripValue = styled.div<{ $tone?: 'up' | 'down' | 'mute' }>`
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${({ $tone }) =>
    $tone === 'up' ? pp.ok : $tone === 'down' ? pp.bad : $tone === 'mute' ? pp.mute : '#fff'};
  white-space: nowrap;
`

const EconomyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const EconomyCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 148px;
  padding: 12px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
`

const EconomyTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
`

const EconomyMeta = styled.div`
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  flex: 1;
`

const BoostConsole = styled.div`
  border-radius: ${pp.radius};
  border: 1px solid ${pp.goldLine};
  background:
    radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242, 200, 76, 0.1), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  padding: 12px;
`

const BoostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const BoostTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(0, 0, 0, 0.28);
  color: inherit;
  cursor: pointer;
  min-height: 96px;

  &:hover {
    border-color: ${pp.goldLine};
  }
`

const BoostIcon = styled.span`
  font-size: 14px;
  color: ${pp.gold};
`

const BoostName = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
`

const BoostBenefit = styled.span`
  font-size: 11px;
  color: ${pp.mute};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const BoostPrice = styled.span`
  margin-top: auto;
  font-size: 11px;
  font-weight: 750;
  color: ${pp.gold};
`

const ClaimStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  max-height: 90px;
  padding: 12px 14px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
`

const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  }
`

const Accordion = styled.details`
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.015);
  padding: 0;

  summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 750;
    color: #fff;
  }

  summary::-webkit-details-marker {
    display: none;
  }
`

const AccordionBody = styled.div`
  padding: 0 14px 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  gap: 6px;
`

const RelatedRail = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const RelatedCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  color: inherit;
  min-width: 0;

  &:hover {
    border-color: ${pp.goldLine};
  }
`

const StickyBuy = styled.a`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 40;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${pp.gold};
  color: #111;
  font-weight: 850;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);

  @media (min-width: 768px) {
    display: none;
  }
`

const DenseBand = styled(Band)`
  margin-bottom: 8px;
`

function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <svg width="72" height="18" aria-hidden data-testid="project-v5-spark-empty">
        <polyline
          points="2,14 18,12 34,13 50,10 70,11"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.4"
        />
      </svg>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 70 + 1
      const y = 16 - ((v - min) / span) * 12
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width="72" height="18" aria-hidden>
      <polyline points={pts} fill="none" stroke={pp.gold} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function socialLabel(url: string, label?: string): string {
  if (label && label.length < 18) return label
  if (/twitter|x\.com/i.test(url)) return 'X'
  if (/t\.me|telegram/i.test(url)) return 'Telegram'
  if (/discord/i.test(url)) return 'Discord'
  if (/github/i.test(url)) return 'Github'
  if (/^https?:\/\//i.test(url)) return 'Website'
  return 'Link'
}

export type ProjectPageV5Props = {
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  evidencePack?: ProjectEvidencePack | null
  readinessDocument?: ProjectReadinessDocument | null
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

export const ProjectPageV5Shell: React.FC<ProjectPageV5Props> = ({
  document,
  marketsDocument,
  participationDocument,
  evidencePack = null,
  readinessDocument = null,
  tokenomicsDocument = null,
  roadmapDocument = null,
}) => {
  const deployments = useMemo(() => buildProjectChainDeployments(document), [document])
  const [selectedChainId, setSelectedChainId] = useState(() => defaultSelectedChainId(deployments))
  const [copied, setCopied] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutService, setCheckoutService] = useState<CommercialServiceId | null>(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [tradeReady, setTradeReady] = useState(false)
  const [belowFold, setBelowFold] = useState(false)

  const selected =
    deployments.find((d) => d.chainId === selectedChainId) ??
    deployments.find((d) => d.status === 'LIVE') ??
    deployments[0]
  const primary = selected ? getPrimaryAssetForChain(document, selected.chainId) : null
  const symbol = primary?.symbol?.value ?? null
  const chainId = selected?.chainId ?? 56
  const contract = selected?.contractAddress ?? null
  const verified =
    document.identity.verificationState?.meta?.availability === 'AVAILABLE'
      ? humanEnumLabel(document.identity.verificationState.value)
      : '—'
  const logoUrl =
    document.identity.logoUrl?.meta?.availability === 'AVAILABLE'
      ? document.identity.logoUrl.value
      : undefined
  const socials = getSocialResources(document)
  const website = document.resources.find((r) => r.resourceType === 'website')
  const xLink = socials.find((s) => /twitter|x\.com/i.test(s.url) || /\bx\b/i.test(s.label))
  const tgLink = socials.find((s) => /t\.me|telegram/i.test(s.url) || /telegram/i.test(s.label))
  const discordLink = socials.find((s) => /discord/i.test(s.url) || /discord/i.test(s.label))
  const githubLink = socials.find((s) => /github/i.test(s.url) || /github/i.test(s.label))
  const buyHref = getBuyTokenHref({ chainId, contract })

  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length, contract, chainId, {
    deferHoldersMs: 1500,
  })

  const featuredPkg = getFeaturedPackage('featured_1w')
  const trendPkg = getTrendBoostPackage('trend_6h')

  const openBoost = useCallback((service: CommercialServiceId) => {
    if (service === 'claim-project') {
      setClaimOpen(true)
      return
    }
    setCheckoutService(service)
    setCheckoutOpen(true)
  }, [])

  const chainFarms = useMemo(
    () => filterParticipationByChain(participationDocument.farms, chainId),
    [participationDocument.farms, chainId],
  )
  const chainPools = useMemo(
    () => filterParticipationByChain(participationDocument.stakingPools, chainId),
    [participationDocument.stakingPools, chainId],
  )
  const chainLiquidity = useMemo(
    () => filterParticipationByChain(participationDocument.pools, chainId),
    [participationDocument.pools, chainId],
  )

  const tokenDecimals =
    primary?.decimals?.meta?.availability === 'AVAILABLE' && typeof primary.decimals.value === 'number'
      ? primary.decimals.value
      : 18

  const description =
    document.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
      ? document.identity.shortPurpose.value
      : document.identity.description?.meta?.availability === 'AVAILABLE'
        ? document.identity.description.value
        : null

  const aboutFull =
    document.identity.description?.meta?.availability === 'AVAILABLE'
      ? document.identity.description.value
      : description

  const pairLabel =
    chainLiquidity[0]?.displayLabel || (symbol ? `${symbol} / WBNB` : '—')
  const priceValue = dash(market.priceUsd)
  const shortContract = contract ? `${contract.slice(0, 6)}…${contract.slice(-4)}` : null
  const isFeaturedPlacement = ['mm72', 'eyed', 'young-degens', 'blion', 'marco'].includes(document.slug)
  const isClaimed = Boolean(
    evidencePack?.claims?.some((c) => /accepted|verified|owned|claimed/i.test(String(c.status ?? c.id ?? ''))),
  )
  const poolInventoryHint = LIVE_POOL_INVENTORY_BY_CHAIN[chainId]
  const farmCount = chainFarms.length
  const poolCount = chainPools.length || (poolInventoryHint > 0 ? null : 0)
  const liqCount = chainLiquidity.length

  const related = useMemo(
    () =>
      resolveFounderFeaturedProjects()
        .filter((p) => p.slug !== document.slug)
        .slice(0, 4),
    [document.slug],
  )

  const boostTiles = useMemo(
    () =>
      COMMERCIAL_SERVICES.map((s) => {
        if (s.id === 'featured') {
          return { ...s, priceHint: `From $${featuredPkg.usdPrice}`, cta: 'Boost' }
        }
        if (s.id === 'trend-boost') {
          return { ...s, title: 'Trend Boost', priceHint: `From $${trendPkg.usdPrice}`, cta: 'Boost' }
        }
        if (s.id === 'claim-project') {
          return { ...s, title: 'Claim', priceHint: 'Wizard', cta: 'Claim' }
        }
        if (s.id === 'create-farm') return { ...s, title: 'Create Farm', priceHint: 'Studio', cta: 'Open' }
        if (s.id === 'create-pool') return { ...s, title: 'Create Pool', priceHint: 'Studio', cta: 'Open' }
        return { ...s, cta: 'Open' }
      }),
    [featuredPkg.usdPrice, trendPkg.usdPrice],
  )

  const onCopy = useCallback(() => {
    if (!contract || typeof navigator === 'undefined') return
    void navigator.clipboard?.writeText(contract).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }, [contract])

  useEffect(() => {
    markProjectRouteChange()
    markProjectShellRender()
    const cancel = afterFirstPaint(() => {
      setTradeReady(true)
      setBelowFold(true)
    })
    return cancel
  }, [])

  useEffect(() => {
    if (!market.loading) markProjectMarketHydrated()
  }, [market.loading, market.priceUsd, market.liquidity])

  useEffect(() => {
    if (!tradeReady) return
    const t = window.setTimeout(() => {
      markProjectChartReady()
      markProjectSwapReady()
    }, 50)
    return () => window.clearTimeout(t)
  }, [tradeReady])

  const tokenomicsOk =
    tokenomicsDocument &&
    ((tokenomicsDocument.allocations?.length ?? 0) > 0 ||
      (tokenomicsDocument.totalSupply != null && String(tokenomicsDocument.totalSupply) !== ''))
  const roadmapOk = Boolean(roadmapDocument?.milestones?.length)

  return (
    <Page
      id="project-page-v5"
      data-testid="project-page-v5"
      data-project-page="v5"
      data-project-slug={document.slug}
      data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}
      data-pp-shell="1"
    >
      <DenseBand data-testid="project-v5-hero" data-project-section="hero">
        <Hero>
          <div data-testid="project-v5-hero-left">
            <Row style={{ gap: 12, alignItems: 'center' }}>
              <LogoWrap data-testid="project-v5-logo">
                <MelegaTokenAvatar
                  symbol={symbol ?? document.identity.displayName}
                  name={document.identity.displayName}
                  address={contract ?? undefined}
                  chainId={chainId}
                  logoURI={logoUrl}
                  size={76}
                />
              </LogoWrap>
              <div style={{ minWidth: 0 }}>
                <HeroName data-testid="project-v5-name">{document.identity.displayName}</HeroName>
                <Row style={{ gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {symbol ? <Ticker data-testid="project-v5-symbol">${symbol}</Ticker> : null}
                  <Chip $on={/verif/i.test(verified)} data-testid="project-v5-verified">
                    {verified}
                  </Chip>
                  {isFeaturedPlacement ? <Chip $on>Featured</Chip> : null}
                  <span data-testid="project-v5-chain">
                    <MelegaExploreChainBadge chainId={chainId} />
                  </span>
                </Row>
              </div>
            </Row>

            {description ? <Desc data-testid="project-v5-desc">{description}</Desc> : null}

            <SocialRow data-testid="project-v5-socials">
              {website?.url ? (
                <SocialChip href={website.url} target="_blank" rel="noreferrer" data-testid="project-v5-website">
                  Website
                </SocialChip>
              ) : null}
              {xLink?.url ? (
                <SocialChip href={xLink.url} target="_blank" rel="noreferrer" data-testid="project-v5-x">
                  X
                </SocialChip>
              ) : null}
              {tgLink?.url ? (
                <SocialChip href={tgLink.url} target="_blank" rel="noreferrer" data-testid="project-v5-telegram">
                  Telegram
                </SocialChip>
              ) : null}
              {discordLink?.url ? (
                <SocialChip href={discordLink.url} target="_blank" rel="noreferrer" data-testid="project-v5-discord">
                  Discord
                </SocialChip>
              ) : null}
            </SocialRow>

            {contract ? (
              <ContractRow data-testid="project-v5-contract">
                <span>{shortContract}</span>
                <CopyBtn type="button" onClick={onCopy} data-testid="project-v5-copy-contract">
                  {copied ? 'Copied' : 'Copy'}
                </CopyBtn>
                <Btn
                  $ghost
                  href={explorerUrlFor(contract, chainId)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="project-v5-explorer"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                >
                  {explorerLabelFor(chainId)}
                </Btn>
              </ContractRow>
            ) : null}

            <HeroCtas data-testid="project-v5-hero-ctas">
              <Btn $primary href={buyHref} data-testid="project-v5-buy">
                Buy Token
              </Btn>
              {contract ? (
                <AddToWalletButton
                  tokenAddress={contract}
                  tokenSymbol={symbol ?? document.identity.displayName}
                  tokenDecimals={tokenDecimals}
                  tokenLogoURL={logoUrl}
                  textOptions={AddToWalletTextOptions.TEXT}
                />
              ) : null}
              {!isClaimed ? (
                <Btn
                  $ghost
                  href="#claim"
                  onClick={(e) => {
                    e.preventDefault()
                    setClaimOpen(true)
                  }}
                  data-testid="project-v5-claim-hero"
                >
                  Claim Project
                </Btn>
              ) : (
                <Chip $on data-testid="project-v5-official">
                  Official Project Page
                </Chip>
              )}
            </HeroCtas>

            {deployments.length > 1 ? (
              <Row style={{ marginTop: 10, gap: 6, flexWrap: 'wrap' }} data-testid="project-v5-chain-switch">
                {deployments.slice(0, 6).map((d) => (
                  <Chip
                    key={d.chainId}
                    $on={d.chainId === chainId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedChainId(d.chainId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedChainId(d.chainId)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {d.shortLabel}
                  </Chip>
                ))}
              </Row>
            ) : null}
          </div>

          <TradeWorkspace data-testid="project-v5-trade-workspace">
            <ChartSlot data-testid="project-v5-chart">
              {tradeReady ? (
                <ProjectCharts
                  slug={document.slug}
                  marketsDocument={marketsDocument}
                  variant="hero"
                  pairAddress={market.pairAddress}
                />
              ) : (
                <ChartSkeleton aria-label="Loading chart" />
              )}
            </ChartSlot>
            <SwapSlot id="project-v5-swap" data-testid="project-v5-swap">
              {tradeReady ? (
                <ProjectTradingEmbed
                  slug={document.slug}
                  marketsDocument={marketsDocument}
                  projectChainId={chainId}
                  contractAddress={contract}
                  variant="hero"
                />
              ) : (
                <SwapSkeleton aria-label="Loading Smart Swap" />
              )}
            </SwapSlot>
          </TradeWorkspace>
        </Hero>
      </DenseBand>

      <DenseBand data-testid="project-v5-market" data-project-section="market" style={{ padding: 0 }}>
        <MarketStrip>
          {(
            [
              ['Price', priceValue],
              [
                '24h',
                dash(market.trend),
                market.trendPositive === true ? 'up' : market.trendPositive === false ? 'down' : 'mute',
              ],
              ['Liquidity', dash(market.liquidity)],
              ['Volume 24h', dash(market.volume24h)],
              ['Market Cap', dash(market.marketCap)],
              ['FDV', dash(market.fdv)],
              ['Holders', dash(market.holders)],
              ['Transactions', dash(market.swaps24h)],
            ] as [string, string, 'up' | 'down' | 'mute' | undefined?][]
          ).map(([label, value, tone]) => (
            <StripCell key={label}>
              <StripLabel>{label}</StripLabel>
              <StripValue $tone={tone}>{value}</StripValue>
            </StripCell>
          ))}
        </MarketStrip>
      </DenseBand>

      {belowFold ? (
        <>
          <DenseBand data-testid="project-v5-economy" data-project-section="economy">
            <BandHead>
              <BandTitle>Project Economy</BandTitle>
              <BandMeta>
                <MelegaExploreChainBadge chainId={chainId} />
              </BandMeta>
            </BandHead>
            <EconomyGrid>
              <EconomyCard data-testid="project-v5-economy-liquidity">
                <EconomyTitle>
                  Liquidity
                  <MelegaExploreChainBadge chainId={chainId} />
                </EconomyTitle>
                {liqCount === 0 && market.liquidity === '—' ? (
                  <Muted data-testid="project-v5-economy-liquidity-empty">No liquidity pairs listed yet.</Muted>
                ) : (
                  <EconomyMeta>
                    <span>TVL · {dash(market.liquidity)}</span>
                    <span>24h Volume · {dash(market.volume24h)}</span>
                    <span>Pairs · {liqCount || '—'}</span>
                    <span>Largest pair · {pairLabel}</span>
                  </EconomyMeta>
                )}
                <MiniSpark values={[]} />
                <Btn $ghost href={`/liquidity?chain=${chainId}`} data-testid="project-v5-view-liquidity">
                  View Liquidity
                </Btn>
              </EconomyCard>
              <EconomyCard data-testid="project-v5-economy-farms">
                <EconomyTitle>Farms</EconomyTitle>
                {farmCount === 0 ? (
                  <Muted data-testid="project-v5-economy-farms-empty">No farms for this project yet.</Muted>
                ) : (
                  <EconomyMeta>
                    <span>Best APR · —</span>
                    <span>Farm TVL · —</span>
                    <span>Active farms · {farmCount}</span>
                    <span>Rewards · —</span>
                  </EconomyMeta>
                )}
                <MiniSpark values={[]} />
                <Btn $ghost href={`/farms?chain=${chainId}`} data-testid="project-v5-view-farms">
                  View Farms
                </Btn>
              </EconomyCard>
              <EconomyCard data-testid="project-v5-economy-pools">
                <EconomyTitle>Pools</EconomyTitle>
                {poolCount === 0 ? (
                  <Muted data-testid="project-v5-economy-pools-empty">No pools for this project yet.</Muted>
                ) : (
                  <EconomyMeta>
                    <span>Best APR · —</span>
                    <span>Pool TVL · —</span>
                    <span>Active pools · {poolCount ?? '—'}</span>
                    <span>Rewards · —</span>
                  </EconomyMeta>
                )}
                <MiniSpark values={[]} />
                <Btn $ghost href={`/pools?chain=${chainId}`} data-testid="project-v5-view-pools">
                  View Pools
                </Btn>
              </EconomyCard>
            </EconomyGrid>
          </DenseBand>

          <DenseBand data-testid="project-v5-boost" data-project-section="boost">
            <BoostConsole data-testid="project-v5-boost-console">
              <BandHead>
                <BandTitle>Boost Your Project</BandTitle>
                <BandMeta>Grow visibility, liquidity and holder engagement.</BandMeta>
              </BandHead>
              <BoostGrid>
                {boostTiles.map((tile) => (
                  <BoostTile
                    key={tile.id}
                    type="button"
                    onClick={() => openBoost(tile.id)}
                    data-testid={`project-v5-boost-${tile.id}`}
                    data-growth-service={tile.id}
                  >
                    <BoostIcon aria-hidden>{tile.icon}</BoostIcon>
                    <BoostName>{tile.title}</BoostName>
                    <BoostBenefit>{tile.description}</BoostBenefit>
                    <BoostPrice>{tile.priceHint}</BoostPrice>
                  </BoostTile>
                ))}
              </BoostGrid>
            </BoostConsole>
          </DenseBand>

          {!isClaimed ? (
            <DenseBand data-testid="project-v5-claim-strip" data-project-section="claim">
              <ClaimStrip>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Are you the project owner?</div>
                  <Muted style={{ margin: '2px 0 0', fontSize: 12 }}>
                    Claim this page to manage official information.
                  </Muted>
                </div>
                <Btn
                  href="#claim"
                  onClick={(e) => {
                    e.preventDefault()
                    setClaimOpen(true)
                  }}
                  data-testid="project-v5-claim-strip-cta"
                >
                  Claim Project
                </Btn>
              </ClaimStrip>
            </DenseBand>
          ) : null}

          <DenseBand data-testid="project-v5-about" data-project-section="about">
            <AboutGrid>
              <div>
                <BandHead>
                  <BandTitle>About</BandTitle>
                </BandHead>
                {aboutFull ? (
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.78)', maxWidth: '42rem' }}>
                    {aboutFull}
                  </div>
                ) : (
                  <Muted>No project description yet.</Muted>
                )}
                {tokenomicsOk ? (
                  <div style={{ marginTop: 12 }} data-testid="project-v5-tokenomics">
                    <BandMeta style={{ display: 'block', marginBottom: 4 }}>Tokenomics</BandMeta>
                    <Muted style={{ margin: 0 }}>
                      {tokenomicsDocument?.totalSupply
                        ? `Supply · ${tokenomicsDocument.totalSupply}`
                        : `${tokenomicsDocument?.allocations?.length ?? 0} allocations`}
                    </Muted>
                  </div>
                ) : null}
                {roadmapOk ? (
                  <div style={{ marginTop: 12 }} data-testid="project-v5-roadmap">
                    <BandMeta style={{ display: 'block', marginBottom: 4 }}>Roadmap</BandMeta>
                    {roadmapDocument!.milestones!.slice(0, 3).map((m) => (
                      <Muted key={m.id || m.title} style={{ display: 'block', margin: 0 }}>
                        · {m.title || 'Milestone'}
                      </Muted>
                    ))}
                  </div>
                ) : null}
              </div>
              <div data-testid="project-v5-community">
                <BandHead>
                  <BandTitle>Community</BandTitle>
                </BandHead>
                <SocialRow>
                  {website?.url ? (
                    <SocialChip href={website.url} target="_blank" rel="noreferrer">
                      Website
                    </SocialChip>
                  ) : null}
                  {xLink?.url ? (
                    <SocialChip href={xLink.url} target="_blank" rel="noreferrer">
                      X
                    </SocialChip>
                  ) : null}
                  {tgLink?.url ? (
                    <SocialChip href={tgLink.url} target="_blank" rel="noreferrer">
                      Telegram
                    </SocialChip>
                  ) : null}
                  {discordLink?.url ? (
                    <SocialChip href={discordLink.url} target="_blank" rel="noreferrer">
                      Discord
                    </SocialChip>
                  ) : null}
                  {githubLink?.url ? (
                    <SocialChip href={githubLink.url} target="_blank" rel="noreferrer">
                      Github
                    </SocialChip>
                  ) : null}
                  {!website && !xLink && !tgLink && !discordLink && !githubLink
                    ? socials.slice(0, 4).map((s) => (
                        <SocialChip key={s.url} href={s.url} target="_blank" rel="noreferrer">
                          {socialLabel(s.url, s.label)}
                        </SocialChip>
                      ))
                    : null}
                </SocialRow>
              </div>
            </AboutGrid>
          </DenseBand>

          <Accordion data-testid="project-v5-transparency" data-project-section="transparency">
            <summary>
              <span>
                Technical Transparency
                <Muted style={{ display: 'block', margin: '2px 0 0', fontWeight: 500 }}>
                  View contract, routing and registry details.
                </Muted>
              </span>
              <BandMeta>Expand</BandMeta>
            </summary>
            <AccordionBody>
              <div>Contract · {contract || '—'}</div>
              <div>
                Explorer ·{' '}
                {contract ? (
                  <a href={explorerUrlFor(contract, chainId)} target="_blank" rel="noreferrer">
                    {explorerLabelFor(chainId)}
                  </a>
                ) : (
                  '—'
                )}
              </div>
              <div>Chain · {chainId}</div>
              <div>Markets registered · {marketsDocument.markets.length || '—'}</div>
              <div>
                Readiness ·{' '}
                {readinessDocument?.readiness?.stateLabel ||
                  (readinessDocument?.readiness?.state
                    ? humanEnumLabel(String(readinessDocument.readiness.state))
                    : '—')}
              </div>
              <div>Pipeline · {GLOBAL_DATA_TRUTH_PIPELINE}</div>
            </AccordionBody>
          </Accordion>

          <DenseBand data-testid="project-v5-related" data-project-section="related">
            <BandHead>
              <BandTitle>Discover other projects</BandTitle>
              <BandMeta>Featured</BandMeta>
            </BandHead>
            <RelatedRail>
              {related.map((p) => (
                <RelatedCard
                  key={p.slug}
                  href={`/@${p.slug}`}
                  prefetch={false}
                  onClick={() => markProjectNavClick()}
                  data-testid={`project-v5-related-${p.slug}`}
                >
                  <MelegaTokenAvatar
                    symbol={p.symbol}
                    name={p.displayName}
                    address={p.address}
                    chainId={p.chainId}
                    size={28}
                    radius="circle"
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.displayName}
                    </div>
                    <Muted style={{ margin: 0, fontSize: 11 }}>{p.symbol}</Muted>
                  </div>
                </RelatedCard>
              ))}
            </RelatedRail>
          </DenseBand>
        </>
      ) : (
        <DenseBand data-testid="project-v5-below-fold-skeleton" aria-hidden>
          <Muted>Loading project economy…</Muted>
        </DenseBand>
      )}

      <StickyBuy href={buyHref} data-testid="project-v5-sticky-buy">
        Buy Token
      </StickyBuy>

      <CommercialCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        projectId={contract ? `claim:${contract.toLowerCase()}` : `claim:${document.slug}`}
        projectSlug={document.slug}
        projectContract={contract}
        chainId={chainId}
        initialService={checkoutService}
        identityReady
        onOpenClaim={() => setClaimOpen(true)}
      />
      <ClaimProjectWizardModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        projectSlug={document.slug}
        projectName={document.identity.displayName}
        projectContract={contract}
        initialDraft={{
          description: aboutFull || '',
          website: website?.url || '',
          x: xLink?.url || '',
          telegram: tgLink?.url || '',
          discord: discordLink?.url || '',
          logo: logoUrl || '',
        }}
      />
    </Page>
  )
}

export default ProjectPageV5Shell
