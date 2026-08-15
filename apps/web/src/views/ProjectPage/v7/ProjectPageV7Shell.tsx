/**
 * Project Page V7 — canonical claimed/unclaimed consumer destination.
 * Hierarchy: Hero → Market → Economy → Activity/Holders/Score → Boost → Community → About → Related
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
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
import type { ProjectClaimMetadata } from 'lib/project-claims/types'
import { CommercialCheckoutModal } from 'views/shared/monetization/CommercialCheckoutModal'
import { ProjectMarketingHistoryPopover } from 'views/shared/monetization/ProjectMarketingHistoryPopover'
import {
  COMMERCIAL_SERVICES,
  VISIBILITY_SERVICES,
  type CommercialServiceId,
} from 'views/shared/monetization/commercialCheckoutTypes'
import { truthDash, GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'
import { formatCompactPriceUsd } from 'utils/formatCompactPrice'
import {
  useProtocolActivityFeed,
  type CanonicalProtocolActivityRow,
} from 'lib/protocol-activity/useProtocolActivityFeed'
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
import { useProjectDexAnalytics } from './useProjectDexAnalytics'
import { useProjectYieldAnalytics, type ProjectYieldSlice } from './useProjectYieldAnalytics'
import { useProjectReactions, type ProjectReactionId } from './useProjectReactions'
import {
  afterFirstPaint,
  markProjectChartReady,
  markProjectMarketHydrated,
  markProjectNavClick,
  markProjectRouteChange,
  markProjectShellRender,
  markProjectSwapReady,
} from './projectPagePerf'
import {
  buildRelatedPreviewCard,
  buildUnclaimedMarketsDocument,
  type UnclaimedTokenIdentity,
} from './unclaimedIdentity'

const dash = (v?: string | null) => truthDash(v)

const CanonicalPage = styled(Page)`
  /* Home shell geometry, scoped to the canonical Project Page only. */
  max-width: 1380px;
  padding-left: 0;
  padding-right: 0;

  > [data-project-section] {
    margin-bottom: 14px;
  }

  @media (min-width: 768px) {
    padding-left: 32px;
    padding-right: 32px;

    > [data-project-section] {
      margin-bottom: 20px;
    }
  }
`

function compactUsd(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function preciseUsd(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return formatCompactPriceUsd(value)
}

function fullUsd(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

const TRUST_ATTESTATIONS = [
  { id: 'audit', label: 'Audit' },
  { id: 'kyc', label: 'KYC' },
] as const

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

const ProjectNav = styled.nav`
  position: sticky;
  /* The app shell already offsets this transformed page below header + ticker.
     A second pixel offset displaced the sticky nav over the project identity. */
  top: 0;
  z-index: 12;
  min-height: 44px;
  margin-bottom: 8px;
  padding: 5px 8px;
  border: 1px solid ${pp.line};
  border-radius: 12px;
  background: rgba(10, 10, 10, 0.92);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  a {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.68);
    text-decoration: none;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }
  a:first-child {
    color: ${pp.gold};
    background: rgba(244, 196, 48, 0.1);
    margin-right: auto;
  }
  a:hover,
  a:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
  @media (max-width: 767px) {
    top: 0;
  }
`

const ProjectCharts = dynamic(() => import('../v1/ProjectCharts'), {
  ssr: false,
  loading: () => <ChartSkeleton aria-label="Loading chart" data-testid="project-v7-chart-skeleton" />,
})
const ProjectTradingEmbed = dynamic(() => import('../v1/ProjectTradingEmbed'), {
  ssr: false,
  loading: () => <SwapSkeleton aria-label="Loading Smart Swap" data-testid="project-v7-swap-skeleton" />,
})

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`
const IdentityHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(300px, 0.72fr);
  gap: 20px;
  align-items: stretch;
  padding: 16px 18px;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: radial-gradient(circle at 84% 18%, rgba(244, 196, 48, 0.07), transparent 34%),
    linear-gradient(145deg, rgba(17, 17, 17, 0.98), rgba(10, 10, 10, 0.98));

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    padding: 14px;
  }
`
const HeroContext = styled.aside`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  min-width: 0;
  padding-left: 18px;
  border-left: 1px solid ${pp.line};

  @media (max-width: 860px) {
    padding: 12px 0 0;
    border-left: 0;
    border-top: 1px solid ${pp.line};
  }
`
const HeroContextBlock = styled.div`
  min-width: 0;
  h2 {
    margin: 0 0 5px;
    color: ${pp.gold};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 12px;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`
const VerifiedMark = styled.span`
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 18px;
  border-radius: 50%;
  color: #fff;
  background: #1d9bf0;
  box-shadow: 0 0 0 2px rgba(29, 155, 240, 0.14);
  font-size: 11px;
  font-weight: 900;
`
const Handle = styled.span`
  color: ${pp.mute};
  font-size: 13px;
  font-weight: 700;
`
const MarketWorkspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) minmax(360px, 0.72fr);
  gap: 12px;
  min-width: 0;

  @media (max-width: 1050px) {
    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.82fr);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`
const WorkspacePanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: ${pp.radius};
  border: 1px solid ${pp.line};
  background: linear-gradient(180deg, rgba(15, 15, 15, 0.99), rgba(8, 8, 8, 0.99));
`
const LogoWrap = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: visible;
  border: 1px solid ${pp.line};
  background: #111;
`
const ChainOverlay = styled.span`
  position: absolute;
  right: -5px;
  bottom: -5px;
  z-index: 2;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid #101010;
  background: #171717;
  overflow: hidden;
  > * {
    transform: scale(0.76);
  }
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
const HeroTrustBadge = styled.span<{ $verified?: boolean }>`
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${({ $verified }) => ($verified ? 'rgba(61,220,151,.4)' : 'rgba(255,255,255,.12)')};
  background: ${({ $verified }) => ($verified ? 'rgba(61,220,151,.1)' : 'rgba(255,255,255,.025)')};
  color: ${({ $verified }) => ($verified ? pp.ok : 'rgba(255,255,255,.42)')};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.035em;
  text-transform: uppercase;
`
const ScoreBadgeWrap = styled.span`
  position: relative;
  display: inline-flex;
  z-index: 30;
`
const ScoreBadge = styled.button`
  min-width: 158px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 3px 14px 3px 4px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.42);
  background: radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.08), transparent 45%),
    linear-gradient(145deg, rgba(16, 16, 16, 0.99), rgba(5, 5, 5, 0.99));
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025), 0 7px 22px rgba(0, 0, 0, 0.52);
  cursor: help;

  &:focus-visible {
    outline: 2px solid ${pp.gold};
    outline-offset: 2px;
  }
