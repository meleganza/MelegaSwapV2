import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { useCurrency } from 'hooks/Tokens'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import { EPOCH_OPTIONS, PROGRAM_STATUS_LABEL } from '../liquidityBuilding/programStatus'
import { LB_UX } from '../liquidityBuilding/uxCopy'
import { liqOne } from './onePageTokens'

const WIZARD_STEPS = ['Setup', 'Budget', 'Strategy', 'Review', 'Activate'] as const

/** Canonical MARCO — default suggestion only; Custom opens full token search. */
const MARCO_ADDR = MARCO_BSC_ADDRESS

const Card = styled.section`
  width: ${liqOne.col};
  max-width: 100%;
  height: ${liqOne.mainRowH};
  max-height: ${liqOne.mainRowH};
  box-sizing: border-box;
  padding: 0;
  border-radius: ${liqOne.cardRadius};
  border: 1px solid ${liqOne.goldBorder};
  background:
    radial-gradient(circle at 86% 12%, rgba(221, 185, 47, 0.14) 0%, rgba(221, 185, 47, 0.03) 34%, transparent 56%),
    ${liqOne.card};
  box-shadow:
    0 18px 48px rgba(0, 0, 0, 0.35),
    0 0 34px rgba(221, 185, 47, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${liqOne.font};

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

const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`

