import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { X } from 'lucide-react'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import { LbSetupView } from '../liquidityBuilding/product/LbSetupView'
import { LbReviewView } from '../liquidityBuilding/product/LbReviewView'
import { LbActivationPendingView } from '../liquidityBuilding/product/LbActivationPendingView'
import { LbDashboardView } from '../liquidityBuilding/product/LbDashboardView'
import { LbManageView } from '../liquidityBuilding/product/LbManageView'
import { LbIntroView } from '../liquidityBuilding/product/LbIntroView'
import { LB_UX } from '../liquidityBuilding/uxCopy'
import { liqOne } from './onePageTokens'

const WIZARD_STEPS = ['Setup', 'Budget', 'Strategy', 'Review', 'Activate'] as const

const Card = styled.section`
  width: ${liqOne.col};
  max-width: 100%;
  height: ${liqOne.mainRowH};
  min-height: ${liqOne.mainRowH};
  max-height: ${liqOne.mainRowH};
  box-sizing: border-box;
  padding: ${liqOne.lbPadY} 20px;
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
    min-height: 0;
    max-height: none;
  }
`

const Header = styled.div<{ $collapsed: boolean }>`
  flex: 0 0 ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  height: ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  min-height: ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  max-height: ${({ $collapsed }) => ($collapsed ? liqOne.lbHeaderCollapsed : liqOne.lbHeaderExpanded)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  overflow: hidden;
  box-sizing: border-box;
`

const HeaderCopy = styled.div`
  min-width: 0;
  flex: 1;
`

const EyebrowRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
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
  margin: 4px 0 0;
  max-width: 340px;
  font-size: 13px;
  line-height: 18px;
  color: ${liqOne.bodySoft};
`

const Artwork = styled.div<{ $collapsed: boolean }>`
  display: ${({ $collapsed }) => ($collapsed ? 'none' : 'block')};
  position: relative;
  width: 148px;
  height: 96px;
  flex-shrink: 0;
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
  min-height: ${liqOne.lbWizardH};
  max-height: ${liqOne.lbWizardH};
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  border-top: 1px solid ${liqOne.borderDefault};
  border-bottom: 1px solid ${liqOne.borderDefault};
  overflow: hidden;
`

const StepBtn = styled.button<{ $active?: boolean; $done?: boolean }>`
  appearance: none;
  border: 0;
  background: transparent;
  height: 40px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: default;
  color: ${({ $active, $done }) => ($active ? liqOne.gold : $done ? liqOne.text : liqOne.muted)};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 750 : 650)};
  font-family: ${liqOne.font};
`

const StepDot = styled.span<{ $active?: boolean; $done?: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 800;
  color: ${({ $active, $done }) => ($active || $done ? '#111' : liqOne.muted)};
  background: ${({ $active, $done }) => ($active || $done ? liqOne.gold : '#1a1a1a')};
  border: 1px solid ${({ $active, $done }) => ($active || $done ? liqOne.gold : liqOne.borderStrong)};
`

const Body = styled.div`
  flex: 0 0 ${liqOne.lbBodyH};
  height: ${liqOne.lbBodyH};
  min-height: ${liqOne.lbBodyH};
  max-height: ${liqOne.lbBodyH};
  overflow: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 10px 0 8px;

  /* Constrain nested product views so they cannot grow the card */
  & > * {
    max-width: 100% !important;
    margin: 0 !important;
  }
`

const ProgramBar = styled.div`
  height: 48px;
  min-height: 48px;
  max-height: 48px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${liqOne.borderDefault};
  background: ${liqOne.elevated};
  box-sizing: border-box;
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
`

const ActiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${liqOne.positive};
  box-shadow: 0 0 0 3px rgba(22, 217, 119, 0.15);
`

const Footer = styled.div`
  flex: 0 0 ${liqOne.lbFooterH};
  height: ${liqOne.lbFooterH};
  min-height: ${liqOne.lbFooterH};
  max-height: ${liqOne.lbFooterH};
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  padding-top: 8px;
  overflow: hidden;
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

const CloseBtn = styled.button`
  appearance: none;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: ${liqOne.muted};
  display: grid;
  place-items: center;
  cursor: pointer;
`

const ManageTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 750;
  color: ${liqOne.text};