`
const ScoreDonut = styled.span<{ $score: number }>`
  position: relative;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    ${pp.gold} 0deg,
    ${pp.gold} ${({ $score }) => Math.max(0, Math.min(100, $score)) * 3.6}deg,
    rgba(255, 255, 255, 0.12) ${({ $score }) => Math.max(0, Math.min(100, $score)) * 3.6}deg,
    rgba(255, 255, 255, 0.12) 360deg
  );
  font-size: 12px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;

  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: inherit;
    background: #090909;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  strong {
    position: relative;
    z-index: 1;
  }
`
const ScoreBadgeCopy = styled.span`
  min-width: 0;
  display: grid;
  gap: 2px;
  text-align: left;
  line-height: 1;

  small {
    color: ${pp.gold};
    font-size: 7px;
    font-weight: 850;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  strong {
    color: #fff;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }
`
const ScorePopover = styled.div`
  display: none;
  position: absolute;
  top: calc(100% + 9px);
  right: 0;
  z-index: 50;
  width: min(420px, calc(100vw - 34px));
  padding: 20px 22px 16px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  border-radius: 14px;
  background: radial-gradient(circle at 80% 0%, rgba(244, 196, 48, 0.06), transparent 36%), rgba(8, 8, 8, 0.985);
  box-shadow: 0 24px 66px rgba(0, 0, 0, 0.78), 0 0 30px rgba(244, 196, 48, 0.08);
  pointer-events: none;

  ${ScoreBadgeWrap}:hover &,
  ${ScoreBadge}:focus-visible + & {
    display: block;
  }

  @media (max-width: 560px) {
    position: fixed;
    top: auto;
    right: 16px;
    bottom: 16px;
    left: 16px;
    width: auto;
  }
`
const ScorePopoverHead = styled.div`
  display: grid;
  gap: 8px;
  padding: 0 2px 16px;
  border-bottom: 1px solid rgba(244, 196, 48, 0.55);
`
const ScorePopoverEyebrow = styled.span`
  color: ${pp.gold};
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`
const ScorePopoverSummary = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;

  strong {
    color: #fff;
    font-size: 27px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.035em;
  }

  strong span {
    font-size: 14px;
    letter-spacing: 0.08em;
  }

  em {
    color: ${pp.gold};
    font-size: 12px;
    font-style: normal;
    font-weight: 850;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }
`
const ScoreCriterion = styled.div`
  display: grid;
  grid-template-columns: minmax(100px, 0.82fr) minmax(110px, 1.18fr) 52px;
  gap: 12px;
  align-items: center;
  min-height: 45px;
  padding: 8px 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.86);
  font-size: 11px;

  &:last-child {
    border-bottom: 0;
  }

  strong {
    color: #fff;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 420px) {
    grid-template-columns: minmax(88px, 0.8fr) minmax(84px, 1fr) 48px;
    gap: 8px;
  }
`
const ScoreMeter = styled.span<{ $progress: number }>`
  position: relative;
  height: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.13);

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: ${({ $progress }) => Math.max(0, Math.min(100, $progress))}%;
    background: linear-gradient(90deg, #b88b24, #f4c430);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent calc(10% - 2px),
      rgba(4, 4, 4, 0.9) calc(10% - 2px),
      rgba(4, 4, 4, 0.9) 10%
    );
  }
`
const ScorePopoverFoot = styled.p`
  margin: 12px 2px 0;
  padding-top: 12px;
  border-top: 1px solid rgba(244, 196, 48, 0.55);
  color: rgba(255, 255, 255, 0.45);
  font-size: 9px;
  line-height: 1.45;
`
const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
  align-items: center;
`
const IconBtn = styled.a`
  width: 30px;
  height: 30px;
  min-height: 30px;
  min-width: 30px;
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
  width: 30px;
  height: 30px;
  min-height: 30px;
  min-width: 30px;
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
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;
  margin: 0;
  padding-left: 7px;
  border-left: 1px solid ${pp.line};
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: ${pp.mute};
  min-width: 0;
`
const ContractAddr = styled.span`
  flex: 0 1 auto;
  max-width: 154px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (min-width: 960px) {
    max-width: 188px;
  }
`
const ChartSlot = styled.div<{ $collapsed?: boolean }>`
  flex: 0 0 auto;
  min-height: ${({ $collapsed }) => ($collapsed ? '0' : '205px')};
  padding: ${({ $collapsed }) => ($collapsed ? '6px 10px 0' : '8px 10px 4px')};
  border-bottom: ${({ $collapsed }) => ($collapsed ? '0' : `1px solid ${pp.line}`)};
  @media (min-width: 960px) {
    min-height: ${({ $collapsed }) => ($collapsed ? '0' : '295px')};

    [data-trade-chart-area] {
      height: 205px !important;
      min-height: 205px !important;
      max-height: 220px !important;
    }
  }
`
const SwapSlot = styled.div<{ $expand?: boolean }>`
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  #pp-v1-trading,
  [data-trading-variant='hero'] {
    border: 0;
    background: transparent;
    margin: 0;
    padding: 0;
  }
`
const DexCompactRow = styled.div`
  min-height: 34px;
  padding: 6px 10px;
  border-top: 1px solid ${pp.line};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  overflow-x: hidden;
  color: ${pp.mute};
  font-size: 10px;
  white-space: normal;
  strong {
    margin-left: 4px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 11px;
  }

  @media (max-width: 1100px) {
    flex-wrap: wrap;
    gap: 6px 14px;
    overflow-x: visible;
    white-space: normal;
  }
`
const DexSourceLink = styled.a`
  margin-left: auto;
  color: ${pp.gold};
  text-decoration: none;
  font-weight: 800;

  @media (max-width: 1100px) {
    margin-left: 0;
  }
`
const EconomyOverview = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1180px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const EconomyCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 132px;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid ${pp.line};
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
`
const EconomyTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
`
const EconomyMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  flex: 1;
`
const EconomyAction = styled(Btn)`
  width: 100%;
  min-height: 40px;
  margin-top: auto;
  align-self: center;
  justify-content: center;
  text-align: center;
`
const DistributionRow = styled.div`
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-width: 0;
`
const DistributionDonut = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset: 13px;
    border-radius: 50%;
    background: #0e0e0e;
  }
  strong {
    position: relative;
    z-index: 1;
    max-width: 58px;
    color: #fff;
    font-size: 10px;
    text-align: center;
  }
`
const DistributionLegend = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  > div {
    display: grid;
    grid-template-columns: 7px minmax(0, 1fr) auto;
    gap: 6px;
    align-items: center;
  }
  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`
const ActivityBlock = styled.div`
  flex: 1 1 auto;
  padding: 10px 12px 12px;
  border-top: 1px solid ${pp.line};
`
const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 12px;
  &:last-child {
    border-bottom: 0;
  }

  > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 620px) {
    grid-template-columns: 50px minmax(0, 1fr) auto;
    > span:nth-child(3) {
      grid-column: 2 / -1;
    }
  }
