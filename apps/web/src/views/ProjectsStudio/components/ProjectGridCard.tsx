/**
 * ProjectCard V3 — compact multichain discovery tile.
 * Chain badge top-right · View Project · Trade → /swap
 */
import React, { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { AnimatedSparkline } from 'views/TrendingStudio/components/trendingStudioPrimitives'
import { markProjectNavClick } from 'views/ProjectPage/v5/projectPagePerf'
import { buildSwapHref, formatListedAgo, projectMarketIdentity } from '../projectsDirectoryV3'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { PR_FONT_BODY, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { ProjectLogo } from './projectsStudioPrimitives'

const Card = styled.article`
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  padding: 12px;
  border-radius: 12px;
  background: ${projectsStudioColors.card};
  border: 1px solid ${projectsStudioColors.cardBorder};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: ${projectsStudioColors.cardBorderHover};
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`

const ChainCorner = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-right: 28px;
  min-width: 0;
`

const TextCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Name = styled.h3`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: ${projectsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Symbol = styled.p`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.gold};
`

const Listed = styled.p`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
`

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`

const Badge = styled.span<{ $tone?: 'gold' | 'green' | 'muted' }>`
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'gold'
        ? 'rgba(244,196,48,0.45)'
        : $tone === 'green'
          ? 'rgba(52,211,153,0.4)'
          : projectsStudioColors.cardBorder};
  background: ${({ $tone }) =>
    $tone === 'gold'
      ? 'rgba(244,196,48,0.12)'
      : $tone === 'green'
        ? 'rgba(52,211,153,0.1)'
        : 'rgba(255,255,255,0.04)'};
  color: ${({ $tone }) =>
    $tone === 'gold' ? projectsStudioColors.gold : $tone === 'green' ? '#6ee7b7' : projectsStudioColors.secondary};
  font-family: ${PR_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  margin-top: auto;
`

const MetricCell = styled.div`
  min-width: 0;
`

const MetricLabel = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const MetricValue = styled.div<{ $muted?: boolean; $pos?: boolean; $neg?: boolean }>`
  font-family: ${PR_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${({ $muted, $pos, $neg }) =>
    $muted
      ? projectsStudioColors.muted
      : $pos
        ? '#6ee7b7'
        : $neg
          ? '#f87171'
          : projectsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${projectsStudioLayout.cardBtnGap};
  margin-top: 2px;
`

const PrimaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(244, 196, 48, 0.55);
  background: linear-gradient(180deg, #f2c84c 0%, #d4a017 100%);
  color: #111;
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 750;
  text-decoration: none;
`

const OutlineLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: rgba(255, 255, 255, 0.03);
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    border-color: ${projectsStudioColors.gold};
  }
`

const CHAIN_ID_BY_BADGE: Record<string, number> = {
  BNB: 56,
  BSC: 56,
  ETH: 1,
  Ethereum: 1,
  Base: 8453,
  Polygon: 137,
  Arbitrum: 42161,
  ARB: 42161,
  Avalanche: 43114,
  AVAX: 43114,
}

function metricValue(project: ProjectPreviewCard, label: string) {
  return project.metrics.find((m) => m.label === label)?.value ?? '—'
}

function isEmpty(v?: string | null) {
  return !v || v === '—' || v === 'Unavailable'
}

const SparkUnavailable = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.38);
`

/** Real indexed sparkline only — never invents points from 24h %. Neutral baseline when no history. */
const CardSpark: React.FC<{ pairAddress?: string }> = ({ pairAddress }) => {
  const { chartEntries, status } = useIndexerCandles(
    pairAddress && /^0x[a-fA-F0-9]{40}$/.test(pairAddress) ? pairAddress : undefined,
    '1H',
  )
  const points = useMemo(
    () => chartEntries.slice(-24).map((c) => c.close).filter((n) => Number.isFinite(n) && n > 0),
    [chartEntries],
  )
  if (!pairAddress) {
    return (
      <SparkUnavailable data-testid="project-card-spark-empty" data-spark="neutral-baseline">
        —
      </SparkUnavailable>
    )
  }
  if (points.length < 2) {
    return (
      <SparkUnavailable data-testid="project-card-spark-empty" data-spark="neutral-baseline">
        {status === 'loading' ? '…' : '—'}
      </SparkUnavailable>
    )
  }
  return (
    <div data-testid="project-card-spark" style={{ display: 'flex', justifyContent: 'center' }}>
      <AnimatedSparkline points={points} width={96} height={24} />
    </div>
  )
}

interface Props {
  project: ProjectPreviewCard
}

export const ProjectGridCard: React.FC<Props> = ({ project }) => {
  const chainId = project.chainId ?? CHAIN_ID_BY_BADGE[project.chains[0]] ?? 56
  const tradeHref =
    project.tradeHref && project.tradeHref.startsWith('/swap')
      ? project.tradeHref
      : buildSwapHref({
          address: project.contractAddress,
          chainId,
          source: 'projects-directory',
        })
  const projectHref = project.projectHref ?? `/@${project.slug}/`
  const price = project.priceDisplay ?? '—'
  const change = project.change24hDisplay ?? '—'
  const changePct = project.change24hPct
  const liquidity = metricValue(project, 'Liquidity')
  const volume = metricValue(project, 'Volume')
  const holders = metricValue(project, 'Holders')
  const verified = project.verified === true || project.status === 'verified'
  const featured = project.featured === true
  const boosted = project.boosted === true || project.rankingLayer === 'boosted'
  const rankingLayer = project.rankingLayer
  const listedAgo = formatListedAgo(project.listedAtMs)
  const identity = projectMarketIdentity(project)

  return (
    <Card
      data-pr-project-card
      data-testid="project-directory-card"
      data-project-slug={project.slug}
      data-project-card="v3"
      data-project-identity={identity}
    >
      <ChainCorner>
        <MelegaExploreChainBadge chainId={chainId} compact />
      </ChainCorner>
      <Header>
        <ProjectLogo
          name={project.name}
          symbol={project.symbol}
          size={44}
          address={project.contractAddress}
          chainId={chainId}
          logoURI={project.logoURI ?? undefined}
        />
        <TextCol>
          <Name title={project.name}>{project.name}</Name>
          {project.symbol ? <Symbol>${project.symbol}</Symbol> : null}
          {project.status === 'new' && listedAgo ? <Listed>{listedAgo}</Listed> : null}
          <Badges>
            {verified ? <Badge $tone="green">Verified</Badge> : null}
            {featured ? <Badge $tone="gold">Featured</Badge> : null}
            {boosted ? (
              <Badge $tone="gold" data-testid="project-badge-boosted">
                Boosted
              </Badge>
            ) : null}
            {rankingLayer === 'organic' && !boosted ? <Badge $tone="muted">Trending</Badge> : null}
            {project.status === 'new' ? <Badge $tone="muted">New</Badge> : null}
          </Badges>
        </TextCol>
      </Header>

      <Metrics>
        <MetricCell>
          <MetricLabel>Price</MetricLabel>
          <MetricValue $muted={isEmpty(price)}>{isEmpty(price) ? '—' : price}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>24h</MetricLabel>
          <MetricValue
            $muted={isEmpty(change)}
            $pos={typeof changePct === 'number' && changePct > 0}
            $neg={typeof changePct === 'number' && changePct < 0}
          >
            {isEmpty(change) ? '—' : change}
          </MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Liquidity</MetricLabel>
          <MetricValue $muted={isEmpty(liquidity)}>{isEmpty(liquidity) ? '—' : liquidity}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Volume</MetricLabel>
          <MetricValue $muted={isEmpty(volume)}>{isEmpty(volume) ? '—' : volume}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>Holders</MetricLabel>
          <MetricValue $muted={isEmpty(holders)}>{isEmpty(holders) ? '—' : holders}</MetricValue>
        </MetricCell>
      </Metrics>

      <CardSpark pairAddress={project.pairAddress} />

      <Actions data-pr-action-bar>
        <OutlineLink href={projectHref} data-testid="project-card-open" onClick={() => markProjectNavClick()}>
          View Project
        </OutlineLink>
        <PrimaryBtn href={tradeHref} data-testid="project-card-trade">
          Trade
        </PrimaryBtn>
      </Actions>
    </Card>
  )
}

/** Canonical ProjectCard V3 — compact directory tile. */
export const ProjectCard = ProjectGridCard
export default ProjectGridCard
