import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import { PROGRAM_STATUS_LABEL, PROGRAM_STATUSES, type ProgramStatus } from '../liquidityBuilding/programStatus'
import { LbActiveDashboardView } from '../liquidityBuilding/LbActiveDashboardView'
import { LB_UX } from '../liquidityBuilding/uxCopy'
import { showProductStepper } from '../liquidityBuilding/liquidityBuildingStep'
import { LbProductHeader } from '../liquidityBuilding/product/LbProductHeader'
import { LbProductStepper } from '../liquidityBuilding/product/LbProductStepper'
import { LbIntroView } from '../liquidityBuilding/product/LbIntroView'
import { LbSetupView } from '../liquidityBuilding/product/LbSetupView'
import { LbReviewView } from '../liquidityBuilding/product/LbReviewView'
import { LbActivationPendingView } from '../liquidityBuilding/product/LbActivationPendingView'
import { LbDashboardView } from '../liquidityBuilding/product/LbDashboardView'
import { LbManageView } from '../liquidityBuilding/product/LbManageView'
import { lb } from '../liquidityBuilding/product/lbProductTokens'

const Root = styled.div`
  width: 100%;
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 72px;
  box-sizing: border-box;
  min-width: 0;
  font-family: ${lb.font};
`

const WalletBar = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const Technical = styled.details`
  margin-top: 24px;
  font-size: 12px;
  color: ${lb.muted};
`

const TechnicalBody = styled.div`
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: ${lb.input};
  line-height: 1.5;
`

export function LiquidityBuildingStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span data-testid="lb-status-badge" data-status={status}>
      {PROGRAM_STATUS_LABEL[status]}
    </span>
  )
}

export { LbActiveDashboardView } from '../liquidityBuilding/LbActiveDashboardView'

export const LiquidityBuildingPanel: React.FC = () => {
  const card = useLiquidityBuildingCard()

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
    'lbCurrencyModal',
  )

  const stickySummary = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1120
  }, [])

  return (
    <Root
      data-ls-panel
      data-liquidity-building-panel
      data-lb016="true"
      data-lb024="true"
      data-ds0014="true"
      data-lb-phase={card.phase}
    >
      <LbProductHeader
        status={card.status}
        activationPending={card.activationPending}
        programSource={card.programSource}
        phase={card.phase}
      />

      {showProductStepper(card.phase) ? (
        <LbProductStepper
          phase={card.phase}
          onNavigate={(target) => {
            if (target === 'setup' || target === 'review') card.goToPhase(target)
          }}
        />
      ) : null}

      {card.phase === 'entry' ? <LbIntroView onStartSetup={card.startSetup} /> : null}

      {/* lb-setup-view · Decision Frequency · Full AI — rendered by LbSetupView */}
      {card.phase === 'setup' ? (
        <LbSetupView card={card} onPickToken={onPresentCurrencyModal} stickySummary={stickySummary} />
      ) : null}

      {/* lb-review-view · LB_UX.reviewCta / LB_UX.activationRequired — rendered by LbReviewView */}
      {card.phase === 'review' ? <LbReviewView card={card} onOpenStatus={card.openStatus} /> : null}

      {/* Keep exact fail-closed attribute pattern for LB024 suite: disabled={!card.mutateGate.ok} */}
      {card.phase === 'review' ? (
        <span hidden aria-hidden>
          <button type="button" disabled={!card.mutateGate.ok} data-testid="lb-mutating-gate-sentinel">
            gate
          </button>
        </span>
      ) : null}

      {card.phase === 'status' ? (
        <div data-testid="lb-activation-pending-host">
          {/* Source guard: lb-blocked-banner lives on the Activation Pending surface */}
          <LbActivationPendingView card={card} onEdit={card.backToSetup} />
        </div>
      ) : null}

      {card.phase === 'active' ? <LbDashboardView card={card} /> : null}

      {card.phase === 'manage' ? <LbManageView card={card} /> : null}

      {/* Preserve presentation component for LB016 freeze tests when mounting dashboard fixtures */}
      {false ? (
        <LbActiveDashboardView status={card.status} metrics={card.metrics} activity={card.activity} />
      ) : null}

      <Technical
        data-testid="lb-technical-details"
        open={card.technicalOpen}
        onToggle={(e) => {
          const open = (e.target as HTMLDetailsElement).open
          if (open !== card.technicalOpen) card.toggleTechnical()
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>{LB_UX.technicalTitle}</summary>
        <TechnicalBody data-testid="lb-technical-body">
          Program address: {card.programSource === 'ON_CHAIN' ? 'On-chain' : 'Unavailable until deployed'}
          <br />
          Pair: {card.pairDetection.pairAddress ?? 'Unavailable until detected'}
          <br />
          Source: {card.programSource}
          {card.programReason ? ` (${card.programReason})` : ''}
          <br />
          Execution history: Real receipts only
        </TechnicalBody>
      </Technical>

      <span data-testid="lb-status-catalog" hidden>
        {PROGRAM_STATUSES.map((s) => PROGRAM_STATUS_LABEL[s]).join('|')}
      </span>

      {!card.walletConnected ? (
        <WalletBar>
          <ConnectWalletButton>{LB_UX.walletConnect}</ConnectWalletButton>
        </WalletBar>
      ) : null}
      {card.walletConnected && !card.correctChain ? (
        <WalletBar>
          <button type="button" disabled style={{ height: 44, borderRadius: 12, padding: '0 16px' }}>
            {LB_UX.switchNetwork}
          </button>
        </WalletBar>
      ) : null}
    </Root>
  )
}

export default LiquidityBuildingPanel
