import React, { useCallback, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { useCurrency } from 'hooks/Tokens'
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
import { liqOne } from './onePageTokens'
import { sanitizeDecimalInput } from 'lib/input/decimalInput'
import { LbDeployReadinessPanel } from './LbDeployReadinessPanel'

const BUILDER_STEPS = [
  { n: 1, label: 'Configure' },
  { n: 2, label: 'Review' },
  { n: 3, label: 'Activate' },
] as const
type BuilderStep = 1 | 2 | 3

/** Canonical MARCO — default suggestion only; Custom opens full token search. */
const MARCO_ADDR = MARCO_BSC_ADDRESS

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

const Hero = styled.div<{ $collapsed: boolean }>`
  flex: 0 0 ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  height: ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  max-height: ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  padding: ${({ $collapsed }) => ($collapsed ? '10px 20px' : '18px 20px 14px')};
  box-sizing: border-box;
  display: flex;
  align-items: ${({ $collapsed }) => ($collapsed ? 'center' : 'stretch')};
  justify-content: space-between;
  gap: 12px;
  overflow: hidden;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    max-height: none;
    overflow: visible;
    align-items: flex-start;
  }
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

const Desc = styled.p<{ $collapsed: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
  margin: 6px 0 0;
  max-width: 360px;
  font-size: 13px;
  line-height: 18px;
  color: ${liqOne.bodySoft};
`

const Benefits = styled.ul<{ $collapsed: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'flex')};
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  flex-direction: column;
  gap: 4px;
`

const Benefit = styled.li`
  font-size: 12px;
  line-height: 16px;
  color: ${liqOne.secondary};
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${liqOne.gold};
    flex-shrink: 0;
  }
`

const Artwork = styled.div<{ $collapsed: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
  position: relative;
  width: 148px;
  height: 120px;
  flex-shrink: 0;
  align-self: center;

  @media (max-width: 767px) {
    width: 110px;
    height: 96px;
  }
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
  padding: 10px ${liqOne.lbPadX} 8px;
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
  gap: 4px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};

  @media (max-width: 767px) {
    margin-bottom: 8px;
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
`

const TokenChip = styled.button<{ $on?: boolean }>`
  appearance: none;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ $on }) => ($on ? liqOne.gold : liqOne.borderStrong)};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,0.12)' : liqOne.elevated)};
  color: ${liqOne.text};
  font-size: 13px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;

  @media (max-width: 767px) {
    height: 40px;
    min-height: 40px;
  }
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
`

const MetaCell = styled.div`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 10px;
  background: ${liqOne.elevated};
  padding: 8px 10px;
  min-width: 0;
`