const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liqOne.gold};
`

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #111;
  background: ${liqOne.gold};
  border-radius: 999px;
  padding: 2px 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: ${liqOne.text};
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

const Wizard = styled.nav`
  flex: 0 0 ${liqOne.lbWizardH};
  height: ${liqOne.lbWizardH};
  max-height: ${liqOne.lbWizardH};
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  border-top: 1px solid ${liqOne.borderDefault};
  border-bottom: 1px solid ${liqOne.borderDefault};
  overflow: hidden;
  padding: 0 8px;

  @media (max-width: 1375px) {
    flex: 0 0 auto;
    height: auto;
    max-height: none;
    overflow: visible;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const StepBtn = styled.button<{ $active?: boolean; $done?: boolean }>`
  appearance: none;
  border: 0;
  background: transparent;
  height: 40px;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: default;
  color: ${({ $active, $done }) => ($active ? liqOne.gold : $done ? liqOne.text : liqOne.muted)};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 750 : 650)};
  font-family: ${liqOne.font};
  white-space: nowrap;
  min-width: 0;
`

const StepDot = styled.span<{ $active?: boolean; $done?: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
  color: ${({ $active, $done }) => ($active || $done ? '#111' : liqOne.muted)};
  background: ${({ $active, $done }) => ($active || $done ? liqOne.gold : '#1a1a1a')};
  border: 1px solid ${({ $active, $done }) => ($active || $done ? liqOne.gold : liqOne.borderStrong)};
`

const Body = styled.div<{ $heroCollapsed: boolean }>`
  flex: 0 0 ${({ $heroCollapsed }) => ($heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH)};
  height: ${({ $heroCollapsed }) => ($heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH)};
  max-height: ${({ $heroCollapsed }) => ($heroCollapsed ? liqOne.lbBodyHCollapsed : liqOne.lbBodyH)};
  overflow: hidden;
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

const ProgramBar = styled.div`
  flex: 0 0 ${liqOne.lbProgramH};
  height: ${liqOne.lbProgramH};
  max-height: ${liqOne.lbProgramH};
  margin: 0;
  padding: 0 ${liqOne.lbPadX};
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  border-bottom: 1px solid ${liqOne.borderDefault};
  background: ${liqOne.elevated};
`

const ProgramSelect = styled.select`
  appearance: none;
  border: 0;
  background: transparent;
  color: ${liqOne.text};
  font-size: 13px;
  font-weight: 700;
  font-family: ${liqOne.font};
  outline: none;
  cursor: pointer;
  min-width: 0;
  flex: 1;
  height: 100%;
`

const ActiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${liqOne.positive};
  box-shadow: 0 0 0 3px rgba(22, 217, 119, 0.15);
  flex-shrink: 0;
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

const Ghost = styled.button`
  appearance: none;
  height: 48px;
  min-width: 96px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${liqOne.borderStrong};
  background: transparent;
  color: ${liqOne.secondary};
  font-size: 13px;
  font-weight: 700;
  font-family: ${liqOne.font};
  cursor: pointer;
`

const TechStatus = styled.div`
  font-size: 11px;
  line-height: 14px;
  color: ${liqOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};
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

const ConnectSlot = styled.div`
  flex: 1;

  button,
  a {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
  }
`

/**
 * MODULE_002 — Fixed 672×860 Liquidity Building card.
 * Sections: Hero 210→72 · Wizard 48 · Content 442 · Footer 160.
 * Content replacement only — card height never changes on desktop.
 */
export const LiquidityBuildingCard = React.forwardRef<HTMLElement>(function LiquidityBuildingCard(_props, ref) {
  const card = useLiquidityBuildingCard()
  const [setupStarted, setSetupStarted] = useState(false)
  const [uiStep, setUiStep] = useState(0)
  const [programKey, setProgramKey] = useState('marco')
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const marco = useCurrency(MARCO_ADDR)
  const selectedProjectToken = useCurrency(card.draft.tokenAddress ?? undefined)

  const [onPresentCustomToken] = useModal(
    <CurrencySearchModal
      onCurrencySelect={(c: Currency) => {
        card.setToken(c)
        setSetupStarted(true)
        setUiStep(0)
      }}
      selectedCurrency={selectedProjectToken ?? undefined}
      showCommonBases
    />,
    true,
    true,
    'lb-custom-token-select',
  )

  const isActive = card.phase === 'active' || card.phase === 'manage'
  const inFlow = setupStarted || (card.phase !== 'entry' && !isActive)
  const heroCollapsed = inFlow || isActive

  const activeStep = useMemo(() => {
    if (isActive) return -1
    if (!inFlow) return -1
    if (card.phase === 'status') return 4
    if (card.phase === 'review') return 3
    if (card.phase === 'setup') return Math.min(uiStep, 2)
    if (card.phase === 'entry' && setupStarted) return uiStep
    return Math.min(uiStep, 4)
  }, [card.phase, inFlow, isActive, setupStarted, uiStep])

  const pickToken = useCallback(
    (currency: Currency | null | undefined) => {
      if (!currency) return
      card.setToken(currency)
      setSetupStarted(true)
      setUiStep(0)
    },
    [card],
  )

  const onStart = () => {
    card.startSetup()
    setSetupStarted(true)
    setUiStep(0)
  }

  const onCancel = () => {
    card.backToEntry()
    setSetupStarted(false)
    setUiStep(0)
    setAdvancedOpen(false)
  }

  const onBack = () => {
    if (card.phase === 'status') {
      card.backToSetup()
      setUiStep(2)
      return
    }
    if (card.phase === 'review') {
      card.goToPhase('setup')
      setUiStep(2)
      return
    }
    if (uiStep > 0) {
      setUiStep((s) => s - 1)
      return
    }
    onCancel()
  }

  const onContinue = () => {
    if (!inFlow) {
      onStart()
      return
    }
    if (activeStep <= 0) {
      setUiStep(1)
      if (card.phase === 'entry') card.startSetup()
      return
    }
    if (activeStep === 1) {
      setUiStep(2)
      return
    }
    if (activeStep === 2) {
      card.openReview()
      setUiStep(3)
      return
    }
    if (activeStep === 3) {
      card.openStatus()
      setUiStep(4)
      return
    }
    if (activeStep === 4) {
      if (!card.walletConnected) return
      card.requestDepositAndActivate()
    }
  }

  const primaryLabel = useMemo(() => {
    if (isActive) {
      if (card.status === 'PAUSED' || card.status === 'SAFETY_PAUSED') return 'Resume'
      return 'Pause'
    }
    if (!inFlow) return 'Set Up Liquidity Building'
    if (activeStep <= 0) return 'Continue to Budget'
    if (activeStep === 1) return 'Continue to Strategy'
    if (activeStep === 2) return 'Continue to Review'
    if (activeStep === 3) return 'Continue to Activate'
    if (!card.walletConnected) return 'Connect Wallet'
    if (card.status === 'AWAITING_APPROVAL') return 'Approve'
    if (card.status === 'AWAITING_DEPOSIT') return 'Deposit'
    return 'Activate'
  }, [activeStep, card.status, card.walletConnected, inFlow, isActive])

  const onPrimary = () => {
    if (isActive) {
      if (card.status === 'PAUSED' || card.status === 'SAFETY_PAUSED') card.resume()
      else card.pause()
      return
    }
    if (activeStep === 4 && !card.walletConnected) return
    onContinue()
  }

  const pair = card.pairDetection
  const techLine = [
    `Status: ${PROGRAM_STATUS_LABEL[card.status] ?? card.status}`,
    card.programSource === 'ON_CHAIN' ? 'Program: on-chain' : 'Program: unavailable',
    card.mutateGate.ok ? 'Gate: ready' : 'Gate: blocked',
  ].join(' · ')

  const showProgramBar = inFlow || isActive

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

    if (activeStep === 0) {
      return (
        <div data-testid="liq-lb-step-setup">
          <Field>
            Project Token
            <TokenRow>
              <TokenChip type="button" $on={card.draft.tokenSymbol === 'MARCO'} onClick={() => pickToken(marco)}>
                MARCO
              </TokenChip>
              <TokenChip
                type="button"
                $on={Boolean(card.draft.tokenSymbol && card.draft.tokenSymbol !== 'MARCO')}
                onClick={onPresentCustomToken}
                data-testid="lb-token-select"
                title="Search any supported project token (WBNB remains a quick suggestion via search)"
              >
                Custom / Search
              </TokenChip>
            </TokenRow>
            <MetaValue style={{ marginTop: 6 }}>{card.draft.tokenSymbol || 'Select a project token'}</MetaValue>
          </Field>
          <MetaGrid>
            <MetaCell>
              <MetaLabel>Quote Asset</MetaLabel>
              <MetaValue>{pair.quoteSymbol || 'WBNB'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>LP Owner</MetaLabel>
              <MetaValue>{card.account ? `${card.account.slice(0, 6)}…${card.account.slice(-4)}` : 'Wallet'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Detected Pair</MetaLabel>
              <MetaValue>
                {pair.available && card.draft.tokenSymbol
                  ? `${card.draft.tokenSymbol}/${pair.quoteSymbol}`
                  : 'Not detected'}
              </MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Detected Pool</MetaLabel>
              <MetaValue>{pair.available ? 'Melega V2' : 'Unavailable'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Router</MetaLabel>
              <MetaValue>Melega Router</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Factory</MetaLabel>
              <MetaValue>Melega Factory</MetaValue>
            </MetaCell>
          </MetaGrid>
          <MetaCell style={{ marginTop: 8 }}>
            <MetaLabel>Eligibility</MetaLabel>
            <MetaValue>{pair.available ? 'Eligible on Melega DEX' : 'Pair eligibility pending'}</MetaValue>
          </MetaCell>
          <Accordion>
            <summary>Learn More</summary>
            <AccordionBody>
              How the budget works and built-in protections are documented here so Setup stays compact. No CLAMM or tick
              range in V1.
            </AccordionBody>
          </Accordion>
        </div>
      )
    }

    if (activeStep === 1) {
      return (
        <div data-testid="liq-lb-step-budget">
          <Field>
            Token Budget
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={card.draft.tokenBudget}
              onChange={(e) => card.setBudget(e.target.value)}
            />
          </Field>
          <MetaGrid>
            <MetaCell>
              <MetaLabel>Balance</MetaLabel>
              <MetaValue>{card.walletBalanceLabel || '—'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Estimated LP</MetaLabel>
              <MetaValue>—</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Remaining Budget</MetaLabel>
              <MetaValue>{card.draft.tokenBudget || '—'}</MetaValue>
            </MetaCell>
          </MetaGrid>
        </div>
      )
    }

    if (activeStep === 2) {
      return (
        <div data-testid="liq-lb-step-strategy">
          <Field>
            Strategy
            <TokenRow>
              <TokenChip
                type="button"
                $on={card.draft.strategy === 'FULL_AI'}
                onClick={() => card.setStrategy('FULL_AI')}
              >
                Full AI
              </TokenChip>
            </TokenRow>
          </Field>
          <Field>
            Epoch
            <EpochRow>
              {EPOCH_OPTIONS.map((o) => (
                <TokenChip
                  key={o.seconds}
                  type="button"
                  $on={card.draft.epochSeconds === o.seconds}
                  onClick={() => card.setEpoch(o.seconds)}
                >
                  {o.seconds === 300 ? '5m' : o.seconds === 900 ? '15m' : o.seconds === 1800 ? '30m' : '1h'}
                </TokenChip>
              ))}
            </EpochRow>
          </Field>
          <Accordion
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary>Advanced</summary>
            <AccordionBody>Dynamic rate bounds and custom strategy modes stay collapsed for V1 defaults.</AccordionBody>
          </Accordion>
        </div>
      )
    }

    if (activeStep === 3) {
      return (
        <div data-testid="liq-lb-step-review">
          <MetaGrid>
            <MetaCell>
              <MetaLabel>Token</MetaLabel>
              <MetaValue>{card.draft.tokenSymbol || '—'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Budget</MetaLabel>
              <MetaValue>{card.draft.tokenBudget || '—'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Strategy</MetaLabel>
              <MetaValue>Full AI</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Epoch</MetaLabel>
              <MetaValue>{card.decisionFrequencyLabel}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>Quote</MetaLabel>
              <MetaValue>{pair.quoteSymbol || 'WBNB'}</MetaValue>
            </MetaCell>
            <MetaCell>
              <MetaLabel>LP Owner</MetaLabel>
              <MetaValue>{card.account ? `${card.account.slice(0, 6)}…` : 'Wallet'}</MetaValue>
            </MetaCell>
          </MetaGrid>
          <span hidden aria-hidden>
            <button type="button" disabled={!card.mutateGate.ok} data-testid="lb-mutating-gate-sentinel">
              gate
            </button>
          </span>
        </div>
      )
    }

    // Activate
    return (
      <div data-testid="liq-lb-step-activate">
        <EmptyHint>
          Next action only — complete the step shown in the footer. No duplicate Connect Wallet controls here.
        </EmptyHint>
        <MetaGrid>
          <MetaCell>
            <MetaLabel>Gate</MetaLabel>
            <MetaValue>{card.mutateGate.ok ? 'Ready' : 'Blocked'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Wallet</MetaLabel>
            <MetaValue>{card.walletConnected ? 'Connected' : 'Disconnected'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Chain</MetaLabel>
            <MetaValue>{card.correctChain ? 'BNB Smart Chain' : 'Switch network'}</MetaValue>
          </MetaCell>
          <MetaCell>
            <MetaLabel>Program</MetaLabel>
            <MetaValue>{card.programSource}</MetaValue>
          </MetaCell>
        </MetaGrid>
        <div data-testid="lb-activation-pending-host" />
      </div>
    )
  })()

  return (
    <Card
      ref={ref as React.Ref<HTMLElement>}
      id="liq-building-card"
      data-testid="liq-one-building-card"
      data-ls-card-liquidity-building="true"
      data-liquidity-building-panel
      data-lb016="true"
      data-lb024="true"
      data-ds0014="true"
      data-lb-phase={card.phase}
      data-pixel-lb-card="860"
      data-lb-module="002"
    >
      <Hero $collapsed={heroCollapsed} data-testid="liq-lb-header" data-collapsed={heroCollapsed ? '1' : '0'}>
        <HeroCopy>
          <EyebrowRow>
            <Eyebrow>AI-POWERED</Eyebrow>
            <Badge>RECOMMENDED</Badge>
          </EyebrowRow>
          <Title>Liquidity Building</Title>
          <Desc $collapsed={heroCollapsed}>
            Let Melega convert eligible project activity into LP liquidity over time — you keep ownership.
          </Desc>
          <Benefits $collapsed={heroCollapsed}>
            <Benefit>Budget-limited progressive LP</Benefit>
            <Benefit>You keep ownership of LP</Benefit>
            <Benefit>Pause or stop anytime</Benefit>
          </Benefits>
        </HeroCopy>
        <Artwork $collapsed={heroCollapsed} aria-hidden>
          <Orbit />
          <Orbit2 />
          <Disc $x="12%" $y="18%" $c="rgba(221,185,47,0.7)" />
          <Disc $x="58%" $y="36%" $c="rgba(22,217,119,0.55)" />
          <Disc $x="36%" $y="58%" $c="rgba(91,140,255,0.55)" />
        </Artwork>
      </Hero>

      {isActive ? (
        <Wizard data-testid="liq-lb-wizard" aria-label="Active program strip" style={{ gridTemplateColumns: '1fr auto' }}>
          <StepBtn type="button" $active style={{ justifyContent: 'flex-start', paddingLeft: 8 }}>
            <ActiveDot aria-hidden />
            ACTIVE · Dashboard
          </StepBtn>
          <StepBtn
            type="button"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              card.openManage()
            }}
          >
            Manage
          </StepBtn>
        </Wizard>
      ) : (
        <Wizard data-testid="liq-lb-wizard" aria-label="Liquidity Building steps">
          {WIZARD_STEPS.map((label, i) => (
            <StepBtn key={label} type="button" $active={activeStep === i} $done={activeStep > i}>
              <StepDot $active={activeStep === i} $done={activeStep > i}>
                {i + 1}
              </StepDot>
              {label}
            </StepBtn>
          ))}
        </Wizard>
      )}

      <Body
        $heroCollapsed={heroCollapsed}
        data-testid="liq-lb-body"
        data-pixel-lb-body={heroCollapsed ? '580' : '442'}
      >
        {showProgramBar ? (
          <ProgramBar data-testid="liq-lb-program-bar">
            {isActive ? <ActiveDot aria-hidden /> : null}
            <ProgramSelect
              aria-label="Program"
              value={programKey}
              onChange={(e) => setProgramKey(e.target.value)}
            >
              <option value="marco">MARCO</option>
              <option value="new">NEW PROGRAM</option>
            </ProgramSelect>
          </ProgramBar>
        ) : null}
        <BodyScroll key={`${programKey}-${activeStep}-${card.phase}`}>{content}</BodyScroll>
      </Body>

      <Footer data-testid="liq-lb-footer">
        <FooterRow>
          {inFlow && !isActive ? (
            <Ghost type="button" onClick={onBack}>
              {uiStep === 0 && card.phase !== 'review' && card.phase !== 'status' ? 'Cancel' : 'Back'}
            </Ghost>
          ) : null}
          {inFlow && !isActive && activeStep > 0 ? (
            <Ghost type="button" onClick={onCancel}>
              Cancel
            </Ghost>
          ) : null}
          {activeStep === 4 && !card.walletConnected && !isActive ? (
            <ConnectSlot>
              <ConnectWalletButton>{LB_UX.walletConnect}</ConnectWalletButton>
            </ConnectSlot>
          ) : (
            <Primary type="button" onClick={onPrimary} disabled={activeStep === 3 && !card.draft.tokenSymbol}>
              {primaryLabel}
            </Primary>
          )}
        </FooterRow>
        <TechStatus title={techLine}>{techLine}</TechStatus>
      </Footer>
    </Card>
  )
})

export default LiquidityBuildingCard
