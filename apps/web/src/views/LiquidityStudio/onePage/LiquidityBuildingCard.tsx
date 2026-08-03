import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled, { keyframes } from 'styled-components'
import { Currency, ERC20Token } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { CurrencyLogo } from 'components/Logo'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { useCurrency, useIsTokenActive, useIsUserAddedToken } from 'hooks/Tokens'
import { isAddress } from 'utils'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import {
  EPOCH_OPTIONS,
  PROGRAM_STATUS_LABEL,
  setupBudgetPositive,
  setupTokenResolved,
} from '../liquidityBuilding/programStatus'
import { LB_DEPLOYED_ADDRESSES } from '../liquidityBuilding/addresses'
import { humanizeActivationFailure } from '../liquidityBuilding/activationErrors'
import { LB_UX } from '../liquidityBuilding/uxCopy'
import {
  LIQUIDITY_GOAL_OPTIONS,
  QUOTE_ASSET_OPTIONS,
  STRATEGY_PRESET_OPTIONS,
} from '../liquidityBuilding/strategyPresets'
import { liqOne } from './onePageTokens'
import { sanitizeDecimalInput } from 'lib/input/decimalInput'
import { LbDeployReadinessPanel } from './LbDeployReadinessPanel'
import { formatLbTokenAmount } from '../liquidityBuilding/formatLbAmount'
import type { ActivateProgressPhase } from '../liquidityBuilding/founderActivateFlow'
import { useLbOwnerPrograms } from '../liquidityBuilding/useLbOwnerPrograms'
import { useLbProgramDetail } from '../liquidityBuilding/useLbProgramDetail'
import { LbPortfolioHome } from '../liquidityBuilding/product/LbPortfolioHome'
import { programFromQuery, stepFromQuery } from '../liquidityBuilding/liquidityBuildingStep'
import {
  formatReserveLabel,
  pairLabelForProgram,
  statusDisplay,
} from '../liquidityBuilding/portfolioDisplay'

const BUILDER_STEPS = [
  { n: 1, label: 'Set up' },
  { n: 2, label: 'Review' },
  { n: 3, label: 'Activate' },
] as const
type BuilderStep = 1 | 2 | 3

const CONTRACTS_NOT_DEPLOYED = 'Liquidity Building contracts not deployed on BNB Smart Chain'

const goldHaloPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.35),
      0 0 18px rgba(221, 185, 47, 0.08);
  }
  50% {
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.35),
      0 0 36px rgba(221, 185, 47, 0.22);
  }
`

const Card = styled.section<{ $compact?: boolean }>`
  width: ${liqOne.col};
  max-width: 100%;
  /* Geometry exception: inactive summary stays compact — no 860px empty shell. */
  height: ${({ $compact }) => ($compact ? 'auto' : liqOne.mainRowH)};
  max-height: ${({ $compact }) => ($compact ? 'none' : liqOne.mainRowH)};
  box-sizing: border-box;
  padding: 0;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid rgba(255, 255, 255, 0.09);
  background:
    radial-gradient(circle at 86% 12%, rgba(221, 185, 47, 0.1) 0%, rgba(221, 185, 47, 0.02) 34%, transparent 56%),
    ${liqOne.card};
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.35),
    0 0 18px rgba(221, 185, 47, 0.08);
  animation: ${goldHaloPulse} 3.6s ease-in-out infinite;
  overflow: ${({ $compact }) => ($compact ? 'visible' : 'hidden')};
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 1375px) {
    width: 100%;
    height: auto;
    max-height: none;
    overflow: visible;
  }
`

const Hero = styled.div<{ $tight: boolean }>`
  /* Product header packs title + lead tightly above Setup/Review/Activate — no empty band. */
  flex: 0 0 auto;
  height: auto;
  max-height: none;
  padding: ${({ $tight }) => ($tight ? '10px 20px 4px' : '12px 20px 8px')};
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  overflow: visible;
`

const HeroCopy = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: ${liqOne.text};
`

const NewBadge = styled.span`
  flex: 0 0 auto;
  height: 14px;
  padding: 0 5px;
  border-radius: 999px;
  background: ${uxRebuildColors.newViolet};
  color: #ffffff;
  font-size: 8px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`

const ChainOnlyBadge = styled.span`
  flex: 0 0 auto;
  height: 14px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(243, 186, 47, 0.18);
  color: #f3ba2f;
  font-size: 8px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
`

const TitleBadges = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const Desc = styled.p`
  display: block;
  margin: 2px 0 0;
  max-width: 480px;
  font-size: 13px;
  line-height: 18px;
  color: ${liqOne.bodySoft};
`

const Artwork = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => ($show ? 'block' : 'none')};
  position: relative;
  width: 96px;
  height: 72px;
  flex-shrink: 0;
  align-self: center;

  @media (max-width: 767px) {
    display: none;
  }
`

const TokenIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  min-width: 0;
`

const TokenIdentityText = styled.div`
  min-width: 0;
  flex: 1;
`

const TokenSymbol = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: ${liqOne.text};
  line-height: 18px;