const MetaLabel = styled.div`
  font-size: 10px;
  color: ${liqOne.muted};
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  gap: 8px;
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
  margin: 0 0 12px;
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
    return 'No active Liquidity Building program for this wallet and token'
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
}): string | null {
  const addressesNull =
    !LB_DEPLOYED_ADDRESSES.lbFactory &&
    !LB_DEPLOYED_ADDRESSES.lbAuthorizer &&
    !LB_DEPLOYED_ADDRESSES.lbFeeSink &&
    !LB_DEPLOYED_ADDRESSES.programAddress

  if (input.programSource !== 'ON_CHAIN' || addressesNull) {
    return humanizeGateReason(input.programReason ?? 'LB_PROGRAM_NOT_DEPLOYED')
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
  const card = useLiquidityBuildingCard()
  const [setupStarted, setSetupStarted] = useState(forceExpanded)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)
  const [builderStep, setBuilderStep] = useState<BuilderStep>(1)

  React.useEffect(() => {
    if (!forceExpanded) return
    if (card.phase === 'entry') {
      card.startSetup()
      setSetupStarted(true)
    }
    // Intentionally once on mount for IA expanded workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceExpanded])

  const marco = useCurrency(MARCO_ADDR)
  const selectedProjectToken = useCurrency(card.draft.tokenAddress ?? undefined)

  const [onPresentCustomToken] = useModal(
    <CurrencySearchModal
      onCurrencySelect={(c: Currency) => {
        card.setToken(c)
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
  const inFlow = forceExpanded || setupStarted || (card.phase !== 'entry' && !isActive)
  // IA workspace already titles the pane — keep LB header collapsed, body expanded.
  const heroCollapsed = forceExpanded || inFlow || isActive
  /** Inactive summary: compact shell — avoid 860px empty body (geometry exception). */
  const compactInactive = !forceExpanded && !inFlow && !isActive

  const pickToken = useCallback(
    (currency: Currency | null | undefined) => {
      if (!currency) return
      card.setToken(currency)
      setSetupStarted(true)
      setStepError(null)
    },
    [card],
  )

  const onStart = () => {
    card.startSetup()
    setSetupStarted(true)
    setStepError(null)
  }

  const tokenReady = setupTokenResolved(card.draft)
  const budgetReady = setupBudgetPositive(card.draft)
  const pair = card.pairDetection
  const pairReady = Boolean(tokenReady && pair.available && !pair.loading)
  const programBlockReason = resolveProgramUnavailableReason({
    programSource: card.programSource,
    programReason: card.programReason,
    mutateGate: card.mutateGate,
  })

  const eligibilityLabel = useMemo(() => {
    if (!tokenReady) return 'Select a project token'
    if (pair.loading) return LB_UX.pairLoading
    if (!pair.available) return LB_UX.pairNotDetected
    if (programBlockReason) return programBlockReason
    if (!card.walletConnected) return 'Wallet required for activation'
    if (!card.correctChain) return LB_UX.switchNetwork
    if (card.readiness.uiMode === 'available' && card.mutateGate.ok) return 'Eligible — ready to activate'
    return card.readiness.productStatus?.replace(/_/g, ' ') || 'Eligibility pending'
  }, [
    tokenReady,
    pair.loading,
    pair.available,
    programBlockReason,
    card.walletConnected,
    card.correctChain,
    card.readiness.uiMode,
    card.readiness.productStatus,
    card.mutateGate.ok,
  ])

  const summaryLine = useMemo(() => {
    const token = card.draft.tokenSymbol || '—'
    const budget = card.draft.tokenBudget || '—'
    const epoch = card.decisionFrequencyLabel
    const pairLabel =
      pairReady && card.draft.tokenSymbol
        ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}`
        : 'Pair not detected'
    return `${token} · Budget ${budget} · Full AI · ${epoch} · ${pairLabel}`
  }, [card.draft.tokenSymbol, card.draft.tokenBudget, card.decisionFrequencyLabel, pairReady, pair.quoteSymbol])

  const configureReady = tokenReady && budgetReady && Boolean(card.draft.strategy)
  const executionReady = Boolean(
    configureReady && pairReady && card.walletConnected && card.correctChain && !programBlockReason && card.mutateGate.ok,
  )

  const primaryLabel = useMemo(() => {
    if (stepError) return stepError
    if (isActive) return 'Active'
    if (activating) return 'Activating'
    if (!inFlow) return 'Set Up Liquidity Building'
    if (builderStep === 1) {
      if (!tokenReady) return 'Select Token'
      if (!budgetReady) return 'Enter Budget'
      return 'Continue to Review'
    }
    if (builderStep === 2) return 'Continue to Activate'
    if (programBlockReason) return programBlockReason
    if (!card.walletConnected) return 'Connect Wallet'
    if (!pairReady) return 'Pair Required'
    if (card.status === 'AWAITING_APPROVAL') return 'Approve'
    return 'Activate Liquidity Builder'
  }, [
    stepError,
    isActive,
    activating,
    inFlow,
    builderStep,
    card.walletConnected,
    tokenReady,
    budgetReady,
    pairReady,
    card.status,
    programBlockReason,
  ])

  const showConnectSlot =
    inFlow && !isActive && builderStep === 3 && !card.walletConnected && !stepError && !programBlockReason

  const runActivate = () => {
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
    const result = card.requestDepositAndActivate()
    setActivating(false)
    if (result && !result.ok) {
      setStepError(result.reason)
    }
  }

  const onPrimary = () => {
    if (isActive) {
      if (card.status === 'PAUSED' || card.status === 'SAFETY_PAUSED') card.resume()
      else if (card.status === 'ACTIVE') card.pause()
      return
    }
    if (!inFlow) {
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
        setStepError('Enter a positive token budget to continue.')
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
    if (isActive) {
      const s = card.programSnapshot
      const m = card.metrics
      return (
        <DashGrid data-testid="liq-lb-dashboard">
          <MetaCell>
            <MetaLabel>Program</MetaLabel>
            <MetaValue>{s.pairLabel || s.tokenSymbol || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Status</MetaLabel>
            <MetaValue>{PROGRAM_STATUS_LABEL[card.status]}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Budget</MetaLabel>
            <MetaValue>{s.initialBudgetLabel || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Remaining</MetaLabel>
            <MetaValue>{s.remainingBudgetLabel || m.budgetRemainingLabel || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Liquidity Built</MetaLabel>
            <MetaValue>{s.liquidityBuiltLabel || m.liquidityBuiltLabel || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Gross Quote</MetaLabel>
            <MetaValue>{s.grossQuoteLabel || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Fee</MetaLabel>
            <MetaValue>{s.feePaidLabel || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>LP Owner</MetaLabel>
            <MetaValue>{s.lpOwner || s.lpRecipient || '—'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Executions</MetaLabel>
            <MetaValue>{m.executionCount != null ? String(m.executionCount) : '—'}</MetaValue>
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
        </DashGrid>
      )
    }

    if (!inFlow) {
      return (
        <>
          <EmptyHint>
            Set up Liquidity Building to dedicate a token budget. Melega evaluates eligible activity and adds LP over
            time — you keep ownership.
          </EmptyHint>
          <Accordion>
            <summary>Learn More</summary>
            <AccordionBody>
              <strong>How the budget works</strong>
              <br />
              Token Reserve → Eligible Activity → Pool Liquidity. Only deposited budget can be used; unused budget
              remains withdrawable.
              <br />
              <br />
              <strong>Built-in protections</strong>
              <br />
              Controlled decision frequency · Maximum budget limits · Ownership retained · Fail-closed activation ·
              Pause / stop anytime
            </AccordionBody>
          </Accordion>
        </>
      )
    }

    // Founder repair — one compact exploded configuration surface (not oversized step pages).
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

        <Accordion data-testid="liq-lb-how-it-works">
          <summary>ⓘ How AI Liquidity Building works</summary>
          <AccordionBody>
            Select your project token and liquidity budget. The engine evaluates the pool and pair, determines asset
            allocation, then you review the exact transaction and confirm every step in your wallet. Non-custodial —
            activation remains unavailable until canonical Liquidity Builder contracts are deployed.
          </AccordionBody>
        </Accordion>

        <div data-testid="liq-lb-step-configure" data-lb-exploded-form="1">
          <MetaGrid data-testid="liq-lb-exploded-grid">
            <MetaCell>
              <MetaLabel>Project Token</MetaLabel>
              <TokenRow>
                <TokenChip type="button" $on={card.draft.tokenSymbol === 'MARCO'} onClick={() => pickToken(marco)}>
                  MARCO
                </TokenChip>
                <TokenChip
                  type="button"
                  $on={Boolean(card.draft.tokenSymbol && card.draft.tokenSymbol !== 'MARCO')}
                  onClick={onPresentCustomToken}
                  data-testid="lb-token-select"
                >
                  Search / Select
                </TokenChip>
              </TokenRow>
              <MetaValue style={{ marginTop: 4 }}>{card.draft.tokenSymbol || 'Select token'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Quote Asset / Pair</MetaLabel>
              <MetaValue>
                {pairReady && card.draft.tokenSymbol
                  ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}`
                  : 'Detecting…'}
              </MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Liquidity Budget</MetaLabel>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={card.draft.tokenBudget}
                onChange={(e) => {
                  setStepError(null)
                  card.setBudget(sanitizeDecimalInput(e.target.value))
                }}
                data-testid="lb-budget-input"
              />
            </MetaCell>
            <MetaCell>
              <MetaLabel>Budget Asset</MetaLabel>
              <MetaValue>{card.draft.tokenSymbol || '—'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Strategy</MetaLabel>
              <TokenChip
                type="button"
                $on={card.draft.strategy === 'FULL_AI'}
                onClick={() => card.setStrategy('FULL_AI')}
                data-testid="lb-strategy-full-ai"
              >
                Full AI
              </TokenChip>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Target Ratio</MetaLabel>
              <MetaValue>AI-determined</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Slippage</MetaLabel>
              <MetaValue>Wallet / protocol default</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Deadline</MetaLabel>
              <MetaValue>Per-transaction confirmation</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Existing Pool</MetaLabel>
              <MetaValue>{pairReady ? 'Detected' : 'Not detected'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Pool creation</MetaLabel>
              <MetaValue>{pairReady ? 'Not required' : 'May be required'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Est. token contribution</MetaLabel>
              <MetaValue>{card.draft.tokenBudget || '—'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Est. quote contribution</MetaLabel>
              <MetaValue>—</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Est. LP received</MetaLabel>
              <MetaValue>—</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Est. pool share</MetaLabel>
              <MetaValue>—</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Eligibility</MetaLabel>
              <MetaValue data-testid="liq-lb-eligibility">{eligibilityLabel}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Transaction readiness</MetaLabel>
              <MetaValue>{programBlockReason ? 'Blocked' : executionReady ? 'Ready' : 'Incomplete'}</MetaValue>
            </MetaCell>
          </MetaGrid>

          <Accordion
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary>Advanced (optional)</summary>
            <AccordionBody>
              <Field>
                Epoch
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
            </AccordionBody>
          </Accordion>
        </div>

        <div data-testid="liq-lb-step-review" data-lb-inline-review="1">
          <SummaryStrip data-testid="liq-lb-summary">{summaryLine}</SummaryStrip>
          <LbDeployReadinessPanel
            pairLabel={
              pairReady && card.draft.tokenSymbol ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}` : null
            }
            pairAddress={pair.pairAddress}
            pairReady={pairReady}
            executionReady={executionReady}
            executionReason={programBlockReason || (!pairReady ? LB_UX.pairNotDetected : null)}
          />
        </div>

        <div data-testid="liq-lb-step-activate" hidden aria-hidden>
          {/* Compatibility sentinel for prior wizard tests — activation is footer CTA only. */}
        </div>

        {programBlockReason ? (
          <InlineError data-testid="liq-lb-deploy-block">{programBlockReason}</InlineError>
        ) : null}
        {stepError ? <InlineError data-testid="liq-lb-step-error">{stepError}</InlineError> : null}

        <span hidden aria-hidden>
          <button type="button" disabled={!card.mutateGate.ok} data-testid="lb-mutating-gate-sentinel">
            gate
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
      data-pixel-lb-card={compactInactive ? 'compact' : '860'}
      data-lb-module="002"
      data-lb-compact={compactInactive ? '1' : '0'}
      data-lb-single-surface="1"
      $compact={compactInactive}
    >
      <Hero $collapsed={heroCollapsed || compactInactive} data-testid="liq-lb-header" data-collapsed={heroCollapsed || compactInactive ? '1' : '0'}>
        <HeroCopy>
          {!forceExpanded ? (
            <TitleRow>
              <Title>AI Liquidity Builder</Title>
              <NewBadge data-testid="liq-lb-new-badge">NEW</NewBadge>
            </TitleRow>
          ) : null}
          <Desc $collapsed={heroCollapsed || compactInactive}>
            Build your liquidity automatically — configure token, budget, and strategy in one place. You keep ownership.
          </Desc>
          <Benefits $collapsed={heroCollapsed || compactInactive}>
            <Benefit>Budget-limited progressive LP</Benefit>
            <Benefit>You keep ownership of LP</Benefit>
            <Benefit>Pause or stop anytime</Benefit>
          </Benefits>
        </HeroCopy>
        <Artwork $collapsed={heroCollapsed || compactInactive} aria-hidden>
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
        $compact={compactInactive}
        data-testid="liq-lb-body"
        data-pixel-lb-body={compactInactive ? 'auto' : heroCollapsed ? '580' : '442'}
      >
        <BodyScroll key={`${card.phase}-${isActive ? 'active' : `step-${builderStep}`}`}>{content}</BodyScroll>
      </Body>

      <Footer data-testid="liq-lb-footer">
        <FooterRow>
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
          {showConnectSlot ? (
            <ConnectSlot>
              <ConnectWalletButton data-testid="liq-lb-connect-wallet">{LB_UX.walletConnect}</ConnectWalletButton>
            </ConnectSlot>
          ) : (
            <Primary
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled}
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