`

/**
 * Fixed 860×672 Liquidity Building card.
 * Wizard replaces body content only — card height never changes.
 * Product lifecycle via useLiquidityBuildingCard (same authority as LiquidityBuildingPanel).
 */
export const LiquidityBuildingCard = React.forwardRef<HTMLElement>(function LiquidityBuildingCard(_props, ref) {
  const card = useLiquidityBuildingCard()
  const [wizardOpen, setWizardOpen] = useState(true)
  const [uiStep, setUiStep] = useState(0)

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      card.setToken(currency)
    },
    [card],
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={card.selectedCurrency ?? undefined}
      otherSelectedCurrency={undefined}
      showCommonBases
      commonBasesType="LIQUIDITY"
    />,
    true,
    false,
    'lbCurrencyModalPixel',
  )

  const isActive = card.phase === 'active' || card.phase === 'manage'
  const showWizardChrome = wizardOpen && !isActive
  const headerCollapsed = showWizardChrome && (card.phase !== 'entry' || uiStep > 0)

  // Sync UI step from product phase when phase jumps
  const phaseStep = useMemo(() => {
    switch (card.phase) {
      case 'entry':
        return 0
      case 'setup':
        return Math.min(uiStep, 2)
      case 'review':
        return 3
      case 'status':
        return 4
      default:
        return 0
    }
  }, [card.phase, uiStep])

  const activeStep = isActive ? -1 : phaseStep

  const continueLabel = useMemo(() => {
    if (card.phase === 'entry') return 'Start setup'
    if (activeStep <= 0) return 'Continue to Budget →'
    if (activeStep === 1) return 'Continue to Strategy →'
    if (activeStep === 2) return 'Continue to Review →'
    if (activeStep === 3) return 'Continue to Activate →'
    return 'Done'
  }, [activeStep, card.phase])

  const onContinue = () => {
    if (card.phase === 'entry') {
      card.startSetup()
      setUiStep(0)
      setWizardOpen(true)
      return
    }
    if (card.phase === 'setup') {
      if (uiStep < 2) {
        setUiStep((s) => s + 1)
        return
      }
      card.goToPhase('review')
      setUiStep(3)
      return
    }
    if (card.phase === 'review') {
      card.openStatus()
      setUiStep(4)
    }
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
    if (card.phase === 'setup' && uiStep > 0) {
      setUiStep((s) => s - 1)
    }
  }

  const onCancel = () => {
    setWizardOpen(false)
    setUiStep(0)
  }

  const body = (() => {
    if (isActive) {
      return (
        <>
          <ProgramBar>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
              <ActiveDot aria-hidden />
              <ProgramSelect aria-label="Current Program" defaultValue="marco">
                <option value="marco">Current Program · MARCO / WBNB</option>
              </ProgramSelect>
            </div>
            <Ghost
              type="button"
              style={{ minWidth: 84, height: 36 }}
              onClick={() => {
                card.goToPhase('manage')
                setWizardOpen(true)
              }}
            >
              Manage
            </Ghost>
          </ProgramBar>
          {card.phase === 'manage' ? <LbManageView card={card} /> : <LbDashboardView card={card} />}
        </>
      )
    }

    if (!showWizardChrome && card.phase === 'entry') {
      return <LbIntroView onStartSetup={card.startSetup} />
    }

    return (
      <>
        <ManageTitle>
          <span>Manage Liquidity Building</span>
          <CloseBtn type="button" aria-label="Close wizard" onClick={onCancel}>
            <X size={16} />
          </CloseBtn>
        </ManageTitle>
        <ProgramBar>
          <ProgramSelect aria-label="Current Program" defaultValue="marco">
            <option value="marco">Current Program · MARCO</option>
          </ProgramSelect>
        </ProgramBar>
        {card.phase === 'entry' ? <LbIntroView onStartSetup={card.startSetup} /> : null}
        {card.phase === 'setup' ? (
          <LbSetupView card={card} onPickToken={onPresentCurrencyModal} stickySummary={false} />
        ) : null}
        {card.phase === 'review' ? <LbReviewView card={card} onOpenStatus={card.openStatus} /> : null}
        {card.phase === 'status' ? (
          <div data-testid="lb-activation-pending-host">
            <LbActivationPendingView card={card} onEdit={card.backToSetup} />
          </div>
        ) : null}
        {card.phase === 'review' ? (
          <span hidden aria-hidden>
            <button type="button" disabled={!card.mutateGate.ok} data-testid="lb-mutating-gate-sentinel">
              gate
            </button>
          </span>
        ) : null}
      </>
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
    >
      <Header $collapsed={headerCollapsed} data-testid="liq-lb-header" data-collapsed={headerCollapsed ? '1' : '0'}>
        <HeaderCopy>
          <EyebrowRow>
            <Eyebrow>AI-POWERED</Eyebrow>
            <Badge>RECOMMENDED</Badge>
          </EyebrowRow>
          <Title>Liquidity Building</Title>
          <Desc $collapsed={headerCollapsed}>
            Let Melega convert eligible project activity into LP liquidity over time — you keep ownership.
          </Desc>
        </HeaderCopy>
        <Artwork $collapsed={headerCollapsed} aria-hidden>
          <Orbit />
          <Orbit2 />
          <Disc $x="12%" $y="18%" $c="rgba(221,185,47,0.7)" />
          <Disc $x="58%" $y="36%" $c="rgba(22,217,119,0.55)" />
          <Disc $x="36%" $y="58%" $c="rgba(91,140,255,0.55)" />
        </Artwork>
      </Header>

      {isActive ? (
        <Wizard data-testid="liq-lb-wizard" aria-label="Active program strip" style={{ gridTemplateColumns: '1fr auto' }}>
          <StepBtn type="button" $active style={{ justifyContent: 'flex-start', paddingLeft: 8 }}>
            <ActiveDot aria-hidden />
            ACTIVE · Program dashboard
          </StepBtn>
          <StepBtn
            type="button"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              card.goToPhase('manage')
              setWizardOpen(true)
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

      <Body data-testid="liq-lb-body" data-pixel-lb-body="540">
        {body}
        {!card.walletConnected ? (
          <div style={{ marginTop: 12 }}>
            <ConnectWalletButton>{LB_UX.walletConnect}</ConnectWalletButton>
          </div>
        ) : null}
      </Body>

      <Footer data-testid="liq-lb-footer">
        {showWizardChrome && card.phase !== 'entry' ? (
          <Ghost type="button" onClick={onBack}>
            Back
          </Ghost>
        ) : null}
        {showWizardChrome ? (
          <Ghost type="button" onClick={onCancel}>
            Cancel
          </Ghost>
        ) : null}
        <Primary type="button" onClick={isActive ? () => setWizardOpen(true) : onContinue}>
          {isActive ? 'Open wizard' : continueLabel}
        </Primary>
      </Footer>
    </Card>
  )
})

export default LiquidityBuildingCard