`
const HolderDonutWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
`
const HolderDonut = styled.div`
  width: 92px;
  height: 92px;
  flex: 0 0 92px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  border: 8px solid rgba(244, 196, 48, 0.2);
  background: radial-gradient(circle at 50% 45%, rgba(244, 196, 48, 0.12), transparent 65%);
  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #0e0e0e;
  }
  strong {
    position: relative;
    z-index: 1;
    color: #fff;
    font-size: 12px;
    max-width: 76px;
    overflow-wrap: anywhere;
    text-align: center;
  }
`
const HolderLegend = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1;
`
const HolderLegendRow = styled.div`
  display: grid;
  grid-template-columns: 7px minmax(0, 1fr) auto;
  gap: 7px;
  align-items: center;
  color: rgba(255, 255, 255, 0.68);
  font-size: 10px;

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  strong {
    color: rgba(255, 255, 255, 0.9);
  }
`
const BoostConsole = styled.div`
  border-radius: ${pp.radius};
  border: 1px solid ${pp.goldLine};
  background: linear-gradient(165deg, rgba(22, 20, 12, 0.98), rgba(12, 12, 12, 0.98));
  padding: 10px 12px;
`
const BoostRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  gap: 6px;
  overflow-x: auto;
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
  display: inline-flex;
  align-items: center;
  gap: 7px;

  small {
    min-width: 16px;
    padding: 2px 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.82);
    font-size: 10px;
    line-height: 14px;
  }
`
const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  }
`
const featuredGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(244, 196, 48, 0), inset 0 1px 0 rgba(255,255,255,.025); }
  50% { box-shadow: 0 0 28px rgba(244, 196, 48, 0.13), inset 0 1px 0 rgba(255,255,255,.04); }
`
const FeaturedRail = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`
const FeaturedCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  animation: ${featuredGlow} 3.8s ease-in-out infinite;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  &:hover {
    border-color: ${pp.goldLine};
    box-shadow: 0 0 34px rgba(244, 196, 48, 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
const MarcoActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
`
const MarcoActionLink = styled(Link)<{ $primary?: boolean }>`
  min-height: 34px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid ${({ $primary }) => ($primary ? pp.goldLine : pp.line)};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,.14)' : 'rgba(255,255,255,.025)')};
  color: ${({ $primary }) => ($primary ? pp.gold : '#f4f4f4')};
  text-decoration: none;
  font-size: 11px;
  font-weight: 800;
`
const MarcoAvailability = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  > span:first-child {
    color: rgba(255, 255, 255, 0.42);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`
const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  article[data-project-card='v3'] {
    min-height: 0;
  }
`
const DenseBand = styled(Band)`
  margin-bottom: 8px;
`
const HeroBand = styled(DenseBand)`
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
`
const WalletIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  button {
    min-width: 30px !important;
    min-height: 30px !important;
    width: 30px !important;
    height: 30px !important;
    padding: 0 !important;
    border-radius: 8px !important;
    background: transparent !important;
    border-color: ${pp.line} !important;
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

function scorePoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function activityAmount(value?: string, symbol?: string): string {
  if (!value && !symbol) return '—'
  const numeric = Number(value)
  const amount = Number.isFinite(numeric)
    ? numeric.toLocaleString('en-US', { maximumSignificantDigits: 7 })
    : String(value ?? '—').slice(0, 18)
  return `${amount}${symbol ? ` ${symbol}` : ''}`
}

function activityLegs(row: CanonicalProtocolActivityRow, projectAddress?: string | null) {
  const addresses = (row.assetAddresses ?? []).map((address) => address.toLowerCase())
  const symbols = row.resolvedSymbols ?? []
  const amounts = row.amounts ?? []
  const projectIndex = projectAddress ? addresses.indexOf(projectAddress.toLowerCase()) : -1
  const otherIndex = projectIndex === 0 ? 1 : projectIndex === 1 ? 0 : 1
  const event = row.eventType.toLowerCase()

  if (event.includes('buy') && projectIndex >= 0) {
    return {
      action: 'Buy',
      exchanged: activityAmount(amounts[otherIndex], symbols[otherIndex]),
      received: activityAmount(amounts[projectIndex], symbols[projectIndex]),
    }
  }
  if (event.includes('sell') && projectIndex >= 0) {
    return {
      action: 'Sell',
      exchanged: activityAmount(amounts[projectIndex], symbols[projectIndex]),
      received: activityAmount(amounts[otherIndex], symbols[otherIndex]),
    }
  }
  return {
    action: /mint|add/i.test(row.eventType) ? 'Add' : /burn|remove/i.test(row.eventType) ? 'Remove' : 'Swap',
    exchanged: activityAmount(amounts[0], symbols[0]),
    received: activityAmount(amounts[1], symbols[1]),
  }
}

const DISTRIBUTION_COLORS = ['#f4c430', '#27c499', '#7c8cff', '#e96fb3', '#4aa8ff', '#f1844a']

function distributionGradient(items: Array<{ sharePct: number | null }>): string {
  let cursor = 0
  const stops = items
    .filter((item) => item.sharePct != null && item.sharePct > 0)
    .map((item, index) => {
      const start = cursor
      cursor = Math.min(100, cursor + (item.sharePct ?? 0))
      return `${DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} ${start}% ${cursor}%`
    })
  return stops.length ? `conic-gradient(${stops.join(', ')})` : 'rgba(255,255,255,.08)'
}

function DistributionSummary({
  items,
  total,
  emptyLabel,
}: {
  items: Array<{ id: string; label: string; tvlUsd: number | null; sharePct: number | null }>
  total: string
  emptyLabel: string
}) {
  if (!items.length) return <Muted style={{ margin: 0 }}>{emptyLabel}</Muted>
  return (
    <DistributionRow>
      <DistributionDonut style={{ background: distributionGradient(items) }}>
        <strong>{total}</strong>
      </DistributionDonut>
      <DistributionLegend>
        {items.slice(0, 6).map((item, index) => (
          <div key={item.id}>
            <i style={{ background: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length] }} />
            <span>{item.label}</span>
            <strong>{item.sharePct == null ? '—' : `${item.sharePct.toFixed(1)}%`}</strong>
          </div>
        ))}
      </DistributionLegend>
    </DistributionRow>
  )
}

function YieldDetails({ items }: { items: ProjectYieldSlice[] }) {
  if (!items.length) return null
  return (
    <div style={{ display: 'grid', gap: 5 }}>
      {items.slice(0, 4).map((item) => (
        <Muted key={item.id} style={{ margin: 0, fontSize: 10 }}>
          {item.label} · APR {item.apr} · Historical rewards {item.historicalRewards}
        </Muted>
      ))}
    </div>
  )
}

export type ProjectPageV7ClaimedProps = {
  mode?: 'claimed'
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  evidencePack?: ProjectEvidencePack | null
  readinessDocument?: ProjectReadinessDocument | null
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

export type ProjectPageV7UnclaimedProps = {
  mode: 'unclaimed'
  unclaimed: UnclaimedTokenIdentity
  /** Runtime owner/deployer-authenticated profile for an instantly published /@handle page. */
  claimedProfile?: ProjectClaimMetadata | null
  marketsDocument?: ProjectMarketsDocument | null
  participationDocument?: ProjectParticipationDocument | null
}

export type ProjectPageV7Props = ProjectPageV7ClaimedProps | ProjectPageV7UnclaimedProps

export const ProjectPageV7Shell: React.FC<ProjectPageV7Props> = (props) => {
  const isUnclaimed = props.mode === 'unclaimed'
  const document = isUnclaimed ? null : props.document
  const unclaimed = isUnclaimed ? props.unclaimed : null
  const claimedProfile = isUnclaimed ? props.claimedProfile ?? null : null
  const hasPublishedProfile = Boolean(claimedProfile)
  const evidencePack = !isUnclaimed ? props.evidencePack ?? null : null
  const readinessDocument = !isUnclaimed ? props.readinessDocument ?? null : null

  const deployments = useMemo(() => (document ? buildProjectChainDeployments(document) : []), [document])
  const [selectedChainId, setSelectedChainId] = useState(() =>
    unclaimed ? unclaimed.chainId : defaultSelectedChainId(deployments),
  )
  const [copied, setCopied] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutService, setCheckoutService] = useState<CommercialServiceId | null>(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [tradeReady, setTradeReady] = useState(false)
  const [belowFold, setBelowFold] = useState(false)
  const [chartHistory, setChartHistory] = useState<boolean | null>(null)

  const selected =
    deployments.find((d) => d.chainId === selectedChainId) ??
    deployments.find((d) => d.status === 'LIVE') ??
    deployments[0]
  const primary = document && selected ? getPrimaryAssetForChain(document, selected.chainId) : null
  const displayName = claimedProfile?.name ?? unclaimed?.name ?? document!.identity.displayName
  const symbol = claimedProfile?.symbol ?? unclaimed?.symbol ?? primary?.symbol?.value ?? null
  const chainId = unclaimed?.chainId ?? selected?.chainId ?? 56
  const contract = unclaimed?.address ?? selected?.contractAddress ?? null
  const pageSlug = claimedProfile?.handle ?? unclaimed?.syntheticSlug ?? document!.slug
  const reactions = useProjectReactions(pageSlug)
  const isMarcoProject = !isUnclaimed && (pageSlug.toLowerCase() === 'marco' || symbol?.toUpperCase() === 'MARCO')
  const verified =
    !isUnclaimed && document?.identity.verificationState?.meta?.availability === 'AVAILABLE'
      ? humanEnumLabel(document.identity.verificationState.value)
      : null
  const logoUrl = claimedProfile?.logo
    ? claimedProfile.logo
    : unclaimed?.logoUrl
    ? unclaimed.logoUrl
    : document?.identity.logoUrl?.meta?.availability === 'AVAILABLE'
    ? document.identity.logoUrl.value
    : undefined
  const socials = document ? getSocialResources(document) : []
  const website = document?.resources.find((r) => r.resourceType === 'website')
  const xLink = socials.find((s) => /twitter|x\.com/i.test(s.url) || /\bx\b/i.test(s.label))
  const tgLink = socials.find((s) => /t\.me|telegram/i.test(s.url) || /telegram/i.test(s.label))
  const discordLink = socials.find((s) => /discord/i.test(s.url) || /discord/i.test(s.label))
  const websiteUrl = claimedProfile?.website ?? website?.url ?? null
  const xUrl = claimedProfile?.x ?? xLink?.url ?? null
  const telegramUrl = claimedProfile?.telegram ?? tgLink?.url ?? null
  const discordUrl = claimedProfile?.discord ?? discordLink?.url ?? null

  const marketsDocument = useMemo(() => {
    if (isUnclaimed && unclaimed) {
      return props.marketsDocument ?? buildUnclaimedMarketsDocument(unclaimed)
    }
    return (props as ProjectPageV7ClaimedProps).marketsDocument
  }, [isUnclaimed, unclaimed, props])

  const participationDocument = !isUnclaimed
    ? (props as ProjectPageV7ClaimedProps).participationDocument
    : props.participationDocument ?? null

  const market = useProjectLiveMarket(pageSlug, marketsDocument.markets.length, contract, chainId, {
    deferHoldersMs: 1800,
  })

  const chainLiquidity = useMemo(
    () => (participationDocument ? filterParticipationByChain(participationDocument.pools, chainId) : []),
    [participationDocument, chainId],
  )
  const economy = useProjectEconomyByToken({
    chainId,
    tokenAddress: contract,
    liquidityPairCount: chainLiquidity.length,
    largestPairLabel: chainLiquidity[0]?.displayLabel || (symbol ? `${symbol} / WBNB` : null),
  })
  const dexAnalytics = useProjectDexAnalytics(chainId, contract)
  const projectYield = useProjectYieldAnalytics(chainId, contract)

  const trustAttestations = useMemo(
    () =>
      TRUST_ATTESTATIONS.map((definition) => {
        const attestation = document?.evidence.find((record) => record.evidenceType === `${definition.id}_attestation`)
        const verified = Boolean(
          attestation &&
            /verified|observed|available|complete/i.test(attestation.status) &&
            attestation.freshness !== 'stale',
        )
        return {
          ...definition,
          verified,
          provider: attestation?.provider ?? attestation?.reference ?? null,
          sourceUrl: attestation?.sourceUrl ?? null,
          source: attestation?.sourceType ?? null,
          status: attestation?.status ?? 'not_provided',
        }
      }),
    [document],
  )

  const activityFeed = useProtocolActivityFeed()
  const projectActivity = useMemo(() => {
    const addr = contract?.toLowerCase()
    if (!addr) return []
    return (activityFeed.rows || [])
      .filter((r) => {
        const assets = (r.assetAddresses || []).map((a) => a.toLowerCase())
        return assets.includes(addr) || r.contractAddress?.toLowerCase() === addr
      })
      .slice(0, 7)
  }, [activityFeed.rows, contract])

  const featuredPkg = getFeaturedPackage('featured_1w')
  const trendPkg = getTrendBoostPackage('trend_6h')
  const openBoost = useCallback(
    (service: CommercialServiceId) => {
      const svc = COMMERCIAL_SERVICES.find((s) => s.id === service)
      if (svc?.externalHref) {
        window.location.href = svc.externalHref(chainId)
        return
      }
      setCheckoutService(service)
      setCheckoutOpen(true)
    },
    [chainId],
  )

  const tokenDecimals =
    unclaimed?.decimals ??
    (primary?.decimals?.meta?.availability === 'AVAILABLE' && typeof primary.decimals.value === 'number'
      ? primary.decimals.value
      : 18)

  const description = isUnclaimed
    ? claimedProfile?.description ?? null
    : document?.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
    ? document.identity.shortPurpose.value
    : document?.identity.description?.meta?.availability === 'AVAILABLE'
    ? document.identity.description.value
    : null

  const aboutFull = isUnclaimed
    ? claimedProfile?.description ?? null
    : document?.identity.description?.meta?.availability === 'AVAILABLE'
    ? document.identity.description.value
    : null

  const isFeaturedPlacement = Boolean(
    document && ['mm72', 'eyed', 'young-degens', 'blion', 'marco'].includes(document.slug),
  )
  const isVerified = Boolean(
    verified && document?.identity.verificationState.meta.source === 'MELEGA_VERIFIED' && !/unverified/i.test(verified),
  )

  const related = useMemo(() => {
    return resolveFounderFeaturedProjects()
      .filter((p) => p.eligibleForRotation)
      .slice(0, 4)
      .map((p) =>
        buildRelatedPreviewCard({
          slug: p.slug,
          displayName: p.displayName,
          symbol: p.symbol,
          address: p.address,
          chainId: p.chainId,
          logoUrl: p.logoUrl,
          href: resolveCanonicalProjectHref({
            slug: p.slug,
            chainId: p.chainId,
            address: p.address,
          }),
        }),
      )
  }, [])

  const score = readinessDocument?.readiness?.score
  const scoreBand = typeof score === 'number' ? humanEnumLabel(String(readinessStateFromScore(score))) : '—'
  const scoreMeasured = readinessDocument?.generatedAt
    ? timeAgo(Math.floor(new Date(readinessDocument.generatedAt).getTime() / 1000))
    : '—'

  const boostTiles = useMemo(
    () =>
      (
        ['featured', 'sponsored-research', 'trend-boost', 'featured-farm', 'featured-pool'] as CommercialServiceId[]
      ).flatMap((id) => {
        const s = VISIBILITY_SERVICES.find((service) => service.id === id)
        if (!s) return []
        if (s.id === 'featured') return { ...s, title: 'GET FEATURED', priceHint: `$${featuredPkg.usdPrice}` }
        if (s.id === 'sponsored-research') return { ...s, title: 'SPONSORED RESEARCH' }
        if (s.id === 'trend-boost') return { ...s, title: 'TREND BOOST', priceHint: `$${trendPkg.usdPrice}` }
        if (s.id === 'featured-farm') return { ...s, title: 'FEATURED FARM' }
        if (s.id === 'featured-pool') return { ...s, title: 'FEATURED POOL' }
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

  const pairLabel = economy.liquidity.largestPair || (symbol ? `${symbol} / WBNB` : '—')
  const dexMarket = dexAnalytics.data?.analytics ?? null
  const livePrice = market.priceUsd !== '—' ? market.priceUsd : preciseUsd(dexMarket?.priceUsd)
  const liveLiquidity = dexMarket?.liquidityUsd != null ? compactUsd(dexMarket.liquidityUsd) : market.liquidity
  const liveVolume = dexMarket?.volume24hUsd != null ? compactUsd(dexMarket.volume24hUsd) : market.volume24h
  const liveTransactions =
    dexMarket?.transactions24h != null ? dexMarket.transactions24h.toLocaleString() : market.swaps24h
  const liveMarketCap =
    dexMarket?.marketCapUsd != null
      ? fullUsd(dexMarket.marketCapUsd)
      : market.row?.marketCapLabel === 'Market Cap'
      ? market.marketCap
      : '—'
  const marketMetrics = [
    ['PRICE', livePrice],
    ['VOL', liveVolume],
    ['TX', liveTransactions],
    ['MC', liveMarketCap],
  ] as [string, string, ('up' | 'down' | 'mute')?][]

  return (
    <CanonicalPage
      id="project-page-v7"
      data-testid="project-page-v7"
      data-project-page="v7"
      data-project-slug={pageSlug}
      data-project-mode={isUnclaimed ? 'unclaimed' : 'claimed'}
      data-project-runtime-claim={hasPublishedProfile ? 'published' : undefined}
      data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}
      data-pp-shell="1"
    >
      <HeroBand id="overview" data-testid="project-v7-hero" data-project-section="hero">
        <Hero>
          <IdentityHeader data-testid="project-v7-market-first-identity">
            <div data-testid="project-v7-hero-left">
              <Row style={{ gap: 12, alignItems: 'center' }}>
                <LogoWrap data-testid="project-v7-logo">
                  <MelegaTokenAvatar
                    symbol={symbol ?? displayName}
                    name={displayName}
                    address={contract ?? undefined}
                    chainId={chainId}
                    logoURI={logoUrl}
                    size={56}
                  />
                  <ChainOverlay data-testid="project-v7-chain" title={`Chain ${chainId}`}>
                    <MelegaExploreChainBadge chainId={chainId} />
                  </ChainOverlay>
                </LogoWrap>
                <div style={{ minWidth: 0 }}>
                  <Row style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <HeroName data-testid="project-v7-name">{displayName}</HeroName>
                    {isVerified ? (
                      <VerifiedMark
                        aria-label="Verified project"
                        title="Verified project"
                        data-testid="project-v7-verified"
                      >
                        ✓
                      </VerifiedMark>
                    ) : null}
                    {!isUnclaimed || hasPublishedProfile ? (
                      <Handle data-testid="project-v7-handle">@{pageSlug}</Handle>
                    ) : null}
                  </Row>
                  <Row style={{ gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    {symbol ? <Ticker data-testid="project-v7-symbol">${symbol}</Ticker> : null}
                    {isFeaturedPlacement ? (
                      <Chip $on data-testid="project-v7-featured">
                        Featured
                      </Chip>
                    ) : null}
                    {trustAttestations.map((item) => (
                      <HeroTrustBadge
                        key={item.id}
                        $verified={item.verified}
                        data-testid={`project-v7-attestation-${item.id}`}
                        title={
                          item.verified
                            ? `${item.label} verified${item.provider ? ` by ${item.provider}` : ''}`
                            : `${item.label} not provided`
                        }
                      >
                        <span aria-hidden>{item.id === 'audit' ? '⌁' : '◇'}</span>
                        {item.label}
                      </HeroTrustBadge>
                    ))}
                    <ScoreBadgeWrap data-testid="project-v7-score">
                      <ScoreBadge
                        type="button"
                        aria-label={`Melega Score ${
                          typeof score === 'number' ? Math.round(score) : 'unavailable'
                        } out of 100, ${scoreBand}`}
                        aria-describedby="project-v7-score-details"
                        data-testid="project-v7-score-open"
                      >
                        <ScoreDonut $score={typeof score === 'number' ? score : 0}>
                          <strong>{typeof score === 'number' ? Math.round(score) : '—'}</strong>
                        </ScoreDonut>
                        <ScoreBadgeCopy>
                          <small>Melega Score</small>
                          <strong>{scoreBand}</strong>
                        </ScoreBadgeCopy>
                      </ScoreBadge>
                      <ScorePopover id="project-v7-score-details" role="tooltip" data-testid="project-v7-score-details">
                        <ScorePopoverHead>
                          <ScorePopoverEyebrow>Melega Score</ScorePopoverEyebrow>
                          <ScorePopoverSummary>
                            <strong>
                              {typeof score === 'number' ? Math.round(score) : '—'} <span>/ 100</span>
                            </strong>
                            <em>{scoreBand}</em>
                          </ScorePopoverSummary>
                        </ScorePopoverHead>
                        {readinessDocument?.components?.length ? (
                          <div data-testid="project-v7-score-components">
                            {readinessDocument.components.map((component) => (
                              <ScoreCriterion key={component.componentId}>
                                <span>{component.label}</span>
                                <ScoreMeter $progress={component.normalizedPercentage} aria-hidden />
                                <strong>
                                  {scorePoints(component.achievedPoints)}/{scorePoints(component.maxPoints)}
                                </strong>
                              </ScoreCriterion>
                            ))}
                          </div>
                        ) : (
                          <Muted style={{ margin: 0, fontSize: 10 }}>
                            Score criteria unavailable for this project.
                          </Muted>
                        )}
                        <ScorePopoverFoot>
                          Measured {scoreMeasured} ago · Informational readiness indicator. Not an audit, investment
                          rating or guarantee.
                        </ScorePopoverFoot>
                      </ScorePopover>
                    </ScoreBadgeWrap>
                    {!isUnclaimed || hasPublishedProfile ? (
                      <ProjectMarketingHistoryPopover slug={pageSlug} refreshKey={historyKey} />
                    ) : null}
                  </Row>
                </div>
              </Row>

              {!isUnclaimed || hasPublishedProfile ? (
                <IconRow data-testid="project-v7-socials">
                  {websiteUrl ? (
                    <IconBtn href={websiteUrl} target="_blank" rel="noreferrer" aria-label="Website" title="Website">
                      Web
                    </IconBtn>
                  ) : null}
                  {xUrl ? (
                    <IconBtn href={xUrl} target="_blank" rel="noreferrer" aria-label="X" title="X">
                      X
                    </IconBtn>
                  ) : null}
                  {telegramUrl ? (
                    <IconBtn href={telegramUrl} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram">
                      TG
                    </IconBtn>
                  ) : null}
                  {discordUrl ? (
                    <IconBtn href={discordUrl} target="_blank" rel="noreferrer" aria-label="Discord" title="Discord">
                      DC
                    </IconBtn>
                  ) : null}
                  {contract ? (
                    <ContractRow data-testid="project-v7-contract">
                      <ContractAddr title={contract}>{contract}</ContractAddr>
                      <IconAction
                        type="button"
                        onClick={onCopy}
                        aria-label="Copy contract"
                        data-testid="project-v7-copy"
                      >
                        {copied ? '✓' : '⧉'}
                      </IconAction>
                      <IconBtn
                        href={explorerUrlFor(contract, chainId)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={explorerLabelFor(chainId)}
                        data-testid="project-v7-explorer"
                      >
                        ↗
                      </IconBtn>
                      <WalletIconWrap data-testid="project-v7-metamask">
                        <AddToWalletButton
                          tokenAddress={contract}
                          tokenSymbol={symbol ?? displayName}
                          tokenDecimals={tokenDecimals}
                          tokenLogo={logoUrl || ''}
                          textOptions={AddToWalletTextOptions.NO_TEXT}
                        />
                      </WalletIconWrap>
                    </ContractRow>
                  ) : null}
                </IconRow>
              ) : null}

              {isUnclaimed && !hasPublishedProfile && contract ? (
                <ContractRow data-testid="project-v7-contract">
                  <ContractAddr title={contract}>{contract}</ContractAddr>
                  <IconAction type="button" onClick={onCopy} aria-label="Copy contract" data-testid="project-v7-copy">
                    {copied ? '✓' : '⧉'}
                  </IconAction>
                  <IconBtn
                    href={explorerUrlFor(contract, chainId)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={explorerLabelFor(chainId)}
                    data-testid="project-v7-explorer"
                  >
                    ↗
                  </IconBtn>
                  <WalletIconWrap data-testid="project-v7-metamask">
                    <AddToWalletButton
                      tokenAddress={contract}
                      tokenSymbol={symbol ?? displayName}
                      tokenDecimals={tokenDecimals}
                      tokenLogo={logoUrl || ''}
                      textOptions={AddToWalletTextOptions.NO_TEXT}
                    />
                  </WalletIconWrap>
                </ContractRow>
              ) : null}

              {deployments.length > 1 ? (
                <Row style={{ marginTop: 10, gap: 6, flexWrap: 'wrap' }} data-testid="project-v7-chain-switch">
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
              {isMarcoProject ? (
                <>
                  <MarcoActions data-testid="project-v7-marco-actions">
                    <MarcoActionLink $primary href={contract ? `/swap?outputCurrency=${contract}` : '/swap'}>
                      SWAP
                    </MarcoActionLink>
                    <MarcoActionLink $primary href="/bridge">
                      BRIDGE
                    </MarcoActionLink>
                    <MarcoActionLink href="/farms?search=MARCO">EARN</MarcoActionLink>
                  </MarcoActions>
                  <MarcoAvailability data-testid="project-v7-marco-available-on">
                    <span>Available on</span>
                    {['BNB', 'Base', 'Solana', 'Robinhood Chain'].map((network) => (
                      <Chip key={network}>{network}</Chip>
                    ))}
                  </MarcoAvailability>
                </>
              ) : null}
            </div>
            <HeroContext data-testid="project-v7-hero-context">
              <HeroContextBlock data-testid="project-v7-about">
                <h2>About</h2>
                <p>
                  {isUnclaimed && !hasPublishedProfile
                    ? 'No project profile has been published yet.'
                    : aboutFull || description || 'Project identity is indexed; extended information is not available.'}
                </p>
              </HeroContextBlock>
              <HeroContextBlock data-testid="project-v7-community-react">
                <h2>Community</h2>
                <ReactRow>
                  {[
                    ['like', '👍 Like'],
                    ['watching', '👀 Watching'],
                    ['bullish', '🔥 Bullish'],
                    ['bearish', '🐻 Bearish'],
                    ['moon', '🚀 Moon'],
                  ].map(([id, label]) => (
                    <ReactBtn
                      key={id}
                      type="button"
                      $on={reactions.selected.includes(id as ProjectReactionId)}
                      onClick={() => reactions.react(id as ProjectReactionId)}
                      aria-pressed={reactions.selected.includes(id as ProjectReactionId)}
                      aria-label={
                        reactions.walletConnected
                          ? `${label}: ${reactions.counts[id as ProjectReactionId]}`
                          : `${label}: connect wallet to react`
                      }
                      disabled={reactions.pending === id}
                      data-testid={`project-v7-react-${id}`}
                    >
                      {label} <small>{reactions.counts[id as ProjectReactionId]}</small>
                    </ReactBtn>
                  ))}
                </ReactRow>
              </HeroContextBlock>
            </HeroContext>
          </IdentityHeader>

          <MarketWorkspace
            data-testid="project-v7-market-first-workspace"
            data-project-concept="market-first-project-hq"
          >
            <WorkspacePanel data-testid="project-v7-terminal">
              <ChartSlot
                data-testid="project-v7-chart"
                data-project-section="market"
                $collapsed={chartHistory === false}
                data-chart-history={chartHistory === false ? 'unavailable' : 'available'}
              >
                {tradeReady ? (
                  <ProjectCharts
                    slug={pageSlug}
                    marketsDocument={marketsDocument}
                    variant="hero"
                    pairAddress={dexMarket?.primaryPairAddress ?? market.pairAddress}
                    chainId={chainId}
                    onHistoryAvailability={setChartHistory}
                    heroPairLabel={pairLabel}
                    heroMetrics={marketMetrics.map(([label, value]) => ({ label, value }))}
                  />
                ) : (
                  <ChartSkeleton aria-label="Loading chart" />
                )}
              </ChartSlot>
              <ActivityBlock data-testid="project-v7-activity">
                <BandHead>
                  <BandTitle>Latest Transactions</BandTitle>
                  <BandMeta>Exchanged · received</BandMeta>
                </BandHead>
                {projectActivity.length ? (
                  projectActivity.map((row) => {
                    const legs = activityLegs(row, contract)
                    return (
                      <ActivityRow key={`${row.transactionHash}-${row.logIndex}`} title={row.pairOrPoolIdentity}>
                        <span style={{ color: /sell|remove/i.test(legs.action) ? pp.bad : pp.ok }}>{legs.action}</span>
                        <span title={`Exchanged ${legs.exchanged}`}>
                          <strong style={{ color: 'rgba(255,255,255,.9)' }}>{legs.exchanged}</strong>
                          <small style={{ display: 'block', color: pp.mute2 }}>Exchanged</small>
                        </span>
                        <span title={`Received ${legs.received}`}>
                          <strong style={{ color: 'rgba(255,255,255,.9)' }}>{legs.received}</strong>
                          <small style={{ display: 'block', color: pp.mute2 }}>
                            Received · {shortWallet(row.wallet)}
                          </small>
                        </span>
                        <a
                          href={row.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: pp.gold, textDecoration: 'none' }}
                        >
                          {timeAgo(row.timestamp)} ↗
                        </a>
                      </ActivityRow>
                    )
                  })
                ) : (
                  <Muted style={{ margin: 0 }}>No indexed transactions yet.</Muted>
                )}
              </ActivityBlock>
            </WorkspacePanel>
            <WorkspacePanel aria-label={symbol ? `Buy ${symbol} with Smart Swap` : 'Smart Swap'}>
              <SwapSlot id="project-v7-swap" data-testid="project-v7-swap" $expand>
                {tradeReady ? (
                  <ProjectTradingEmbed
                    slug={pageSlug}
                    marketsDocument={marketsDocument}
                    projectChainId={chainId}
                    contractAddress={contract}
                    variant="hero"
                  />
                ) : (
                  <SwapSkeleton aria-label="Loading Smart Swap" />
                )}
              </SwapSlot>
            </WorkspacePanel>
          </MarketWorkspace>
        </Hero>
      </HeroBand>

      {belowFold ? (
        <>
          <EconomyOverview data-testid="project-v7-economy" data-project-section="economy">
            <EconomyCard data-testid="project-v7-economy-farms">
              <EconomyTitle>Farms</EconomyTitle>
              <DistributionSummary
                items={projectYield.farms.items}
                total={fullUsd(projectYield.farms.totalTvlUsd)}
                emptyLabel={projectYield.farms.loading ? 'Indexing farms…' : 'No active farms for this token.'}
              />
              <YieldDetails items={projectYield.farms.items} />
              <EconomyAction $ghost href={`/farms?create=1&chain=${chainId}`} data-testid="project-v7-create-farm">
                CREATE FARM
              </EconomyAction>
            </EconomyCard>
            <EconomyCard data-testid="project-v7-economy-pools">
              <EconomyTitle>Pools</EconomyTitle>
              <DistributionSummary
                items={projectYield.pools.items}
                total={fullUsd(projectYield.pools.totalTvlUsd)}
                emptyLabel={projectYield.pools.loading ? 'Indexing pools…' : 'No active pools for this token.'}
              />
              <YieldDetails items={projectYield.pools.items} />
              <EconomyAction $ghost href={`/pools?create=1&chain=${chainId}`} data-testid="project-v7-create-pool">
                CREATE POOL
              </EconomyAction>
            </EconomyCard>
            <EconomyCard data-testid="project-v7-liquidity-distribution">
              <EconomyTitle>Liquidity</EconomyTitle>
              <DistributionSummary
                items={(dexMarket?.pairs ?? []).map((pair) => ({
                  id: pair.pairAddress,
                  label: pair.label,
                  tvlUsd: pair.liquidityUsd,
                  sharePct: pair.liquiditySharePct,
                }))}
                total={liveLiquidity}
                emptyLabel="Liquidity distribution unavailable."
              />
              {dexMarket ? (
                <DexCompactRow data-testid="project-v7-multi-dex">
                  <span>
                    DEXs<strong>{dexMarket.dexCount.toLocaleString()}</strong>
                  </span>
                  <span>
                    Pairs<strong>{dexMarket.pairCount.toLocaleString()}</strong>
                  </span>
                  {dexMarket.venues.slice(0, 4).map((venue) => (
                    <span key={venue.dexId}>
                      {venue.dexId}
                      <strong>{venue.pairCount}</strong>
                    </span>
                  ))}
                  {dexAnalytics.data?.sourceUrl ? (
                    <DexSourceLink href={dexAnalytics.data.sourceUrl} target="_blank" rel="noreferrer">
                      Source ↗
                    </DexSourceLink>
                  ) : null}
                </DexCompactRow>
              ) : null}
              <EconomyAction $ghost href={`/liquidity-studio?view=add&chain=${chainId}`}>
                ADD LIQUIDITY
              </EconomyAction>
            </EconomyCard>
            <EconomyCard data-testid="project-v7-holders">
              <EconomyTitle>Holders</EconomyTitle>
              <HolderDonutWrap>
                <HolderDonut aria-label="Indexed holder count">
                  <strong>{dash(market.holders)}</strong>
                </HolderDonut>
                <HolderLegend data-testid="project-v7-holders-dist">
                  {['Pools', 'Smart contracts', 'Team', 'Top 100 holders', 'Wallet holders'].map((category, index) => (
                    <HolderLegendRow key={category}>
                      <i style={{ background: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length] }} />
                      <span>{category}</span>
                      <strong>—</strong>
                    </HolderLegendRow>
                  ))}
                </HolderLegend>
              </HolderDonutWrap>
              <Muted style={{ margin: 0, fontSize: 10 }}>
                Total holders are indexed when available; holder-type percentages are not yet indexed.
              </Muted>
            </EconomyCard>
          </EconomyOverview>

          <DenseBand data-testid="project-v7-boost" data-project-section="boost">
            <BoostConsole data-testid="project-v7-boost-console">
              <BandHead>
                <BandTitle>Boost Your Project</BandTitle>
              </BandHead>
              <BoostRow>
                {boostTiles.map((tile) => (
                  <BoostTile
                    key={tile.id}
                    type="button"
                    onClick={() => openBoost(tile.id)}
                    data-testid={`project-v7-boost-${tile.id}`}
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

          <DenseBand data-testid="project-v7-related" data-project-section="featured-projects">
            <BandHead>
              <BandTitle>Featured Projects</BandTitle>
            </BandHead>
            <FeaturedRail data-testid="project-v7-related-grid">
              {related.map((card) => (
                <FeaturedCard
                  key={card.id}
                  href={card.projectHref}
                  data-testid={`project-v7-related-${card.slug}`}
                  onClick={() => markProjectNavClick()}
                >
                  <MelegaTokenAvatar
                    symbol={card.symbol}
                    name={card.name}
                    address={card.contractAddress}
                    chainId={card.chainId}
                    logoURI={card.logoURI}
                    size={34}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong
                      style={{
                        display: 'block',
                        color: '#fff',
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {card.name}
                    </strong>
                    <span style={{ display: 'block', color: pp.mute, fontSize: 10 }}>
                      ${card.symbol} · Indexed project
                    </span>
                  </div>
                  <span aria-hidden style={{ color: pp.gold }}>
                    ↗
                  </span>
                </FeaturedCard>
              ))}
            </FeaturedRail>
          </DenseBand>
        </>
      ) : (
        <DenseBand data-testid="project-v7-below-fold-skeleton" aria-hidden>
          <Muted>Loading project intelligence…</Muted>
        </DenseBand>
      )}

      <CommercialCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        projectId={contract ? `claim:${contract.toLowerCase()}` : `claim:${pageSlug}`}
        projectSlug={document?.slug ?? pageSlug}
        projectContract={contract}
        chainId={chainId}
        initialService={checkoutService}
        identityReady
        onHistoryChange={() => setHistoryKey((value) => value + 1)}
      />
    </CanonicalPage>
  )
}

export default ProjectPageV7Shell