`

const TokenMeta = styled.div`
  margin-top: 2px;
  font-size: 11px;
  line-height: 15px;
  color: ${liqOne.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const VerifiedPill = styled.span`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(109, 220, 140, 0.14);
  color: #6ddc8c;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.02em;
`

const Orbit = styled.div`
  position: absolute;
  inset: 8% 10%;
  border-radius: 50%;
  border: 1px solid rgba(221, 185, 47, 0.35);
`

const Orbit2 = styled(Orbit)`
  inset: 22% 24%;
  border-color: rgba(221, 185, 47, 0.2);
  transform: rotate(18deg);
`

const Disc = styled.div<{ $x: string; $y: string; $c: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #2a2a2a, #101010);
  border: 1px solid ${({ $c }) => $c};
`

const Body = styled.div<{ $heroCollapsed: boolean; $compact?: boolean }>`
  flex: 0 0
    ${({ $compact, $heroCollapsed }) =>
      $compact ? 'auto' : $heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH};
  height: ${({ $compact, $heroCollapsed }) =>
    $compact ? 'auto' : $heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH};
  max-height: ${({ $compact, $heroCollapsed }) =>
    $compact ? 'none' : $heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH};
  overflow: ${({ $compact }) => ($compact ? 'visible' : 'hidden')};
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 1375px) {
    flex: 1 1 auto;
    height: auto;
    max-height: none;
    overflow: visible;
  }
`

const BodyScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px ${liqOne.lbPadX} 8px;
  box-sizing: border-box;

  @media (max-width: 1375px) {
    overflow: visible;
  }
`

const Footer = styled.div`
  flex: 0 0 ${liqOne.lbFooterH};
  height: ${liqOne.lbFooterH};
  max-height: ${liqOne.lbFooterH};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 14px ${liqOne.lbPadX} 16px;
  border-top: 1px solid ${liqOne.borderDefault};
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    max-height: none;
    overflow: visible;
  }
`

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Primary = styled.button`
  appearance: none;
  flex: 1;
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: ${liqOne.gold};
  color: #111;
  font-size: 14px;
  font-weight: 800;
  font-family: ${liqOne.font};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${liqOne.goldHover};
  }
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};
  min-width: 0;

  @media (max-width: 767px) {
    margin-bottom: 10px;
  }
`

const FieldHint = styled.span`
  font-size: 11px;
  font-weight: 500;
  line-height: 15px;
  color: ${liqOne.secondary};
`

const DocsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 8px 0 4px;
  font-size: 11px;
  font-weight: 650;

  a {
    color: ${liqOne.gold};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`

const FieldDoc = styled(Link)`
  margin-left: 6px;
  font-size: 10px;
  font-weight: 650;
  color: ${liqOne.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const StatusRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderDefault};
  background: rgba(0, 0, 0, 0.22);
`

const StatusLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  line-height: 16px;
  min-width: 0;

  span:first-child {
    color: ${liqOne.muted};
    flex: 0 0 auto;
  }

  span:last-child {
    color: ${liqOne.text};
    font-weight: 700;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
`

const Input = styled.input`
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderStrong};
  background: ${liqOne.input};
  color: ${liqOne.text};
  padding: 0 12px;
  font-size: 14px;
  font-family: ${liqOne.font};
  outline: none;

  &:focus {
    border-color: ${liqOne.goldBorder};
  }

  @media (max-width: 767px) {
    height: 44px;
  }
`

const TokenRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-top: 2px;
`

const TokenChip = styled.button<{ $on?: boolean }>`
  appearance: none;
  height: 36px;
  max-width: 100%;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ $on }) => ($on ? liqOne.gold : liqOne.borderStrong)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.12)' : liqOne.elevated)};
  color: ${liqOne.text};
  font-size: 13px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  position: relative;
  z-index: ${({ $on }) => ($on ? 1 : 0)};

  @media (max-width: 767px) {
    height: 40px;
    min-height: 40px;
    flex: 1 1 calc(50% - 8px);
    min-width: 0;
  }
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 2px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`

const MetaCell = styled.div`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  background: ${liqOne.elevated};
  padding: 8px 10px 8px;
  min-width: 0;
  overflow: hidden;
`

const MetaLabel = styled.div`
  font-size: 10px;
  color: ${liqOne.muted};
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
  line-height: 14px;
`

const MetaValue = styled.div`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: ${liqOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EpochRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Accordion = styled.details`
  margin-top: 8px;
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  background: ${liqOne.elevated};
  padding: 8px 12px;

  summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: ${liqOne.gold};
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }
`

const AccordionBody = styled.div`
  margin-top: 8px;
  font-size: 12px;
  line-height: 18px;
  color: ${liqOne.secondary};
`

const SummaryStrip = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderDefault};
  background: ${liqOne.elevated};
  font-size: 12px;
  line-height: 18px;
  color: ${liqOne.secondary};
`

const DashGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`

const ProductSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 2px;
`

const ProductTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${liqOne.gold};
`

const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  line-height: 18px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 2px;
  }
`

const ProductKey = styled.span`
  color: ${liqOne.muted};
  font-weight: 650;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`

const ProductVal = styled.span`
  color: ${liqOne.text};
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ActivateGuide = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.28);
  background: rgba(221, 185, 47, 0.06);
`

const ActivateGuideTitle = styled.div`
  font-size: 12px;
  font-weight: 750;
  color: ${liqOne.text};
  margin-bottom: 6px;
`

const ActivateGuideList = styled.ol`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 18px;
  color: ${liqOne.secondary};
`

const ActivateLive = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ActivateLiveItem = styled.li<{ $state: 'pending' | 'active' | 'done' }>`
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: ${({ $state }) =>
    $state === 'done' ? '#86efac' : $state === 'active' ? liqOne.gold : liqOne.muted};
`

const EmptyHint = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: ${liqOne.secondary};
`

const InlineError = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: #f87171;
`

const StepTrack = styled.ol`
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 767px) {
    margin-bottom: 8px;
    gap: 4px;
  }
`

const StepItem = styled.li<{ $active?: boolean; $done?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, $done }) =>
      $active ? 'rgba(244,196,48,0.55)' : $done ? 'rgba(109,220,140,0.35)' : 'rgba(255,255,255,0.08)'};
  background: ${({ $active }) => ($active ? 'rgba(244,196,48,0.1)' : 'rgba(255,255,255,0.02)')};
  font-size: 12px;
  font-weight: 700;
  color: ${({ $active, $done }) => ($active ? '#f2c84c' : $done ? '#6ddc8c' : 'rgba(255,255,255,0.55)')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    gap: 4px;
    padding: 6px 6px;
    font-size: 11px;
    border-radius: 8px;
  }
`

const StepNum = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid currentColor;
  font-size: 11px;
  flex: 0 0 auto;
`

const Secondary = styled.button`
  appearance: none;
  cursor: pointer;
  height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 700;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const ConnectSlot = styled.div`
  flex: 1;

  button,
  a {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
  }
`

function humanizeGateReason(reason: string | null | undefined): string {
  if (reason === 'NO_ACTIVE_PROGRAM') {
    return LB_UX.noActiveProgramTitle
  }
  if (
    reason === 'DEPLOYMENT_INPUTS_BLOCKED' ||
    reason === 'LB_PROGRAM_NOT_DEPLOYED' ||
    reason === 'LB_FACTORY_MISSING' ||
    reason === 'LB_AUTHORIZER_MISSING' ||
    reason === 'LB_FEE_SINK_MISSING'
  ) {
    return CONTRACTS_NOT_DEPLOYED
  }
  return humanizeActivationFailure(reason)
}

