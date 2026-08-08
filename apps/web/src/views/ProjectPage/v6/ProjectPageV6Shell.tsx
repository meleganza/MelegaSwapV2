/**
 * Project Page V6 — founder pixel-perfect consumer trading destination.
 * Hierarchy: Hero → Market → Economy → Activity/Holders/Score → Boost → Community → About → Related
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
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import { useProtocolActivityFeed } from 'lib/protocol-activity/useProtocolActivityFeed'
import { readinessStateFromScore } from 'registry/projects/identity/readiness/schema'
import { humanEnumLabel } from '../presentation/humanLabels'
import { Band, BandHead, BandMeta, BandTitle, Btn, Chip, Muted, Page, Row, pp } from '../v1/theme'
import {
  buildProjectChainDeployments,
  defaultSelectedChainId,
  explorerLabelFor,
  explorerUrlFor,
  filterParticipationByChain,
  getPrimaryAssetForChain,
  getSocialResources,
} from '../v1/helpers'
import { useProjectLiveMarket } from '../v1/useProjectLiveMarket'
import { useProjectEconomyByToken } from './useProjectEconomyByToken'
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
  min-height: 160px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.6), rgba(10, 10, 10, 0.85));
`
const SwapSkeleton = styled.div`
  min-height: 200px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 20, 20, 0.55), rgba(10, 10, 10, 0.8));
`

const ProjectCharts = dynamic(() => import('../v1/ProjectCharts'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-label="Loading chart" data-testid="project-v6-chart-skeleton" />,
})
const ProjectTradingEmbed = dynamic(() => import('../v1/ProjectTradingEmbed'), {
  ssr: false,
  loading: () => <SwapSkeleton aria-label="Loading Smart Swap" data-testid="project-v6-swap-skeleton" />,
})

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 0.34fr) minmax(0, 0.66fr);
    gap: 18px;
    align-items: stretch;
    max-height: min(72vh, 520px);
  }
`
const LogoWrap = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${pp.line};
  background: #111;
`
const HeroName = styled.h1`
  margin: 0;
  font-size: clamp(22px, 2.2vw, 28px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: #fff;
`
const Ticker = styled.span`
  font-size: 14px;
  font-weight: 750;
  color: ${pp.gold};
`
const Desc = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`
const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`
const IconBtn = styled.a`
  width: 36px;
  height: 36px;
  min-height: 40px;
  min-width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-weight: 750;
  &:hover {
    border-color: ${pp.goldLine};
    color: #fff;
  }
`
const IconAction = styled.button`
  width: 36px;
  height: 36px;
  min-height: 40px;
  min-width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  color: ${pp.gold};
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  font-size: 11px;
  font-weight: 750;
`
const ContractRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #c8c8c8;
  min-width: 0;
`
const ContractAddr = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (min-width: 960px) {
    text-overflow: clip;
    overflow: visible;
    white-space: nowrap;
  }
`
const Terminal = styled.div<{ $chartless?: boolean }>`
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: ${pp.radius};
  border: 1px solid rgba(244, 196, 48, 0.18);
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.98), rgba(10, 10, 10, 0.98));
  overflow: hidden;
  min-height: ${({ $chartless }) => ($chartless ? '280px' : '360px')};
`
const ChartSlot = styled.div<{ $collapsed?: boolean }>`
  flex: ${({ $collapsed }) => ($collapsed ? '0 0 auto' : '1.35 1 0')};
  min-height: ${({ $collapsed }) => ($collapsed ? '0' : '180px')};
  padding: ${({ $collapsed }) => ($collapsed ? '6px 10px 0' : '8px 10px 4px')};
  border-bottom: ${({ $collapsed }) => ($collapsed ? '0' : `1px solid ${pp.line}`)};
  @media (min-width: 960px) {
    min-height: ${({ $collapsed }) => ($collapsed ? '0' : '220px')};
  }
`
const SwapSlot = styled.div<{ $expand?: boolean }>`
  flex: ${({ $expand }) => ($expand ? '1.6 1 0' : '1 1 0')};
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
  grid-auto-columns: minmax(96px, 1fr);
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  @media (min-width: 768px) and (max-width: 959px) {
    grid-auto-flow: unset;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(2, auto);
    overflow: visible;
  }
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
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${pp.mute2};
  margin-bottom: 3px;
`
const StripValue = styled.div<{ $tone?: 'up' | 'down' | 'mute' }>`
  font-size: 15px;
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
  padding: 12px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  min-height: 0;
`
const EconomyTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
`
const EconomyMeta = styled.div`
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  flex: 1;
`
const IntelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`
const IntelCard = styled.div`
  padding: 12px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  min-height: 140px;
`
const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 12px;
  &:last-child {
    border-bottom: 0;
  }
`
const ScoreGauge = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  margin: 8px auto 10px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 50% 45%, rgba(244, 196, 48, 0.18), transparent 62%),
    conic-gradient(${pp.gold} var(--score-deg, 0deg), rgba(255, 255, 255, 0.08) 0);
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #0e0e0e;
  }
`
const ScoreValue = styled.div`
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 850;
  color: #fff;
`
const BoostConsole = styled.div`
  border-radius: ${pp.radius};
  border: 1px solid ${pp.goldLine};
  background: linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  padding: 10px 12px;
`
const BoostRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`
const BoostTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 64px;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(0, 0, 0, 0.28);
  color: inherit;
  cursor: pointer;
  &:hover {
    border-color: ${pp.goldLine};
  }
`
const ReactRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`
const ReactBtn = styled.button<{ $on?: boolean }>`
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? pp.goldLine : pp.line)};
  background: ${({ $on }) => ($on ? 'rgba(244,196,48,0.12)' : 'rgba(255,255,255,0.02)')};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`
const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  }
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
const DenseBand = styled(Band)`
  margin-bottom: 8px;
`
const ScoreOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10040;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  padding: 16px;
`
const ScoreDetails = styled.div`
  border: 1px solid ${pp.line};
  border-radius: 12px;
  background: #111;
  color: #fff;
  padding: 16px;
  max-width: 360px;
  width: 100%;
`
const WalletIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  button {
    min-width: 40px !important;
    min-height: 40px !important;
    width: 40px !important;
    height: 40px !important;
    padding: 0 !important;
    border-radius: 10px !important;
  }
`

function shortWallet(w?: string) {
  if (!w || w.length < 10) return '—'
  return `${w.slice(0, 6)}…${w.slice(-4)}`
}
function timeAgo(ts?: number) {
  if (!ts) return '—'
  const sec = Math.max(0, Math.floor(Date.now() / 1000 - ts))
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86400)}d`
}

export type ProjectPageV6Props = {
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  evidencePack?: ProjectEvidencePack | null
  readinessDocument?: ProjectReadinessDocument | null
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

export const ProjectPageV6Shell: React.FC<ProjectPageV6Props> = ({
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
  const [chartHistory, setChartHistory] = useState<boolean | null>(null)
  const [localReact, setLocalReact] = useState<string | null>(null)
  const [scoreOpen, setScoreOpen] = useState(false)

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
      : null
  const logoUrl =
    document.identity.logoUrl?.meta?.availability === 'AVAILABLE' ? document.identity.logoUrl.value : undefined
  const socials = getSocialResources(document)
  const website = document.resources.find((r) => r.resourceType === 'website')
  const xLink = socials.find((s) => /twitter|x\.com/i.test(s.url) || /\bx\b/i.test(s.label))
  const tgLink = socials.find((s) => /t\.me|telegram/i.test(s.url) || /telegram/i.test(s.label))
  const discordLink = socials.find((s) => /discord/i.test(s.url) || /discord/i.test(s.label))

  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length, contract, chainId, {
    deferHoldersMs: 1800,
  })

  const chainLiquidity = useMemo(
    () => filterParticipationByChain(participationDocument.pools, chainId),
    [participationDocument.pools, chainId],
  )
  const economy = useProjectEconomyByToken({
    chainId,
    tokenAddress: contract,
    liquidityPairCount: chainLiquidity.length,
    largestPairLabel: chainLiquidity[0]?.displayLabel || (symbol ? `${symbol} / WBNB` : null),
  })

  const activityFeed = useProtocolActivityFeed()
  const projectActivity = useMemo(() => {
    const addr = contract?.toLowerCase()
    if (!addr) return []
    return (activityFeed.rows || [])
      .filter((r) => {
        const assets = (r.assetAddresses || []).map((a) => a.toLowerCase())
        return assets.includes(addr) || r.contractAddress?.toLowerCase() === addr
      })
      .slice(0, 5)
  }, [activityFeed.rows, contract])

  const featuredPkg = getFeaturedPackage('featured_1w')
  const trendPkg = getTrendBoostPackage('trend_6h')
  const openBoost = useCallback((service: CommercialServiceId) => {
    if (service === 'claim-project') {
      setClaimOpen(true)
      return
    }
    const svc = COMMERCIAL_SERVICES.find((s) => s.id === service)
    if (svc?.externalHref) {
      window.location.href = svc.externalHref(chainId)
      return
    }
    setCheckoutService(service)
    setCheckoutOpen(true)
  }, [chainId])

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
      : null

  const isFeaturedPlacement = ['mm72', 'eyed', 'young-degens', 'blion', 'marco'].includes(document.slug)
  const isClaimed = Boolean(
    evidencePack?.claims?.some((c) => /accepted|verified|owned|claimed/i.test(String(c.status ?? c.id ?? ''))),
  )
  const isVerified = Boolean(verified && /verif/i.test(verified))

  const related = useMemo(
    () => resolveFounderFeaturedProjects().filter((p) => p.slug !== document.slug).slice(0, 4),
    [document.slug],
  )

  const score = readinessDocument?.readiness?.score
  const scoreBand =
    typeof score === 'number'
      ? humanEnumLabel(String(readinessStateFromScore(score)))
      : '—'
  const scoreMeasured = readinessDocument?.generatedAt
    ? timeAgo(Math.floor(new Date(readinessDocument.generatedAt).getTime() / 1000))
    : '—'

  const boostTiles = useMemo(
    () =>
      COMMERCIAL_SERVICES.map((s) => {
        if (s.id === 'featured') return { ...s, priceHint: `$${featuredPkg.usdPrice}` }
        if (s.id === 'trend-boost') return { ...s, title: 'Trend Boost', priceHint: `$${trendPkg.usdPrice}` }
        if (s.id === 'claim-project') return { ...s, title: 'Claim', priceHint: 'Wizard' }
        if (s.id === 'create-farm') return { ...s, title: 'Create Farm', priceHint: 'Studio' }
        if (s.id === 'create-pool') return { ...s, title: 'Create Pool', priceHint: 'Studio' }
        if (s.id === 'liquidity') return { ...s, title: 'Create Liquidity', priceHint: 'Studio' }
        return s
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
  }, [market.loading, market.priceUsd])

  useEffect(() => {
    if (!tradeReady) return
    const t = window.setTimeout(() => {
      markProjectChartReady()
      markProjectSwapReady()
    }, 50)
    return () => window.clearTimeout(t)
  }, [tradeReady])

  const chartCollapsed = chartHistory === false
  const pairLabel = economy.liquidity.largestPair || (symbol ? `${symbol} / WBNB` : '—')

  return (
    <Page
      id="project-page-v6"
      data-testid="project-page-v6"
      data-project-page="v6"
      data-project-slug={document.slug}
      data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}
      data-pp-shell="1"
    >
      <DenseBand data-testid="project-v6-hero" data-project-section="hero">
        <Hero>
          <div data-testid="project-v6-hero-left">
            <Row style={{ gap: 12, alignItems: 'center' }}>
              <LogoWrap data-testid="project-v6-logo">
                <MelegaTokenAvatar
                  symbol={symbol ?? document.identity.displayName}
                  name={document.identity.displayName}
                  address={contract ?? undefined}
                  chainId={chainId}
                  logoURI={logoUrl}
                  size={56}
                />
              </LogoWrap>
              <div style={{ minWidth: 0 }}>
                <HeroName data-testid="project-v6-name">{document.identity.displayName}</HeroName>
                <Row style={{ gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {symbol ? <Ticker data-testid="project-v6-symbol">${symbol}</Ticker> : null}
                  {isVerified ? (
                    <Chip $on data-testid="project-v6-verified">
                      Verified
                    </Chip>
                  ) : null}
                  {isFeaturedPlacement ? <Chip $on data-testid="project-v6-featured">Featured</Chip> : null}
                  {isClaimed ? (
                    <Chip $on data-testid="project-v6-official">
                      Official
                    </Chip>
                  ) : null}
                  <span data-testid="project-v6-chain">
                    <MelegaExploreChainBadge chainId={chainId} />
                  </span>
                </Row>
              </div>
            </Row>

            {description ? <Desc data-testid="project-v6-desc">{description}</Desc> : null}

            <IconRow data-testid="project-v6-socials">
              {website?.url ? (
                <IconBtn href={website.url} target="_blank" rel="noreferrer" aria-label="Website" title="Website">
                  Web
                </IconBtn>
              ) : null}
              {xLink?.url ? (
                <IconBtn href={xLink.url} target="_blank" rel="noreferrer" aria-label="X" title="X">
                  X
                </IconBtn>
              ) : null}
              {tgLink?.url ? (
                <IconBtn href={tgLink.url} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram">
                  TG
                </IconBtn>
              ) : null}
              {discordLink?.url ? (
                <IconBtn href={discordLink.url} target="_blank" rel="noreferrer" aria-label="Discord" title="Discord">
                  DC
                </IconBtn>
              ) : null}
            </IconRow>

            {contract ? (
              <ContractRow data-testid="project-v6-contract">
                <ContractAddr title={contract}>{contract}</ContractAddr>
                <IconAction type="button" onClick={onCopy} aria-label="Copy contract" data-testid="project-v6-copy">
                  {copied ? '✓' : 'Copy'}
                </IconAction>
                <IconBtn
                  href={explorerUrlFor(contract, chainId)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={explorerLabelFor(chainId)}
                  data-testid="project-v6-explorer"
                >
                  ↗
                </IconBtn>
                <WalletIconWrap data-testid="project-v6-metamask">
                  <AddToWalletButton
                    tokenAddress={contract}
                    tokenSymbol={symbol ?? document.identity.displayName}
                    tokenDecimals={tokenDecimals}
                    tokenLogo={logoUrl || ''}
                    textOptions={AddToWalletTextOptions.NO_TEXT}
                  />
                </WalletIconWrap>
              </ContractRow>
            ) : null}

            {deployments.length > 1 ? (
              <Row style={{ marginTop: 10, gap: 6, flexWrap: 'wrap' }} data-testid="project-v6-chain-switch">
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

          <Terminal data-testid="project-v6-terminal" $chartless={chartCollapsed}>
            <ChartSlot data-testid="project-v6-chart" $collapsed={chartCollapsed}>
              {tradeReady ? (
                <ProjectCharts
                  slug={document.slug}
                  marketsDocument={marketsDocument}
                  variant="hero"
                  pairAddress={market.pairAddress}
                  onHistoryAvailability={setChartHistory}
                />
              ) : (
                <ChartSkeleton aria-label="Loading chart" />
              )}
            </ChartSlot>
            <SwapSlot id="project-v6-swap" data-testid="project-v6-swap" $expand={chartCollapsed}>
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
          </Terminal>
        </Hero>
      </DenseBand>

      <DenseBand data-testid="project-v6-market" data-project-section="market" style={{ padding: 0 }}>
        <MarketStrip>
          {(
            [
              ['Price', dash(market.priceUsd)],
              [
                '24H',
                dash(market.trend),
                market.trendPositive === true ? 'up' : market.trendPositive === false ? 'down' : 'mute',
              ],
              ['Liquidity', dash(market.liquidity)],
              ['24H Volume', dash(market.volume24h)],
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
          <DenseBand data-testid="project-v6-economy" data-project-section="economy">
            <BandHead>
              <BandTitle>Project Economy</BandTitle>
              <BandMeta>
                <MelegaExploreChainBadge chainId={chainId} />
              </BandMeta>
            </BandHead>
            <EconomyGrid>
              <EconomyCard data-testid="project-v6-economy-liquidity">
                <EconomyTitle>Liquidity</EconomyTitle>
                <EconomyMeta>
                  <span>TVL · {dash(market.liquidity)}</span>
                  <span>24H Volume · {dash(market.volume24h)}</span>
                  <span>Pairs · {economy.liquidity.pairCount || '—'}</span>
                  <span>Largest · {economy.liquidity.largestPair || pairLabel}</span>
                </EconomyMeta>
                <Btn $ghost href={`/liquidity-studio?chain=${chainId}`} data-testid="project-v6-view-liquidity">
                  View Liquidity
                </Btn>
              </EconomyCard>
              <EconomyCard data-testid="project-v6-economy-farms">
                <EconomyTitle>Farms</EconomyTitle>
                {economy.farms.searched && economy.farms.count === 0 ? (
                  <Muted data-testid="project-v6-economy-farms-empty">No active farms</Muted>
                ) : (
                  <EconomyMeta>
                    <span>Active · {economy.farms.count || '—'}</span>
                    <span>Best APR · {economy.farms.bestAprDisplay}</span>
                    <span>Farm TVL · {economy.farms.tvlDisplay}</span>
                    <span>Reward · {economy.farms.rewardToken || '—'}</span>
                  </EconomyMeta>
                )}
                <Btn $ghost href={`/farms?chain=${chainId}`} data-testid="project-v6-view-farms">
                  View Farms
                </Btn>
              </EconomyCard>
              <EconomyCard data-testid="project-v6-economy-pools">
                <EconomyTitle>Pools</EconomyTitle>
                {economy.pools.searched && economy.pools.count === 0 ? (
                  <Muted data-testid="project-v6-economy-pools-empty">No active pools</Muted>
                ) : (
                  <EconomyMeta>
                    <span>Active · {economy.pools.count || '—'}</span>
                    <span>Best APR · {economy.pools.bestAprDisplay}</span>
                    <span>Pool TVL · {economy.pools.tvlDisplay}</span>
                    <span>Reward · {economy.pools.rewardToken || '—'}</span>
                  </EconomyMeta>
                )}
                <Btn $ghost href={`/pools?chain=${chainId}`} data-testid="project-v6-view-pools">
                  View Pools
                </Btn>
              </EconomyCard>
            </EconomyGrid>
          </DenseBand>

          <DenseBand data-testid="project-v6-intel" data-project-section="intel">
            <IntelGrid>
              <IntelCard data-testid="project-v6-activity">
                <BandHead>
                  <BandTitle>Latest Activity</BandTitle>
                </BandHead>
                {projectActivity.length === 0 ? (
                  <Muted data-testid="project-v6-activity-empty">—</Muted>
                ) : (
                  projectActivity.map((row) => (
                    <ActivityRow key={`${row.transactionHash}-${row.logIndex}`}>
                      <span style={{ color: /sell|remove/i.test(row.eventType) ? pp.bad : pp.ok }}>
                        {/sell|remove/i.test(row.eventType) ? 'Sell' : 'Buy'}
                      </span>
                      <span>
                        {(row.amounts?.[0] || row.resolvedSymbols?.[0] || '—').toString().slice(0, 18)} ·{' '}
                        {shortWallet(row.wallet)}
                      </span>
                      <span style={{ color: pp.mute }}>{timeAgo(row.timestamp)}</span>
                    </ActivityRow>
                  ))
                )}
                <Btn
                  $ghost
                  href={`/info/tokens/${contract || ''}`}
                  style={{ marginTop: 8 }}
                  data-testid="project-v6-view-tx"
                >
                  View all transactions
                </Btn>
              </IntelCard>

              <IntelCard data-testid="project-v6-holders">
                <BandHead>
                  <BandTitle>Holders</BandTitle>
                </BandHead>
                <div style={{ fontSize: 28, fontWeight: 850, margin: '8px 0' }}>{dash(market.holders)}</div>
                <Muted style={{ margin: 0 }}>Total holders</Muted>
                <Muted style={{ margin: '8px 0 0', fontSize: 11 }} data-testid="project-v6-holders-dist">
                  Distribution — (no certified concentration data)
                </Muted>
              </IntelCard>

              <IntelCard data-testid="project-v6-score">
                <BandHead>
                  <BandTitle>Melega Score</BandTitle>
                </BandHead>
                <button
                  type="button"
                  onClick={() => setScoreOpen(true)}
                  style={{ border: 0, background: 'transparent', width: '100%', cursor: 'pointer', color: 'inherit' }}
                  data-testid="project-v6-score-open"
                >
                  <ScoreGauge
                    style={
                      {
                        ['--score-deg' as string]: `${Math.max(0, Math.min(100, Number(score) || 0)) * 3.6}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <ScoreValue>{typeof score === 'number' ? Math.round(score) : '—'}</ScoreValue>
                  </ScoreGauge>
                  <div style={{ textAlign: 'center', fontWeight: 750 }}>{scoreBand}</div>
                  <Muted style={{ textAlign: 'center', margin: '4px 0 0' }}>Measured {scoreMeasured} ago</Muted>
                </button>
              </IntelCard>
            </IntelGrid>
          </DenseBand>

          <DenseBand data-testid="project-v6-boost" data-project-section="boost">
            <BoostConsole data-testid="project-v6-boost-console">
              <BandHead>
                <BandTitle>Boost Your Project</BandTitle>
              </BandHead>
              <BoostRow>
                {boostTiles.map((tile) => (
                  <BoostTile
                    key={tile.id}
                    type="button"
                    onClick={() => openBoost(tile.id)}
                    data-testid={`project-v6-boost-${tile.id}`}
                    data-growth-service={tile.id}
                  >
                    <span aria-hidden style={{ color: pp.gold }}>
                      {tile.icon}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{tile.title}</span>
                    <span style={{ fontSize: 10, color: pp.gold }}>{tile.priceHint}</span>
                  </BoostTile>
                ))}
              </BoostRow>
            </BoostConsole>
          </DenseBand>

          <DenseBand data-testid="project-v6-community-react" data-project-section="community">
            <BandHead>
              <BandTitle>Community</BandTitle>
              <BandMeta data-testid="project-v6-react-persistence">Local preview · persistence unavailable</BandMeta>
            </BandHead>
            <ReactRow>
              {[
                ['like', '👍 Like'],
                ['bullish', '🔥 Bullish'],
                ['moon', '🚀 Moon'],
                ['watching', '👀 Watching'],
              ].map(([id, label]) => (
                <ReactBtn
                  key={id}
                  type="button"
                  $on={localReact === id}
                  onClick={() => setLocalReact((v) => (v === id ? null : id))}
                  data-testid={`project-v6-react-${id}`}
                  title="Reactions persist when community backend is available"
                >
                  {label}
                </ReactBtn>
              ))}
            </ReactRow>
          </DenseBand>

          <DenseBand data-testid="project-v6-about" data-project-section="about">
            <AboutGrid>
              <div>
                <BandHead>
                  <BandTitle>About</BandTitle>
                </BandHead>
                {aboutFull && aboutFull !== description ? (
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.78)' }}>{aboutFull}</div>
                ) : description ? (
                  <Muted>See project summary in the hero.</Muted>
                ) : (
                  <Muted>—</Muted>
                )}
                {tokenomicsDocument?.totalSupply ? (
                  <Muted style={{ display: 'block', marginTop: 8 }}>Supply · {String(tokenomicsDocument.totalSupply)}</Muted>
                ) : null}
                {roadmapDocument?.milestones?.length ? (
                  <Muted style={{ display: 'block', marginTop: 4 }}>
                    Roadmap · {roadmapDocument.milestones.length} milestones
                  </Muted>
                ) : null}
              </div>
              <div data-testid="project-v6-links">
                <BandHead>
                  <BandTitle>Links</BandTitle>
                </BandHead>
                <IconRow>
                  {website?.url ? (
                    <IconBtn href={website.url} target="_blank" rel="noreferrer">
                      Website
                    </IconBtn>
                  ) : null}
                  {xLink?.url ? (
                    <IconBtn href={xLink.url} target="_blank" rel="noreferrer">
                      X
                    </IconBtn>
                  ) : null}
                  {tgLink?.url ? (
                    <IconBtn href={tgLink.url} target="_blank" rel="noreferrer">
                      Telegram
                    </IconBtn>
                  ) : null}
                </IconRow>
              </div>
            </AboutGrid>
          </DenseBand>

          <DenseBand data-testid="project-v6-related" data-project-section="related">
            <BandHead>
              <BandTitle>Discover other projects</BandTitle>
            </BandHead>
            <RelatedRail>
              {related.map((p) => (
                <RelatedCard
                  key={p.slug}
                  href={`/@${p.slug}`}
                  prefetch={false}
                  onClick={() => markProjectNavClick()}
                  data-testid={`project-v6-related-${p.slug}`}
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
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 750,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.displayName}
                    </div>
                    <Muted style={{ margin: 0, fontSize: 11 }}>
                      {p.symbol} · {p.chainId === 56 ? 'BNB' : p.chainId}
                    </Muted>
                  </div>
                </RelatedCard>
              ))}
            </RelatedRail>
          </DenseBand>
        </>
      ) : (
        <DenseBand data-testid="project-v6-below-fold-skeleton" aria-hidden>
          <Muted>Loading project intelligence…</Muted>
        </DenseBand>
      )}

      {scoreOpen ? (
        <ScoreOverlay role="presentation" onClick={() => setScoreOpen(false)}>
          <ScoreDetails
            role="dialog"
            aria-modal="true"
            data-testid="project-v6-score-details"
            onClick={(e) => e.stopPropagation()}
          >
            <BandTitle style={{ marginBottom: 8 }}>Melega Score</BandTitle>
            <Muted style={{ margin: 0 }}>
              Project readiness score from certified identity evidence. Not investment advice. Platform Audit Melega
              Score lives in Audit Center.
            </Muted>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setScoreOpen(false)}
                style={{
                  minHeight: 40,
                  padding: '0 14px',
                  borderRadius: 9,
                  border: `1px solid ${pp.line}`,
                  background: 'transparent',
                  color: '#fff',
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </ScoreDetails>
        </ScoreOverlay>
      ) : null}

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
          description: aboutFull || description || '',
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

export default ProjectPageV6Shell
