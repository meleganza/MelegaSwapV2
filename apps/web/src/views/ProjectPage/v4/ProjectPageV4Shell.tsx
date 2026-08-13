/**
 * Project Page V4 — premium conversion surface (DexScreener / CMC density + Melega brand).
 * Reuses TradingEmbed / Charts / live market — does not modify Smart Swap logic.
 */
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectUpdatesDocument } from 'registry/projects/identity/updates'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import type { ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import type { ProjectGovernanceDocument } from 'registry/projects/identity/governance'
import type { ProjectGrowthDocument } from 'registry/projects/identity/growth'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import { getFeaturedPackage, getTrendBoostPackage } from 'lib/monetization/packages'
import { CommercialCheckoutModal } from 'views/shared/monetization/CommercialCheckoutModal'
import { ClaimProjectWizardModal } from 'views/shared/monetization/ClaimProjectWizardModal'
import { ProjectMarketingHistory } from 'views/shared/monetization/ProjectMarketingHistory'
import { COMMERCIAL_SERVICES, type CommercialServiceId } from 'views/shared/monetization/commercialCheckoutTypes'
import { FeaturedProjectsSection } from 'views/ProjectsStudio/components/FeaturedProjectsSection'
import { truthDash } from 'lib/data-truth'
import { countNormalizedFarmsByChain, poolInventoryCount } from 'lib/data-truth/globalYieldInventory'
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
import ProjectTradingEmbed from '../v1/ProjectTradingEmbed'
import ProjectCharts from '../v1/ProjectCharts'

const dash = (v?: string | null) => truthDash(v)

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr);
    align-items: start;
    gap: 14px;
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
  font-size: clamp(22px, 3.4vw, 30px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.1;
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
  max-width: 36rem;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  word-break: break-all;
`

const RightCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Chart dominates ~60% of the right column; swap integrates below */
  > [data-chart-variant='hero'],
  > [data-testid='project-v4-chart'] {
    flex: 1.6 1 auto;
    min-height: 0;
  }
`

const ChartSlot = styled.div`
  min-width: 0;
  flex: 1.65 1 auto;
`

const SwapAnchor = styled.div`
  scroll-margin-top: 72px;
  min-width: 0;
  flex: 1 1 auto;

  /* Integrated swap chrome — same page graphics, not iframe-like */
  [data-testid='project-v1-smart-swap-hero'] {
    max-height: min(280px, 36vh);
    overflow: auto;
    border-radius: 12px;
    border: 1px solid ${pp.line};
    background: linear-gradient(165deg, rgba(18, 18, 18, 0.98), rgba(10, 10, 10, 0.98));
  }

  @media (min-width: 1280px) {
    [data-testid='project-v1-smart-swap-hero'] {
      max-height: min(300px, 38vh);
    }
  }
`

const HeroCtas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  align-items: center;
`

const MarketStrip = styled.div`
  display: flex;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(0, 0, 0, 0.25);

  &::-webkit-scrollbar {
    height: 4px;
  }
`

const StripCell = styled.div`
  flex: 1 0 auto;
  min-width: 88px;
  padding: 8px 10px;
  border-right: 1px solid ${pp.line};

  &:last-child {
    border-right: 0;
  }
`

const StripLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${pp.mute2};
`

const StripValue = styled.div<{ $tone?: 'up' | 'down' | 'mute' }>`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  color: ${({ $tone }) =>
    $tone === 'up' ? pp.ok : $tone === 'down' ? pp.bad : $tone === 'mute' ? pp.mute : '#fff'};
  white-space: nowrap;
`

const ActionBar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const EconomyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const EconomyCard = styled.div`
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const EconomyTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const EconomyMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.68);
`

const SparkStub = styled.svg`
  width: 100%;
  height: 28px;
  margin-top: 2px;
  opacity: 0.85;
`

const GrowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const GrowCard = styled.button`
  appearance: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${pp.goldLine};
  background: rgba(244, 196, 48, 0.04);
  text-align: left;
  text-decoration: none;
  color: inherit;
  font: inherit;
  transition: border-color 150ms ease, background 150ms ease;

  &:hover {
    border-color: rgba(244, 196, 48, 0.55);
    background: rgba(244, 196, 48, 0.08);
  }
`

const GrowIcon = styled.div`
  font-size: 15px;
  line-height: 1;
  color: ${pp.gold};
  margin-bottom: 2px;
`

const GrowTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
`

const GrowBenefit = styled.div`
  font-size: 11px;
  color: ${pp.mute};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const GrowPrice = styled.div`
  margin-top: 4px;
  font-size: 14px;
  font-weight: 800;
  color: ${pp.gold};
`

const GrowDuration = styled.div`
  font-size: 11px;
  color: ${pp.mute2};
`

const GrowCta = styled.span`
  margin-top: 6px;
  font-size: 12px;
  font-weight: 750;
  color: ${pp.gold};
`

const TrustRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`

const TrustBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.78);
`

const ClaimCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
`

const ClaimTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #fff;
`

const ClaimBody = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.68);
  max-width: 36rem;