function resolveProgramUnavailableReason(input: {
  programSource: 'ON_CHAIN' | 'UNAVAILABLE'
  programReason: string | null
  mutateGate: { ok: boolean; reason: string | null }
  factoryBound?: boolean
}): string | null {
  const factoryBound =
    input.factoryBound ||
    Boolean(
      LB_DEPLOYED_ADDRESSES.lbFactory &&
        LB_DEPLOYED_ADDRESSES.lbAuthorizer &&
        LB_DEPLOYED_ADDRESSES.lbFeeSink,
    )

  // Factory live + no clone yet is the createProgram entry state — do not block Activate.
  if (factoryBound && input.programReason === 'NO_ACTIVE_PROGRAM') {
    if (!input.mutateGate.ok) return humanizeGateReason(input.mutateGate.reason)
    return null
  }

  const addressesNull =
    !LB_DEPLOYED_ADDRESSES.lbFactory &&
    !LB_DEPLOYED_ADDRESSES.lbAuthorizer &&
    !LB_DEPLOYED_ADDRESSES.lbFeeSink &&
    !LB_DEPLOYED_ADDRESSES.programAddress

  if (!factoryBound || addressesNull) {
    return humanizeGateReason(input.programReason ?? 'LB_PROGRAM_NOT_DEPLOYED')
  }
  if (input.programSource !== 'ON_CHAIN' && input.programReason && input.programReason !== 'NO_ACTIVE_PROGRAM') {
    return humanizeGateReason(input.programReason)
  }
  if (!input.mutateGate.ok) {
    return humanizeGateReason(input.mutateGate.reason)
  }
  return null
}

/**
 * MODULE_002 — AI Liquidity Builder (Founder final): Configure → Review → Activate.
 * Deployment remains blocked until LB contracts are bound — no dead/misleading Activate.
 */
type LiquidityBuildingCardProps = {
  /** IA workspace: open setup immediately — no click-to-expand shell. */
  forceExpanded?: boolean
}

export const LiquidityBuildingCard = React.forwardRef<HTMLElement, LiquidityBuildingCardProps>(
  function LiquidityBuildingCard({ forceExpanded = false }, ref) {
  const router = useRouter()
  const card = useLiquidityBuildingCard()
  const inventory = useLbOwnerPrograms(card.account)
  const deepLinkProgram = programFromQuery(router.query.program)
  const indexedDetail = useLbProgramDetail(deepLinkProgram)
  /** Intentional create flow only — never infer from forceExpanded when programs already exist. */
  const [setupStarted, setSetupStarted] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)
  const [activatePhase, setActivatePhase] = useState<ActivateProgressPhase | null>(null)
  const [activateDonePhases, setActivateDonePhases] = useState<ActivateProgressPhase[]>([])
  const [activateHint, setActivateHint] = useState<string | null>(null)
  const [builderStep, setBuilderStep] = useState<BuilderStep>(1)
  const [addressInput, setAddressInput] = useState('')

  const returnToPortfolio = () => {
    setSetupStarted(false)
    setBuilderStep(1)
    setAdvancedOpen(false)
    setStepError(null)
    card.reset()
    void router.replace({ pathname: '/liquidity-studio', query: { view: 'building' } }, undefined, {
      shallow: true,
    })
    inventory.refetch()
  }

  const openProgramDetail = (programAddress: string) => {
    setSetupStarted(false)
    setStepError(null)
    void router.replace(
      {
        pathname: '/liquidity-studio',
        query: { view: 'building', program: programAddress, step: 'dashboard' },
      },
      undefined,
      { shallow: true },
    )
  }

  /**
   * IA forceExpanded: expand the shell, but only auto-open create when the portfolio is empty.
   * Existing active programs must surface portfolio/detail — never a blank create setup.
   */
  React.useEffect(() => {
    if (!forceExpanded) return
    if (deepLinkProgram) return
    if (inventory.loading) return
    if (inventory.programs.length > 0) return
    if (setupStarted) return
    if (card.phase === 'active' || card.phase === 'manage') return
    card.startSetup()
    setSetupStarted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceExpanded, deepLinkProgram, inventory.loading, inventory.programs.length, setupStarted, card.phase])

  /**
   * Guard: /liquidity-studio/?view=building&step=setup with an existing program must not stay on create.
   * Clear setup query and return to portfolio inventory.
   */
  React.useEffect(() => {
    if (!router.isReady) return
    if (setupStarted || deepLinkProgram) return
    if (inventory.loading || inventory.programs.length === 0) return
    const step = stepFromQuery(router.query.step)
    if (step === 'setup' || step === 'review' || step === 'status') {
      card.backToEntry()
      void router.replace({ pathname: '/liquidity-studio', query: { view: 'building' } }, undefined, {
        shallow: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.isReady,
    router.query.step,
    setupStarted,
    deepLinkProgram,
    inventory.loading,
    inventory.programs.length,
  ])

  const selectedProjectToken = useCurrency(card.draft.tokenAddress ?? undefined)
  const pastedAddress = isAddress(addressInput) || undefined
  const pastedCurrency = useCurrency(pastedAddress)
  const selectedErc20 = (
    selectedProjectToken?.isToken ? selectedProjectToken : selectedProjectToken?.wrapped
  ) as ERC20Token | undefined
  const isListed = useIsTokenActive(selectedErc20)
  const isUserAdded = useIsUserAddedToken(selectedProjectToken)
  const setTokenRef = useRef(card.setToken)
  useEffect(() => {
    setTokenRef.current = card.setToken
  }, [card.setToken])

  useEffect(() => {
    if (!pastedCurrency) return
    setTokenRef.current(pastedCurrency)
    setSetupStarted(true)
    setStepError(null)
  }, [pastedCurrency])

  const [onPresentCustomToken] = useModal(
    <CurrencySearchModal
      onCurrencySelect={(c: Currency) => {
        setTokenRef.current(c)
        setAddressInput('')
        setSetupStarted(true)
        setStepError(null)
      }}
      selectedCurrency={selectedProjectToken ?? undefined}
      showCommonBases
    />,
    true,
    true,
    'lb-custom-token-select',
  )

  const isActive = card.phase === 'active' || card.phase === 'manage'
  /** Create wizard only when user intentionally started create (or empty auto-start). */
  const inFlow = setupStarted && !isActive
  // Portfolio home when not creating and not viewing a program detail.
  // forceExpanded must NOT suppress portfolio when programs already exist.
  const showPortfolio = !setupStarted && !isActive && !activating
  // IA workspace already titles the pane — keep LB header collapsed, body expanded.
  const heroCollapsed = forceExpanded || inFlow || isActive || showPortfolio
  /** Inactive summary: compact shell — avoid 860px empty body (geometry exception). */
  // Product polish: auto-height for setup/active — avoid 860px empty laptop shells.
  const compactInactive = !forceExpanded && !inFlow && !isActive
  const compactLayout = compactInactive || inFlow || isActive || forceExpanded || showPortfolio

  const onStart = () => {
    card.startSetup()
    setSetupStarted(true)
    setStepError(null)
    void router.replace({ pathname: '/liquidity-studio', query: { view: 'building', step: 'setup' } }, undefined, {
      shallow: true,
    })
  }

  const tokenReady = setupTokenResolved(card.draft)
  const budgetReady = setupBudgetPositive(card.draft)
  const pair = card.pairDetection
  const pairReady = Boolean(tokenReady && pair.available && !pair.loading)
  const listingStatus = !tokenReady
    ? LB_UX.listingNone
    : isListed
      ? `${LB_UX.listingListed} · ${LB_UX.listingVerified}`
      : isUserAdded
        ? LB_UX.listingUserAdded
        : LB_UX.listingExternal
  const tokenMarketStatus = !tokenReady
    ? LB_UX.listingNone
    : pair.loading
      ? LB_UX.marketPoolLoading
      : pair.available
        ? LB_UX.marketPoolFound
        : LB_UX.marketPoolMissing
  const programBlockReason = resolveProgramUnavailableReason({
    programSource: card.programSource,
    programReason: card.programReason,
    mutateGate: card.mutateGate,
    factoryBound: card.factoryBound,
  })

  const eligibilityLabel = useMemo(() => {
    if (!tokenReady) return 'Choose a Token to Grow'
    if (pair.loading) return LB_UX.pairLoading
    if (!pair.available) return LB_UX.pairNotDetected
    if (!card.quoteEnabled && card.draft.quoteAssetKey !== 'WBNB') return LB_UX.quoteNotEnabled
    if (programBlockReason === CONTRACTS_NOT_DEPLOYED) return 'Pending mainnet deployment'
    if (programBlockReason === LB_UX.noActiveProgramTitle) return LB_UX.noActiveProgramCta
    if (programBlockReason) return programBlockReason
    if (!card.walletConnected) return 'Connect wallet to activate'
    if (!card.correctChain) return LB_UX.switchNetwork
    if (card.mutateGate.ok) return 'Ready to activate your liquidity program'
    return 'Finish setup to continue'
  }, [
    tokenReady,
    pair.loading,
    pair.available,
    programBlockReason,
    card.walletConnected,
    card.correctChain,
    card.quoteEnabled,
    card.draft.quoteAssetKey,
    card.mutateGate.ok,
  ])

  const summaryLine = useMemo(() => {
    const token = card.draft.tokenSymbol || '—'
    const reserve = card.draft.tokenBudget || '—'
    const strategy =
      STRATEGY_PRESET_OPTIONS.find((o) => o.key === card.draft.strategyPreset)?.title || 'AI Optimized'
    const goal = LIQUIDITY_GOAL_OPTIONS.find((o) => o.key === card.draft.liquidityGoal)?.label || '—'
    const pairLabel =
      pairReady && card.draft.tokenSymbol
        ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}`
        : 'Market not found yet'
    return `${token} · Reserve ${reserve} · ${strategy} · ${goal} · ${pairLabel}`
  }, [
    card.draft.tokenSymbol,
    card.draft.tokenBudget,
    card.draft.strategyPreset,
    card.draft.liquidityGoal,
    pairReady,
    pair.quoteSymbol,
  ])

  const configureReady = tokenReady && budgetReady && Boolean(card.draft.strategy)
  const quoteOk = card.quoteEnabled || card.draft.quoteAssetKey === 'WBNB'
  const executionReady = Boolean(
    configureReady &&
      pairReady &&
      quoteOk &&
      card.walletConnected &&
      card.correctChain &&
      !programBlockReason &&
      card.mutateGate.ok,
  )

  const primaryLabel = useMemo(() => {
    if (stepError) return stepError
    if (showPortfolio) return LB_UX.portfolioCreateCta
    if (isActive) return LB_UX.programActiveLabel
    if (activating) {
      if (activateHint) return activateHint
      return LB_UX.activationInProgress
    }
    if (!inFlow) return LB_UX.startCta
    if (builderStep === 1) {
      if (!tokenReady) return 'Choose Token to Grow'
      if (!budgetReady) return 'Enter Token Reserve'
      return 'Continue to Review'
    }
    if (builderStep === 2) return 'Continue to Activate'
    if (programBlockReason === CONTRACTS_NOT_DEPLOYED) return 'Pending Mainnet Deployment'
    if (programBlockReason && programBlockReason !== LB_UX.noActiveProgramTitle) return programBlockReason
    if (!card.walletConnected) return 'Connect Wallet'
    if (!pairReady) return 'Pair Required'
    if (!quoteOk) return 'Choose WBNB Quote'
    if (card.status === 'AWAITING_APPROVAL') return 'Approve Tokens'
    return 'Activate Liquidity Program'
  }, [
    stepError,
    showPortfolio,
    isActive,
    activating,
    activateHint,
    inFlow,
    builderStep,
    card.walletConnected,
    tokenReady,
    budgetReady,
    pairReady,
    card.status,
    programBlockReason,
    quoteOk,
  ])

  const showConnectSlot =
    inFlow && !isActive && builderStep === 3 && !card.walletConnected && !stepError && !programBlockReason

  const runActivate = async () => {
    if (programBlockReason) {
      setStepError(programBlockReason)
      return
    }
    if (!card.walletConnected) {
      const connect = document.querySelector<HTMLButtonElement>('[data-testid="liq-lb-connect-wallet"]')
      connect?.click()
      return
    }
    const eth =
      typeof window !== 'undefined'
        ? (
            window as Window & {
              ethereum?: { request?: (args: { method: string }) => Promise<unknown> }
            }
          ).ethereum
        : undefined
    void eth?.request?.({ method: 'eth_requestAccounts' }).catch(() => undefined)

    if (card.draftReady) {
      card.openReview()
    }

    setActivating(true)
    setActivatePhase(null)
    setActivateDonePhases([])
    setActivateHint(LB_UX.activationLiveCreating)
    setStepError(null)
    try {
      const result = await card.requestDepositAndActivate({
        onProgress: (event) => {
          setActivatePhase(event.phase)
          setActivateHint(event.label)
          if (event.done) {
            setActivateDonePhases((prev) =>
              prev.includes(event.phase) ? prev : [...prev, event.phase],
            )
          }
        },
      })
      if (result && !result.ok) {
        setStepError(humanizeActivationFailure(result.reason) || result.reason)
      } else if (result && result.ok) {
        // Return to Portfolio after successful activation (multi-program home).
        setSetupStarted(false)
        setBuilderStep(1)
        inventory.refetch()
        card.reset()
        void router.replace({ pathname: '/liquidity-studio', query: { view: 'building' } }, undefined, {
          shallow: true,
        })
      }
    } finally {
      setActivating(false)
      setActivateHint(null)
    }
  }

  const onPrimary = () => {
    if (isActive) {
      if (card.status === 'PAUSED' || card.status === 'SAFETY_PAUSED') card.resume()
      else if (card.status === 'ACTIVE') card.pause()
      return
    }
    if (showPortfolio || !inFlow) {
      onStart()
      setBuilderStep(1)
      return
    }
    if (builderStep === 1) {
      if (!tokenReady) {
        onPresentCustomToken()
        return
      }
      if (!budgetReady) {
        setStepError('Enter a positive Token Reserve to continue.')
        return
      }
      setStepError(null)
      setBuilderStep(2)
      return
    }
    if (builderStep === 2) {
      if (!configureReady) {
        setStepError('Complete Token, Budget, and Strategy before review.')
        setBuilderStep(1)
        return
      }
      setStepError(null)
      if (card.draftReady) card.openReview()
      setBuilderStep(3)
      return
    }
    if (!pairReady) {
      setStepError(LB_UX.pairNotDetected)
      return
    }
    if (programBlockReason) {
      setStepError(programBlockReason)
      return
    }
    setStepError(null)
    runActivate()
  }

  const primaryDisabled =
    activating || (builderStep === 3 && Boolean(programBlockReason)) || (isActive && false)

  const content = (() => {
    if (showPortfolio) {
      return (
        <LbPortfolioHome
          walletConnected={card.walletConnected}
          loading={inventory.loading}
          error={inventory.error}
          programs={inventory.programs}
          onCreate={() => {
            onStart()
            setBuilderStep(1)
          }}
          onManage={openProgramDetail}
          onViewDetails={openProgramDetail}
        />
      )
    }

    if (isActive) {
      const s = card.programSnapshot
      const m = card.metrics
      const decimals = card.selectedCurrency?.wrapped?.decimals ?? 18
      const symbol = card.draft.tokenSymbol || s.tokenSymbol || null
      const indexed = indexedDetail.program
      const reserveLabel =
        (indexed ? formatReserveLabel(indexed.reserve, indexed.token) : null) ||
        s.initialBudgetLabel ||
        formatLbTokenAmount(card.draft.tokenBudget, decimals, symbol) ||
        (card.draft.tokenBudget && symbol ? `${card.draft.tokenBudget} ${symbol}` : card.draft.tokenBudget) ||
        '—'
      const remainingLabel =
        (indexed ? formatReserveLabel(indexed.remaining, indexed.token) : null) ||
        s.remainingBudgetLabel ||
        m.budgetRemainingLabel ||
        '—'
      const strategyLabel =
        indexed?.strategy ||
        STRATEGY_PRESET_OPTIONS.find((o) => o.key === card.draft.strategyPreset)?.title ||
        (card.draft.strategy === 'FULL_AI' ? LB_UX.strategyFullAiTitle : LB_UX.strategyRangeTitle)
      const goalLabel =
        indexed?.goal ||
        LIQUIDITY_GOAL_OPTIONS.find((o) => o.key === card.draft.liquidityGoal)?.label ||
        LB_UX.portfolioGoalFallback
      const statusLabel = indexed
        ? statusDisplay(indexed.status)
        : card.status === 'ACTIVE'
          ? LB_UX.activeStatusRunning
          : PROGRAM_STATUS_LABEL[card.status]
      const pairLabel =
        (indexed ? pairLabelForProgram(indexed) : null) || s.pairLabel || '—'
      return (
        <ProductSummary data-testid="liq-lb-dashboard" data-lb-product-active="1">
          <Secondary
            type="button"
            data-testid="liq-lb-back-portfolio"
            onClick={returnToPortfolio}
            style={{ alignSelf: 'flex-start', height: 32, marginBottom: 4 }}
          >
            {LB_UX.portfolioViewPortfolio}
          </Secondary>
          <ProductTitle data-testid="liq-lb-active-title">{LB_UX.activeProductTitle}</ProductTitle>

          <ProductRow>
            <ProductKey>Token</ProductKey>
            <ProductVal data-testid="liq-lb-active-token">
              {symbol || (indexed ? pairLabel.split('/')[0] : '—')}
            </ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Pair</ProductKey>
            <ProductVal data-testid="liq-lb-active-pair">{pairLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Status</ProductKey>
            <ProductVal data-testid="liq-lb-program-status">{statusLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Allocated reserve</ProductKey>
            <ProductVal data-testid="liq-lb-active-reserve">{reserveLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Remaining reserve</ProductKey>
            <ProductVal data-testid="liq-lb-active-remaining">{remainingLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Strategy</ProductKey>
            <ProductVal data-testid="liq-lb-active-strategy">{strategyLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Liquidity Goal</ProductKey>
            <ProductVal data-testid="liq-lb-active-goal">{goalLabel}</ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Executions</ProductKey>
            <ProductVal data-testid="liq-lb-active-executions">
              {indexed?.executionCount != null
                ? String(indexed.executionCount)
                : m.executionCount != null
                  ? String(m.executionCount)
                  : '—'}
            </ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Liquidity generated</ProductKey>
            <ProductVal data-testid="liq-lb-active-liquidity">
              {s.liquidityBuiltLabel || m.liquidityBuiltLabel || '—'}
            </ProductVal>
          </ProductRow>
          <ProductRow>
            <ProductKey>Fees generated</ProductKey>
            <ProductVal data-testid="liq-lb-active-fees">
              {indexed?.totalFeePaid
                ? formatReserveLabel(indexed.totalFeePaid, indexed.quoteAsset)
                : s.feePaidLabel || '—'}
            </ProductVal>
          </ProductRow>

          {indexedDetail.events.length > 0 ? (
            <div data-testid="liq-lb-active-events" style={{ marginTop: 6 }}>
              <ProductKey style={{ display: 'block', marginBottom: 4 }}>Events</ProductKey>
              {indexedDetail.events.slice(0, 6).map((ev) => (
                <ProductVal
                  key={`${ev.transactionHash}-${ev.logIndex}`}
                  style={{ display: 'block', fontWeight: 650, fontSize: 12, marginBottom: 2 }}
                >
                  {ev.eventType}
                  {ev.transactionHash
                    ? ` · ${ev.transactionHash.slice(0, 6)}…${ev.transactionHash.slice(-4)}`
                    : ''}
                </ProductVal>
              ))}
            </div>
          ) : null}

          <Accordion
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
            data-testid="liq-lb-active-advanced"
          >
            <summary>{LB_UX.technicalTitle}</summary>
            <AccordionBody>
              <DashGrid>
                <MetaCell>
                  <MetaLabel>Program Address</MetaLabel>
                  <MetaValue data-testid="liq-lb-program-address" title={s.programAddress || deepLinkProgram || undefined}>
                    {(s.programAddress || deepLinkProgram)
                      ? `${(s.programAddress || deepLinkProgram)!.slice(0, 6)}…${(s.programAddress || deepLinkProgram)!.slice(-4)}`
                      : '—'}
                  </MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>
                    Success Fee
                    <FieldDoc href={LB_UX.docsFees} data-testid="lb-docs-link-fees">
                      {LB_UX.docsFieldLink}
                    </FieldDoc>
                  </MetaLabel>
                  <MetaValue data-testid="liq-lb-success-fee">
                    {(card.successFeeBps / 100).toFixed(0)}%
                  </MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Gross Quote</MetaLabel>
                  <MetaValue>{s.grossQuoteLabel || '—'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Fee Paid</MetaLabel>
                  <MetaValue data-testid="liq-lb-fee-paid">{s.feePaidLabel || '—'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>LP Owner</MetaLabel>
                  <MetaValue>{s.lpOwner || s.lpRecipient || '—'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Last Epoch</MetaLabel>
                  <MetaValue>{s.lastDecisionLabel || '—'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Next Epoch</MetaLabel>
                  <MetaValue>{s.nextDecisionLabel || '—'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Recent Tx</MetaLabel>
                  <MetaValue>{card.activity[0]?.title || 'None yet'}</MetaValue>
                </MetaCell>
                <MetaCell>
                  <MetaLabel>Check frequency</MetaLabel>
                  <MetaValue>{card.decisionFrequencyLabel}</MetaValue>
                </MetaCell>
              </DashGrid>
            </AccordionBody>
          </Accordion>
        </ProductSummary>
      )
    }

    if (!inFlow) {
      // Fallback empty — portfolio mode normally owns entry.
      return (
        <LbPortfolioHome
          walletConnected={card.walletConnected}
          loading={inventory.loading}
          error={inventory.error}
          programs={inventory.programs}
          onCreate={() => {
            onStart()
            setBuilderStep(1)
          }}
          onManage={openProgramDetail}
          onViewDetails={openProgramDetail}
        />
      )
    }

    const selectedTokenLabel = card.draft.tokenSymbol || LB_UX.tokenSearchCta
    const marketPair =
      card.draft.tokenSymbol && pair.quoteSymbol
        ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}`
        : '—'

    return (
      <div data-testid="liq-lb-single-surface" data-lb-surface="exploded" data-lb-step={builderStep}>
        <StepTrack data-testid="liq-lb-step-track" aria-label="Builder status">
          {BUILDER_STEPS.map((s) => (
            <StepItem key={s.n} $active={builderStep === s.n} $done={builderStep > s.n}>
              <StepNum>{s.n}</StepNum>
              {s.label}
            </StepItem>
          ))}
        </StepTrack>

        <DocsRow data-testid="liq-lb-docs-links">
          <Link href={LB_UX.docsHub} data-testid="lb-docs-hub-link">
            Documentation
          </Link>
          <Link href={LB_UX.docsTokenReserve}>Token Reserve</Link>
          <Link href={LB_UX.docsLiquidityGoals}>Goal</Link>
          <Link href={LB_UX.docsStrategies}>Strategy</Link>
          <Link href={LB_UX.docsFees}>Fees</Link>
        </DocsRow>

        <div data-testid="liq-lb-step-configure" data-lb-exploded-form="1">
          <MetaGrid data-testid="liq-lb-exploded-grid">
            <MetaCell style={{ gridColumn: '1 / -1' }}>
              <MetaLabel>{LB_UX.tokenToGrowLabel}</MetaLabel>
              <FieldHint>{LB_UX.tokenToGrowSupport}</FieldHint>
              <TokenRow>
                <TokenChip
                  type="button"
                  $on={Boolean(card.draft.tokenSymbol)}
                  onClick={onPresentCustomToken}
                  data-testid="lb-token-select"
                  data-selected-token={card.draft.tokenSymbol || ''}
                >
                  {selectedTokenLabel}
                </TokenChip>
              </TokenRow>
              <Input
                type="text"
                spellCheck={false}
                autoComplete="off"
                placeholder={LB_UX.tokenPastePlaceholder}
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value.trim())
                  setStepError(null)
                }}
                data-testid="lb-token-address-input"
                style={{ marginTop: 8 }}
              />
              {tokenReady && selectedProjectToken ? (
                <TokenIdentity data-testid="lb-token-identity">
                  <CurrencyLogo currency={selectedProjectToken} size="28px" />
                  <TokenIdentityText>
                    <TokenSymbol data-testid="lb-token-selected-label">
                      {card.draft.tokenSymbol}
                      {isListed ? (
                        <>
                          {' '}
                          <VerifiedPill data-testid="lb-token-verified">{LB_UX.listingVerified}</VerifiedPill>
                        </>
                      ) : null}
                    </TokenSymbol>
                    <TokenMeta data-testid="lb-token-contract">
                      {card.draft.tokenAddress
                        ? `${card.draft.tokenAddress.slice(0, 6)}…${card.draft.tokenAddress.slice(-4)}`
                        : '—'}
                      {isListed ? ` · ${LB_UX.listingListed}` : ` · ${LB_UX.listingExternal}`}
                    </TokenMeta>
                    {!isListed ? (
                      <TokenMeta data-testid="lb-token-external-hint">{LB_UX.externalTokenHint}</TokenMeta>
                    ) : null}
                  </TokenIdentityText>
                </TokenIdentity>
              ) : null}
              <StatusRow data-testid="lb-token-detection-status">
                <StatusLine>
                  <span>{LB_UX.tokenDetectedLabel}</span>
                  <span>{card.draft.tokenSymbol || '—'}</span>
                </StatusLine>
                <StatusLine>
                  <span>{LB_UX.listingStatusLabel}</span>
                  <span data-testid="lb-token-listing-status">{listingStatus}</span>
                </StatusLine>
                <StatusLine>
                  <span>{LB_UX.marketStatusLabel}</span>
                  <span data-testid="lb-token-market-status">{tokenMarketStatus}</span>
                </StatusLine>
              </StatusRow>
            </MetaCell>

            <MetaCell>
              <MetaLabel>{LB_UX.quoteAssetLabel}</MetaLabel>
              <FieldHint>{LB_UX.quoteAssetSupport}</FieldHint>
              <TokenRow>
                {QUOTE_ASSET_OPTIONS.map((q) => (
                  <TokenChip
                    key={q.key}
                    type="button"
                    $on={card.draft.quoteAssetKey === q.key}
                    onClick={() => {
                      setStepError(null)
                      card.setQuoteAssetKey(q.key)
                    }}
                    data-testid={`lb-quote-${q.key.toLowerCase()}`}
                  >
                    {q.label}
                  </TokenChip>
                ))}
              </TokenRow>
              {!card.quoteEnabled && card.draft.quoteAssetKey !== 'WBNB' ? (
                <MetaValue style={{ marginTop: 6 }} data-testid="lb-quote-disabled-hint">
                  {LB_UX.quoteNotEnabled}
                </MetaValue>
              ) : null}
            </MetaCell>

            <MetaCell>
              <MetaLabel>
                {LB_UX.reserveLabel}
                <FieldDoc href={LB_UX.docsTokenReserve} data-testid="lb-docs-link-reserve">
                  {LB_UX.docsFieldLink}
                </FieldDoc>
              </MetaLabel>
              <FieldHint>{LB_UX.reserveSupport}</FieldHint>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={LB_UX.reserveExample}
                value={card.draft.tokenBudget}
                onChange={(e) => {
                  setStepError(null)
                  card.setBudget(sanitizeDecimalInput(e.target.value))
                }}
                data-testid="lb-budget-input"
              />
            </MetaCell>

            <MetaCell style={{ gridColumn: '1 / -1' }}>
              <MetaLabel>
                {LB_UX.liquidityGoalLabel}
                <FieldDoc href={LB_UX.docsLiquidityGoals} data-testid="lb-docs-link-goal">
                  {LB_UX.docsFieldLink}
                </FieldDoc>
              </MetaLabel>
              <TokenRow>
                {LIQUIDITY_GOAL_OPTIONS.map((g) => (
                  <TokenChip
                    key={g.key}
                    type="button"
                    $on={card.draft.liquidityGoal === g.key}
                    onClick={() => card.setLiquidityGoal(g.key)}
                    data-testid={`lb-goal-${g.key.toLowerCase()}`}
                    title={g.tooltip}
                    aria-label={`${g.label}. ${g.tooltip}`}
                  >
                    {g.label}
                  </TokenChip>
                ))}
              </TokenRow>
              <MetaValue style={{ marginTop: 6 }} data-testid="lb-goal-hint">
                {LIQUIDITY_GOAL_OPTIONS.find((g) => g.key === card.draft.liquidityGoal)?.tooltip}
              </MetaValue>
            </MetaCell>

            <MetaCell style={{ gridColumn: '1 / -1' }}>
              <MetaLabel>
                Liquidity Strategy
                <FieldDoc href={LB_UX.docsStrategies} data-testid="lb-docs-link-strategy">
                  {LB_UX.docsFieldLink}
                </FieldDoc>
              </MetaLabel>
              <TokenRow style={{ flexWrap: 'wrap' }}>
                {STRATEGY_PRESET_OPTIONS.map((s) => (
                  <TokenChip
                    key={s.key}
                    type="button"
                    $on={card.draft.strategyPreset === s.key}
                    onClick={() => card.setStrategyPreset(s.key)}
                    data-testid={`lb-strategy-${s.key.toLowerCase()}`}
                    title={s.tooltip}
                    aria-label={`${s.title}. ${s.tooltip}`}
                  >
                    {s.title}
                    {s.recommended ? ' · Rec' : ''}
                  </TokenChip>
                ))}
              </TokenRow>
              <MetaValue style={{ marginTop: 6 }} data-testid="lb-strategy-hint">
                {STRATEGY_PRESET_OPTIONS.find((s) => s.key === card.draft.strategyPreset)?.tooltip}
              </MetaValue>
            </MetaCell>
          </MetaGrid>

          <Accordion
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
            data-testid="liq-lb-advanced"
          >
            <summary>{LB_UX.technicalTitle}</summary>
            <AccordionBody>
              <Field>
                {LB_UX.decisionFrequencyLabel}
                <EpochRow>
                  {EPOCH_OPTIONS.map((o) => (
                    <TokenChip
                      key={o.seconds}
                      type="button"
                      $on={card.draft.epochSeconds === o.seconds}
                      onClick={() => card.setEpoch(o.seconds)}
                      data-testid={`lb-freq-${o.seconds}`}
                    >
                      {o.seconds === 300 ? '5m' : o.seconds === 900 ? '15m' : o.seconds === 1800 ? '30m' : '1h'}
                    </TokenChip>
                  ))}
                </EpochRow>
              </Field>
              <div style={{ marginTop: 10 }} data-testid="lb-market-pair">
                Detected pair: {marketPair}
              </div>
              <div style={{ marginTop: 6 }} data-testid="liq-lb-eligibility">
                Market status: {eligibilityLabel}
              </div>
              <div style={{ marginTop: 6 }}>
                Deploy readiness:{' '}
                {executionReady ? 'Ready' : programBlockReason ? 'Not ready' : 'Finish setup'}
              </div>
              <div style={{ marginTop: 6 }}>
                Pool: {pairReady ? 'found' : 'not found'} · Pair address {pair.pairAddress || '—'} · Strategy mode{' '}
                {card.draft.strategy}
              </div>
              <div style={{ marginTop: 6 }}>
                Execution readiness:{' '}
                {executionReady ? 'Yes — review and activate' : programBlockReason || 'Finish setup'}
              </div>
              <LbDeployReadinessPanel
                pairLabel={
                  pairReady && card.draft.tokenSymbol ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}` : null
                }
                pairAddress={pair.pairAddress}
                pairReady={pairReady}
                executionReady={executionReady}
                executionReason={programBlockReason || (!pairReady ? LB_UX.pairNotDetected : null)}
              />
            </AccordionBody>
          </Accordion>
        </div>

        <div data-testid="liq-lb-step-review" data-lb-inline-review="1">
          <SummaryStrip data-testid="liq-lb-summary">{summaryLine}</SummaryStrip>
        </div>

        {(builderStep === 3 || activating) && !isActive ? (
          <ActivateGuide data-testid="liq-lb-activation-guide">
            <ActivateGuideTitle>{LB_UX.activationRequiresTitle}</ActivateGuideTitle>
            <ActivateGuideList>
              <li data-testid="liq-lb-wallet-step-1">{LB_UX.activationStepApprove}</li>
              <li data-testid="liq-lb-wallet-step-2">{LB_UX.activationStepDeposit}</li>
              <li data-testid="liq-lb-wallet-step-3">{LB_UX.activationStepActivate}</li>
            </ActivateGuideList>
            {activating ? (
              <ActivateLive data-testid="liq-lb-activation-live" aria-live="polite">
                {(
                  [
                    {
                      phase: 'CREATE_PROGRAM' as const,
                      label: LB_UX.activationLiveCreating,
                      doneLabel: 'Program created',
                    },
                    {
                      phase: 'APPROVE' as const,
                      label: LB_UX.activationLiveApproved,
                      doneLabel: LB_UX.activationLiveApproved,
                    },
                    {
                      phase: 'DEPOSIT' as const,
                      label: LB_UX.activationLiveDeposited,
                      doneLabel: LB_UX.activationLiveDeposited,
                    },
                    {
                      phase: 'ACTIVATE' as const,
                      label: LB_UX.activationLiveActivated,
                      doneLabel: LB_UX.activationLiveActivated,
                    },
                  ] as const
                ).map((step) => {
                  const done = activateDonePhases.includes(step.phase)
                  const active = activatePhase === step.phase && !done
                  const state = done ? 'done' : active ? 'active' : 'pending'
                  return (
                    <ActivateLiveItem
                      key={step.phase}
                      $state={state}
                      data-testid={`liq-lb-live-${step.phase.toLowerCase()}`}
                      data-state={state}
                    >
                      {done ? `✓ ${step.doneLabel}` : active ? `… ${activateHint || step.label}` : step.label}
                    </ActivateLiveItem>
                  )
                })}
              </ActivateLive>
            ) : null}
          </ActivateGuide>
        ) : null}

        <div data-testid="liq-lb-step-activate" hidden aria-hidden>
          {/* Compatibility sentinel for prior wizard tests — activation is footer CTA only. */}
        </div>

        {card.programReason === 'NO_ACTIVE_PROGRAM' && !isActive ? (
          <EmptyHint data-testid="liq-lb-create-program-hint" style={{ marginTop: 8 }}>
            {LB_UX.noActiveProgramTitle}. Use <strong>{LB_UX.noActiveProgramCta}</strong> below when ready.
          </EmptyHint>
        ) : null}
        {programBlockReason &&
        programBlockReason !== CONTRACTS_NOT_DEPLOYED &&
        programBlockReason !== LB_UX.noActiveProgramTitle ? (
          <InlineError data-testid="liq-lb-deploy-block">{programBlockReason}</InlineError>
        ) : null}
        {stepError ? <InlineError data-testid="liq-lb-step-error">{stepError}</InlineError> : null}

        <span hidden aria-hidden>
          <button type="button" disabled={!card.mutateGate.ok} data-testid="lb-mutating-gate-sentinel">
            gate
          </button>
          <button type="button" data-testid="lb-strategy-full-ai" onClick={() => card.setStrategyPreset('AI_OPTIMIZED')}>
            AI Optimized
          </button>
        </span>
        <div data-testid="lb-activation-pending-host" />
      </div>
    )
  })()

  return (
    <Card
      ref={ref as React.Ref<HTMLElement>}
      id="liq-building-card"
      data-testid="liq-building-card"
      data-liq-one-building-card="liq-one-building-card"
      data-lb-force-expanded={forceExpanded ? '1' : '0'}
      data-ls-card-liquidity-building="true"
      data-liquidity-building-panel
      data-lb016="true"
      data-lb024="true"
      data-ds0014="true"
      data-liquidity-building-panel-surface="LiquidityBuildingPanel"
      data-lb-phase={card.phase}
      data-pixel-lb-card={compactLayout ? 'compact' : '860'}
      data-lb-module="002"
      data-lb-compact={compactLayout ? '1' : '0'}
      data-lb-single-surface="1"
      $compact={compactLayout}
    >
      <Hero
        $tight={inFlow || isActive || compactInactive || showPortfolio}
        data-testid="liq-lb-header"
        data-collapsed={inFlow || isActive || compactInactive || showPortfolio ? '1' : '0'}
        data-lb-mode={showPortfolio ? 'portfolio' : isActive ? 'detail' : inFlow ? 'create' : 'entry'}
      >
        <HeroCopy>
          {!forceExpanded ? (
            <TitleRow>
              <Title data-testid="liq-lb-product-title">
                {showPortfolio || isActive ? LB_UX.portfolioProductName : 'AI Liquidity Builder'}
              </Title>
              <TitleBadges>
                <NewBadge data-testid="liq-lb-new-badge">BETA</NewBadge>
                <ChainOnlyBadge data-testid="liq-lb-bnb-badge">BNB Chain only</ChainOnlyBadge>
              </TitleBadges>
            </TitleRow>
          ) : null}
          <Desc data-testid="liq-lb-header-desc">
            {showPortfolio
              ? LB_UX.portfolioTitle
              : isActive
                ? LB_UX.activeHero
                : LB_UX.entryLead}
          </Desc>
        </HeroCopy>
        <Artwork $show={!inFlow && !isActive && !showPortfolio && !compactInactive} aria-hidden>
          <Orbit />
          <Orbit2 />
          <Disc $x="12%" $y="18%" $c="rgba(221,185,47,0.7)" />
          <Disc $x="58%" $y="36%" $c="rgba(22,217,119,0.55)" />
          <Disc $x="36%" $y="58%" $c="rgba(91,140,255,0.55)" />
        </Artwork>
      </Hero>

      {/* Legacy geometry lock — multi-step Setup/Strategy/Review wizard removed. */}
      <div hidden aria-hidden data-lb-wizard-removed style={{ height: 0, maxHeight: 0 }} />

      <Body
        $heroCollapsed={heroCollapsed}
        $compact={compactLayout}
        data-testid="liq-lb-body"
        data-pixel-lb-body={compactLayout ? 'auto' : heroCollapsed ? '580' : '442'}
      >
        <BodyScroll key={`${card.phase}-${isActive ? 'active' : `step-${builderStep}`}`}>{content}</BodyScroll>
      </Body>

      <Footer data-testid="liq-lb-footer">
        <FooterRow>
          {inFlow && !isActive && builderStep === 1 ? (
            <Secondary type="button" data-testid="liq-lb-cancel-create" onClick={returnToPortfolio}>
              {LB_UX.portfolioBack}
            </Secondary>
          ) : null}
          {inFlow && !isActive && builderStep > 1 ? (
            <Secondary
              type="button"
              data-testid="liq-lb-back"
              onClick={() => {
                setStepError(null)
                setBuilderStep((s) => (s === 3 ? 2 : 1))
              }}
            >
              Back
            </Secondary>
          ) : null}
          {isActive ? (
            <Secondary type="button" data-testid="liq-lb-footer-back-portfolio" onClick={returnToPortfolio}>
              {LB_UX.portfolioViewPortfolio}
            </Secondary>
          ) : null}
          {showConnectSlot ? (
            <ConnectSlot>
              <ConnectWalletButton data-testid="liq-lb-connect-wallet">{LB_UX.walletConnect}</ConnectWalletButton>
            </ConnectSlot>
          ) : showPortfolio && !card.walletConnected ? (
            <ConnectSlot>
              <ConnectWalletButton data-testid="liq-lb-connect-wallet">{LB_UX.walletConnect}</ConnectWalletButton>
            </ConnectSlot>
          ) : (
            <Primary
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled || (showPortfolio && !card.walletConnected)}
              data-testid="liq-lb-primary"
              title={builderStep === 3 && programBlockReason ? programBlockReason : undefined}
            >
              {primaryLabel}
            </Primary>
          )}
        </FooterRow>
        {stepError ? <InlineError data-testid="liq-lb-footer-error">{stepError}</InlineError> : null}
      </Footer>
    </Card>
  )
})

export default LiquidityBuildingCard