`

const ClaimList = styled.ul`
  margin: 6px 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: ${pp.mute};
  columns: 1;
  max-width: 280px;
`

const DenseBand = styled(Band)`
  padding: 7px 10px;
  margin-bottom: 6px;

  @media (min-width: 768px) {
    padding: 8px 12px;
    margin-bottom: 7px;
  }
`

const AboutCompact = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  max-width: 48rem;
`

const Accordion = styled.details`
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 6px;

  summary {
    cursor: pointer;
    list-style: none;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 750;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  &[open] summary {
    border-bottom: 1px solid ${pp.line};
  }
`

const AccordionBody = styled.div`
  padding: 8px 10px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 220px;
  overflow: auto;
`

const CopyBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.04);
  color: ${pp.text};
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
`

function socialLabel(url: string, label: string): string {
  if (/twitter|x\.com/i.test(url) || /\bx\b/i.test(label)) return 'Twitter'
  if (/t\.me|telegram/i.test(url) || /telegram/i.test(label)) return 'Telegram'
  if (/discord/i.test(url) || /discord/i.test(label)) return 'Discord'
  return label
}

function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <SparkStub viewBox="0 0 100 28" aria-hidden data-testid="project-v4-spark-stub">
        <path d="M2 20 Q 25 18 50 14 T 98 10" fill="none" stroke="rgba(221,185,47,0.35)" strokeWidth="1.5" />
      </SparkStub>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100
      const y = 24 - ((v - min) / span) * 20
      return `${x},${y}`
    })
    .join(' ')
  return (
    <SparkStub viewBox="0 0 100 28" aria-hidden data-testid="project-v4-spark">
      <polyline points={pts} fill="none" stroke={pp.gold} strokeWidth="1.6" strokeLinejoin="round" />
    </SparkStub>
  )
}

export type ProjectPageV4Props = {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  readinessDocument: ProjectReadinessDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
  updatesDocument: ProjectUpdatesDocument
  ecosystemDocument: ProjectEcosystemDocument
  developerDocument: ProjectDeveloperDocument
  governanceDocument: ProjectGovernanceDocument
  growthDocument: ProjectGrowthDocument
  machineDocument: ProjectMachineDocument
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

export const ProjectPageV4Shell: React.FC<ProjectPageV4Props> = ({
  document,
  marketsDocument,
  participationDocument,
  readinessDocument,
  evidencePack,
  developerDocument,
  machineDocument,
  roadmapDocument = null,
}) => {
  const deployments = useMemo(() => buildProjectChainDeployments(document), [document])
  const [selectedChainId, setSelectedChainId] = useState(() => defaultSelectedChainId(deployments))
  const [copied, setCopied] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutService, setCheckoutService] = useState<CommercialServiceId | null>(null)
  const [claimOpen, setClaimOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
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
  const buyHref = getBuyTokenHref({ chainId, contract })
  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length, contract, chainId)
  const featuredPkg = getFeaturedPackage('featured_1w')
  const trendPkg = getTrendBoostPackage('trend_6h')
  // Growth Hub / commercial CTAs always open modal or claim wizard — never skip to intermediate pages.
  const openBoost = useCallback((service: CommercialServiceId) => {
    if (service === 'claim-project') {
      setClaimOpen(true)
      return
    }
    setCheckoutService(service)
    setCheckoutOpen(true)
  }, [])

  const boostTestId = (id: CommercialServiceId): string => {
    const map: Record<CommercialServiceId, string> = {
      featured: 'project-v4-grow-featured',
      'trend-boost': 'project-v4-grow-trend',
      'sponsored-research': 'project-v4-grow-research',
      liquidity: 'project-v4-grow-liquidity',
      'create-farm': 'project-v4-grow-farm',
      'create-pool': 'project-v4-grow-pool',
      'claim-project': 'project-v4-grow-claim',
    }
    return map[id]
  }

  const boostCards = useMemo(
    () =>
      COMMERCIAL_SERVICES.map((s) => {
        if (s.id === 'featured') {
          return { ...s, priceHint: `${featuredPkg.usdPrice} USD`, cta: 'Checkout' }
        }
        if (s.id === 'trend-boost') {
          return { ...s, priceHint: `${trendPkg.usdPrice} USD`, cta: 'Checkout' }
        }
        if (s.id === 'claim-project') {
          return { ...s, priceHint: 'Wizard', cta: 'Claim' }
        }
        if (s.id === 'liquidity') {
          return { ...s, priceHint: 'Studio', cta: 'Checkout' }
        }
        if (s.id === 'create-farm') {
          return { ...s, title: 'Farm', priceHint: 'Studio', cta: 'Checkout' }
        }
        if (s.id === 'create-pool') {
          return { ...s, title: 'Pool', priceHint: 'Studio', cta: 'Checkout' }
        }
        return { ...s, cta: 'Checkout' }
      }),
    [featuredPkg.usdPrice, trendPkg.usdPrice],
  )

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
  // Same inventory counts as Farms / Pools pages (Global Data Truth).
  const truthFarmCount = countNormalizedFarmsByChain()[chainId] || chainFarms.length
  const truthPoolCount = poolInventoryCount(chainId) || chainPools.length
  const truthLiquidityCount = chainLiquidity.length || '—'

  const tokenDecimals =
    primary?.decimals?.meta?.availability === 'AVAILABLE' && typeof primary.decimals.value === 'number'
      ? primary.decimals.value
      : 18

  const description =
    document.identity.description?.meta?.availability === 'AVAILABLE'
      ? document.identity.description.value
      : document.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
        ? document.identity.shortPurpose.value
        : null

  const categories = document.identity.categories?.filter(Boolean) ?? []
  const pairLabel =
    chainLiquidity[0]?.displayLabel ||
    (symbol ? `${symbol} / WBNB` : '—')

  const priceValue = dash(market.priceUsd !== 'Unavailable' ? market.priceUsd : market.priceBnb)
  const shortContract = contract ? `${contract.slice(0, 6)}…${contract.slice(-4)}` : null

  const onCopy = useCallback(() => {
    if (!contract || typeof navigator === 'undefined') return
    void navigator.clipboard?.writeText(contract).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }, [contract])

  const hasAbout =
    Boolean(description) ||
    categories.length > 0 ||
    Boolean(website?.url) ||
    socials.length > 0 ||
    Boolean(roadmapDocument?.milestones?.length)

  const isFeaturedPlacement = ['mm72', 'eyed', 'young-degens', 'blion', 'marco'].includes(document.slug)

  const readinessLabel = readinessDocument?.readiness?.stateLabel
    ? readinessDocument.readiness.stateLabel
    : readinessDocument?.readiness?.state
      ? humanEnumLabel(String(readinessDocument.readiness.state))
      : '—'

  const evidenceCount =
    evidencePack?.evidence?.length ??
    evidencePack?.claims?.length ??
    null

  return (
    <Page
      id="project-page-v4"
      data-testid="project-page-v4"
      data-project-page="v4"
      data-project-slug={document.slug}
    >
      {/* HERO — 40% identity | 60% chart + swap */}
      <DenseBand data-testid="project-v4-hero" data-project-section="hero">
        <Hero>
          <div data-testid="project-v4-hero-left">
            <Row style={{ gap: 12, alignItems: 'center' }}>
              <LogoWrap>
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
                <HeroName>{document.identity.displayName}</HeroName>
                <Row style={{ gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {symbol ? <Ticker>${symbol}</Ticker> : null}
                  <Chip $on={/verif/i.test(verified)}>{verified}</Chip>
                  {isFeaturedPlacement ? <Chip $on>Featured</Chip> : null}
                  <MelegaExploreChainBadge chainId={chainId} />
                </Row>
              </div>
            </Row>

            <TrustRow data-testid="project-v4-trust-badges">
              <TrustBadge data-testid="trust-verified">Verified · {verified}</TrustBadge>
              <TrustBadge data-testid="trust-liquidity">Liquidity · {dash(market.liquidity)}</TrustBadge>
              <TrustBadge data-testid="trust-community">
                Community · {socials.length ? `${socials.length} links` : '—'}
              </TrustBadge>
              <TrustBadge data-testid="trust-audit">
                Audit · {readinessLabel !== '—' ? readinessLabel : 'Pending'}
              </TrustBadge>
              <TrustBadge data-testid="trust-age">Age · —</TrustBadge>
              <TrustBadge data-testid="trust-volume">Volume · {dash(market.volume24h)}</TrustBadge>
            </TrustRow>

            {categories.length ? (
              <Row style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }} data-testid="project-v4-categories">
                {categories.slice(0, 4).map((c) => (
                  <Chip key={c}>{c}</Chip>
                ))}
              </Row>
            ) : null}

            {deployments.length > 1 ? (
              <Row style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
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

            {description ? <Desc>{description}</Desc> : null}

            <Row style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
              {website?.url ? (
                <Btn $ghost href={website.url} target="_blank" rel="noreferrer" data-testid="project-v4-website">
                  Website
                </Btn>
              ) : null}
              {tgLink?.url ? (
                <Btn $ghost href={tgLink.url} target="_blank" rel="noreferrer" data-testid="project-v4-telegram">
                  Telegram
                </Btn>
              ) : null}
              {xLink?.url ? (
                <Btn $ghost href={xLink.url} target="_blank" rel="noreferrer" data-testid="project-v4-twitter">
                  X
                </Btn>
              ) : null}
              {discordLink?.url ? (
                <Btn $ghost href={discordLink.url} target="_blank" rel="noreferrer" data-testid="project-v4-discord">
                  Discord
                </Btn>
              ) : null}
              {!website && !xLink && !tgLink && !discordLink
                ? socials.slice(0, 3).map((s) => (
                    <Btn key={s.url} $ghost href={s.url} target="_blank" rel="noreferrer">
                      {socialLabel(s.url, s.label)}
                    </Btn>
                  ))
                : null}
            </Row>

            {contract ? (
              <ContractRow data-testid="project-v4-contract">
                <span>Contract · {shortContract}</span>
                <CopyBtn type="button" onClick={onCopy} data-testid="project-v4-copy-contract">
                  {copied ? 'Copied' : 'Copy'}
                </CopyBtn>
                <Btn
                  $ghost
                  href={explorerUrlFor(contract, chainId)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="project-v4-explorer"
                >
                  {explorerLabelFor(chainId)}
                </Btn>
              </ContractRow>
            ) : null}

            <HeroCtas data-testid="project-v4-hero-ctas">
              <Btn $primary href={buyHref} data-testid="project-v4-buy-hero">
                Buy Token
              </Btn>
              <Btn
                $ghost
                href="#claim-wizard"
                onClick={(e) => {
                  e.preventDefault()
                  setClaimOpen(true)
                }}
                data-testid="project-v4-claim-hero"
              >
                Claim Project
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
            </HeroCtas>
          </div>

          <RightCol data-testid="project-v4-hero-right">
            <ChartSlot data-testid="project-v4-chart">
              <ProjectCharts
                slug={document.slug}
                marketsDocument={marketsDocument}
                variant="hero"
                pairAddress={market.pairAddress}
              />
            </ChartSlot>
            <SwapAnchor id="project-v4-swap" data-testid="project-v4-swap">
              <ProjectTradingEmbed
                slug={document.slug}
                marketsDocument={marketsDocument}
                projectChainId={chainId}
                contractAddress={contract}
                variant="hero"
              />
            </SwapAnchor>
          </RightCol>
        </Hero>
      </DenseBand>

      {/* MARKET STRIP — single dense row */}
      <DenseBand data-testid="project-v4-market" data-project-section="market" style={{ padding: 0 }}>
        <MarketStrip>
          {(
            [
              ['Price', priceValue],
              [
                '24h',
                dash(market.trend),
                market.trendPositive === true ? 'up' : market.trendPositive === false ? 'down' : 'mute',
              ],
              ['Volume', dash(market.volume24h)],
              ['Liquidity', dash(market.liquidity)],
              ['Market Cap', dash(market.marketCap)],
              ['FDV', dash(market.fdv)],
              ['Holders', dash(market.holders)],
              ['Transactions', dash(market.swaps24h)],
              ['Last update', market.lastUpdate || '—'],
            ] as [string, string, 'up' | 'down' | 'mute' | undefined?][]
          ).map(([label, value, tone]) => (
            <StripCell key={label}>
              <StripLabel>{label}</StripLabel>
              <StripValue $tone={tone}>{value}</StripValue>
            </StripCell>
          ))}
        </MarketStrip>
      </DenseBand>

      {/* ACTION BAR — conversion CTAs open checkout / claim (no dead links) */}
      <DenseBand data-testid="project-v4-actions" data-project-section="actions" style={{ paddingTop: 6, paddingBottom: 6 }}>
        <ActionBar>
          <Btn $primary href={buyHref} data-testid="project-v4-buy">
            Buy Token
          </Btn>
          <Btn $ghost href={buyHref} data-testid="project-v4-trade">
            Trade
          </Btn>
          <Btn
            href="#boost-liquidity"
            onClick={(e) => {
              e.preventDefault()
              openBoost('liquidity')
            }}
            data-testid="project-v4-liquidity"
          >
            Liquidity
          </Btn>
          <Btn
            href="#boost-farm"
            onClick={(e) => {
              e.preventDefault()
              openBoost('create-farm')
            }}
            data-testid="project-v4-farm"
          >
            Farm
          </Btn>
          <Btn
            href="#boost-pool"
            onClick={(e) => {
              e.preventDefault()
              openBoost('create-pool')
            }}
            data-testid="project-v4-pool"
          >
            Pool
          </Btn>
          <Btn
            $ghost
            href="#claim-wizard"
            onClick={(e) => {
              e.preventDefault()
              setClaimOpen(true)
            }}
            data-testid="project-v4-claim-action"
          >
            Claim
          </Btn>
        </ActionBar>
      </DenseBand>

      {/* PROJECT ECONOMY */}
      <DenseBand data-testid="project-v4-economy" data-project-section="economy">
        <BandHead>
          <BandTitle>Project Economy</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} />
          </BandMeta>
        </BandHead>
        <EconomyGrid>
          <EconomyCard data-testid="project-v4-economy-liquidity">
            <EconomyTitle>
              Liquidity
              <MelegaExploreChainBadge chainId={chainId} />
            </EconomyTitle>
            <EconomyMeta>
              <span>TVL · {dash(market.liquidity)}</span>
              <span>Volume · {dash(market.volume24h)}</span>
              <span>APR · —</span>
              <span>Rewards · —</span>
              <span>Pools · {truthLiquidityCount}</span>
              <span>Largest · {pairLabel}</span>
            </EconomyMeta>
            <MiniSpark values={[]} />
          </EconomyCard>
          <EconomyCard data-testid="project-v4-economy-farm">
            <EconomyTitle>
              Farms
              <MelegaExploreChainBadge chainId={chainId} />
            </EconomyTitle>
            <EconomyMeta>
              <span>TVL · —</span>
              <span>Volume · —</span>
              <span>APR · —</span>
              <span>Rewards · —</span>
              <span>Farms · {truthFarmCount || '—'}</span>
              <span>Largest · {chainFarms[0]?.displayLabel || '—'}</span>
            </EconomyMeta>
            <MiniSpark values={[]} />
          </EconomyCard>
          <EconomyCard data-testid="project-v4-economy-pool">
            <EconomyTitle>
              Pools
              <MelegaExploreChainBadge chainId={chainId} />
            </EconomyTitle>
            <EconomyMeta>
              <span>TVL · —</span>
              <span>Volume · —</span>
              <span>APR · —</span>
              <span>Rewards · —</span>
              <span>Pools · {truthPoolCount || '—'}</span>
              <span>Largest · {chainPools[0]?.displayLabel || '—'}</span>
            </EconomyMeta>
            <MiniSpark values={[]} />
          </EconomyCard>
        </EconomyGrid>
      </DenseBand>

      {/* BOOST YOUR PROJECT — commercial Growth Hub */}
      <DenseBand
        data-testid="project-v4-grow"
        data-project-section="growth-hub"
        data-growth-hub="boost-your-project"
        style={{
          borderColor: pp.goldLine,
          background:
            'radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242,200,76,0.10), transparent 55%), linear-gradient(165deg, rgba(22,20,12,0.98), rgba(12,12,12,0.98))',
        }}
      >
        <BandHead>
          <BandTitle>Boost Your Project</BandTitle>
          <BandMeta>Increase visibility. Grow liquidity. Acquire holders.</BandMeta>
        </BandHead>
        <GrowGrid data-testid="project-growth-hub">
          {boostCards.map((card) => (
            <GrowCard
              key={card.id}
              type="button"
              onClick={() => openBoost(card.id)}
              data-testid={boostTestId(card.id)}
              data-growth-service={card.id}
            >
              <GrowIcon aria-hidden>{card.icon}</GrowIcon>
              <GrowTitle>{card.title}</GrowTitle>
              <GrowBenefit>{card.description}</GrowBenefit>
              <GrowPrice>{card.priceHint}</GrowPrice>
              <GrowDuration>{card.id === 'featured' ? featuredPkg.durationLabel : card.id === 'trend-boost' ? trendPkg.durationLabel : 'Melega Studio'}</GrowDuration>
              <GrowCta>{card.cta}</GrowCta>
            </GrowCard>
          ))}
        </GrowGrid>
      </DenseBand>

      {/* CLAIM — compact ownership card */}
      <DenseBand data-testid="project-v4-claim" data-project-section="claim">
        <ClaimCard>
          <div>
            <ClaimTitle>Claim this project</ClaimTitle>
            <ClaimBody>Verify wallet ownership, then customize your project page.</ClaimBody>
            <ClaimList>
              <li>Wallet verification</li>
              <li>Ownership verification</li>
              <li>Customize page</li>
            </ClaimList>
          </div>
          <Btn
            href="#claim-wizard"
            onClick={(e) => {
              e.preventDefault()
              setClaimOpen(true)
            }}
            data-testid="project-v4-claim-cta"
          >
            Claim
          </Btn>
        </ClaimCard>
      </DenseBand>

      {/* MARKETING HISTORY */}
      <DenseBand data-testid="project-v4-marketing-history" data-project-section="marketing-history">
        <BandHead>
          <BandTitle>Marketing History</BandTitle>
          <BandMeta>Featured · Trend · Claim · Farm · Pool · Liquidity</BandMeta>
        </BandHead>
        <ProjectMarketingHistory slug={document.slug} refreshKey={historyKey} />
      </DenseBand>

      {/* FEATURED PROJECTS — same pipeline as Home / Projects */}
      <DenseBand data-testid="project-v4-featured-pipeline" data-project-section="featured">
        <FeaturedProjectsSection surface="project-page" />
      </DenseBand>

      {/* ABOUT — compact: description, category, links, roadmap */}
      {hasAbout ? (
        <DenseBand data-testid="project-v4-about" data-project-section="about">
          <BandHead>
            <BandTitle>About</BandTitle>
            <BandMeta>project</BandMeta>
          </BandHead>
          <AboutCompact>
            {description ? <div>{description}</div> : null}
            {categories.length ? (
              <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                {categories.slice(0, 6).map((c) => (
                  <Chip key={`about-${c}`}>{c}</Chip>
                ))}
              </Row>
            ) : null}
            {(website?.url || socials.length > 0) && (
              <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                {website?.url ? (
                  <Btn $ghost href={website.url} target="_blank" rel="noreferrer">
                    Website
                  </Btn>
                ) : null}
                {socials.slice(0, 4).map((s) => (
                  <Btn key={s.url} $ghost href={s.url} target="_blank" rel="noreferrer">
                    {socialLabel(s.url, s.label)}
                  </Btn>
                ))}
              </Row>
            )}
            {roadmapDocument?.milestones?.length ? (
              <div data-testid="project-v4-roadmap">
                <BandMeta style={{ marginBottom: 2 }}>Roadmap</BandMeta>
                {roadmapDocument.milestones.slice(0, 4).map((m) => (
                  <Muted key={m.id || m.title} style={{ display: 'block', margin: 0 }}>
                    · {m.title || 'Milestone'}
                  </Muted>
                ))}
              </div>
            ) : null}
          </AboutCompact>
        </DenseBand>
      ) : null}

      {/* Developer / Machine / Evidence / Transparency — closed accordions */}
      <div data-testid="project-v4-dev-stack" data-project-section="developer-stack">
        <Accordion data-testid="project-v4-developer" data-project-section="developer">
          <summary>
            <span>Developer</span>
            <BandMeta>Expand</BandMeta>
          </summary>
          <AccordionBody>
            <div>Resources · {developerDocument?.resources?.length ?? '—'}</div>
            <Muted style={{ margin: 0 }}>Technical developer docs stay collapsed for consumer conversion.</Muted>
          </AccordionBody>
        </Accordion>
        <Accordion data-testid="project-v4-machine" data-project-section="machine">
          <summary>
            <span>Machine Interface</span>
            <BandMeta>Expand</BandMeta>
          </summary>
          <AccordionBody>
            <div>Endpoints · {machineDocument?.endpoints?.length ?? '—'}</div>
            <Muted style={{ margin: 0 }}>Machine-facing interfaces remain available on demand.</Muted>
          </AccordionBody>
        </Accordion>
        <Accordion data-testid="project-v4-evidence" data-project-section="evidence">
          <summary>
            <span>Evidence</span>
            <BandMeta>Expand</BandMeta>
          </summary>
          <AccordionBody>
            <div>Evidence items · {evidenceCount ?? '—'}</div>
            <div>Claims · {evidencePack?.claims?.length ?? '—'}</div>
          </AccordionBody>
        </Accordion>
        <Accordion data-testid="project-v4-transparency" data-project-section="transparency">
          <summary>
            <span>Transparency</span>
            <BandMeta>Expand</BandMeta>
          </summary>
          <AccordionBody>
            <div>Readiness · {readinessLabel}</div>
            <div>Markets registered · {marketsDocument.markets.length || '—'}</div>
          </AccordionBody>
        </Accordion>
      </div>

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
        onHistoryChange={() => setHistoryKey((k) => k + 1)}
      />
      <ClaimProjectWizardModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        projectSlug={document.slug}
        projectName={document.identity.displayName}
        projectContract={contract}
        initialDraft={{
          description: description || '',
          website: website?.url || '',
          x: xLink?.url || '',
          telegram: tgLink?.url || '',
          discord: discordLink?.url || '',
          logo: logoUrl || '',
        }}
        onPublished={() => setHistoryKey((k) => k + 1)}
      />
    </Page>
  )
}

export default ProjectPageV4Shell
