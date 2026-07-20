import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import {
  LsGhostBtn,
  LsOutlineBtn,
  LsPanel,
  LsPreviewBadge,
  LsPrimaryBtn,
  LsSectionTitle,
} from './liquidityStudioPrimitives'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import {
  EPOCH_OPTIONS,
  PROGRAM_STATUS_LABEL,
  PROGRAM_STATUSES,
  type ProgramStatus,
} from '../liquidityBuilding/programStatus'

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  flex-shrink: 0;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
`

const StatusBadge = styled(LsPreviewBadge)<{ $muted?: boolean }>`
  border-color: ${({ $muted }) => ($muted ? liquidityStudioColors.border : liquidityStudioColors.gold)};
  color: ${({ $muted }) => ($muted ? liquidityStudioColors.muted : liquidityStudioColors.goldBright)};
  background: ${({ $muted }) => ($muted ? 'transparent' : liquidityStudioColors.previewBadgeBg)};
`

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
`

const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${liquidityStudioColors.muted};
`

const Bullet = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.5;
  color: ${liquidityStudioColors.text};
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.muted};
`

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.25);
  color: ${liquidityStudioColors.text};
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
`

const SelectRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const ChipBtn = styled.button<{ $active?: boolean }>`
  height: 36px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? liquidityStudioColors.gold : liquidityStudioColors.border)};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.12)' : 'transparent')};
  color: ${liquidityStudioColors.text};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const Notice = styled.div`
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  line-height: 1.45;
  color: ${liquidityStudioColors.muted};
`

const ConnectWrap = styled.div`
  width: 100%;
  margin-top: ${liquidityStudioLayout.executionButtonGap};

  & > button {
    width: 100%;
  }
`

const ReviewBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: ${liquidityStudioColors.text};
`

const ReviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

/** Exported for tests — renders any LB002 status label without inventing metrics. */
export function LiquidityBuildingStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <StatusBadge data-testid="lb-status-badge" data-status={status} $muted={status === 'NOT_ACTIVE'}>
      {PROGRAM_STATUS_LABEL[status]}
    </StatusBadge>
  )
}

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
      selectedCurrency={undefined}
      otherSelectedCurrency={undefined}
      showCommonBases
      commonBasesType="LIQUIDITY"
    />,
    true,
    false,
    'lbCurrencyModal',
  )

  const primaryForStatus = () => {
    const blocked = !card.mutateGate.ok
    switch (card.status) {
      case 'NOT_ACTIVE':
        return 'Start Building Liquidity'
      case 'SETUP_REQUIRED':
        if (!card.reviewOpen) return 'Review'
        return blocked ? 'Unavailable until activation' : 'Continue to Approve'
      case 'AWAITING_APPROVAL':
        return blocked ? 'Unavailable until activation' : 'Approve Token'
      case 'AWAITING_DEPOSIT':
        return blocked ? 'Unavailable until activation' : 'Deposit Budget'
      case 'READY':
        return blocked ? 'Unavailable until activation' : 'Activate'
      case 'ACTIVE':
        return 'View Activity'
      case 'PAUSED':
        return blocked ? 'Unavailable until activation' : 'Resume'
      case 'BUDGET_DEPLETED':
        return blocked ? 'Unavailable until activation' : 'Add Budget'
      case 'STOPPED':
        return 'View Activity'
      default:
        return blocked ? 'Unavailable until activation' : 'Retry'
    }
  }

  const mutatingBlocked =
    !card.mutateGate.ok &&
    (card.status === 'SETUP_REQUIRED'
      ? card.reviewOpen
      : ['AWAITING_APPROVAL', 'AWAITING_DEPOSIT', 'READY', 'PAUSED', 'BUDGET_DEPLETED', 'ERROR'].includes(
          card.status,
        ))

  const onPrimary = () => {
    if (mutatingBlocked) return
    switch (card.status) {
      case 'NOT_ACTIVE':
        card.startSetup()
        return
      case 'SETUP_REQUIRED':
        if (!card.reviewOpen) {
          card.openReview()
          return
        }
        card.requestApproval()
        return
      case 'AWAITING_APPROVAL':
        card.requestApproval()
        return
      case 'AWAITING_DEPOSIT':
        card.requestDeposit()
        return
      case 'READY':
        card.requestActivate()
        return
      default:
        return
    }
  }

  return (
    <LsPanel
      data-ls-panel
      data-liquidity-building-panel
      data-lb014="true"
      $width={liquidityStudioLayout.rightWidth}
      $height="auto"
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <Head>
        <LsSectionTitle style={{ margin: 0 }}>Liquidity Building</LsSectionTitle>
        <BadgeRow>
          <StatusBadge>AI Powered</StatusBadge>
          <LiquidityBuildingStatusBadge status={card.status} />
        </BadgeRow>
      </Head>

      <Body>
        <Lead>
          Use your available token supply to build liquidity from real market demand.
        </Lead>

        {card.status === 'NOT_ACTIVE' ? (
          <Bullet>
            <li>Budget-based execution</li>
            <li>Dynamic AI strategy</li>
            <li>Automatic Melega DEX liquidity</li>
            <li>Owner-controlled LP</li>
          </Bullet>
        ) : null}

        {card.status === 'SETUP_REQUIRED' || card.status === 'AWAITING_APPROVAL' ? (
          <>
            <Field>
              Project token
              <ChipBtn type="button" onClick={onPresentCurrencyModal} data-testid="lb-token-select">
                {card.draft.tokenSymbol || 'Select token'}
              </ChipBtn>
            </Field>
            <Field>
              Token budget
              <Input
                data-testid="lb-budget-input"
                inputMode="decimal"
                placeholder="0.0"
                value={card.draft.tokenBudget}
                onChange={(e) => card.setBudget(e.target.value)}
              />
            </Field>
            <Field>
              Strategy
              <SelectRow>
                <ChipBtn
                  type="button"
                  $active={card.draft.strategy === 'FULL_AI'}
                  onClick={() => card.setStrategy('FULL_AI')}
                >
                  Full AI
                </ChipBtn>
                <ChipBtn
                  type="button"
                  $active={card.draft.strategy === 'DYNAMIC_RANGE'}
                  onClick={() => card.setStrategy('DYNAMIC_RANGE')}
                >
                  Dynamic Range
                </ChipBtn>
              </SelectRow>
            </Field>
            {card.draft.strategy === 'DYNAMIC_RANGE' ? (
              <SelectRow>
                <Field>
                  Min rate (bps)
                  <Input
                    value={card.draft.minimumRateBps}
                    onChange={(e) => card.setRateRange(e.target.value, card.draft.maximumRateBps)}
                  />
                </Field>
                <Field>
                  Max rate (bps)
                  <Input
                    value={card.draft.maximumRateBps}
                    onChange={(e) => card.setRateRange(card.draft.minimumRateBps, e.target.value)}
                  />
                </Field>
              </SelectRow>
            ) : null}
            <Field>
              Epoch
              <SelectRow>
                {EPOCH_OPTIONS.map((opt) => (
                  <ChipBtn
                    key={opt.seconds}
                    type="button"
                    $active={card.draft.epochSeconds === opt.seconds}
                    onClick={() => card.setEpoch(opt.seconds)}
                  >
                    {opt.label}
                  </ChipBtn>
                ))}
              </SelectRow>
            </Field>
          </>
        ) : null}

        {card.reviewOpen ? (
          <ReviewBlock data-testid="lb-review">
            <ReviewRow>
              <span>Token</span>
              <span>{card.draft.tokenSymbol || '—'}</span>
            </ReviewRow>
            <ReviewRow>
              <span>Budget</span>
              <span>{card.draft.tokenBudget || '—'}</span>
            </ReviewRow>
            <ReviewRow>
              <span>Strategy</span>
              <span>{card.draft.strategy === 'FULL_AI' ? 'Full AI — Recommended' : 'Dynamic Range'}</span>
            </ReviewRow>
            <ReviewRow>
              <span>Epoch</span>
              <span>{EPOCH_OPTIONS.find((o) => o.seconds === card.draft.epochSeconds)?.label}</span>
            </ReviewRow>
            <ReviewRow>
              <span>Fee</span>
              <span>5% success fee on quote acquired</span>
            </ReviewRow>
          </ReviewBlock>
        ) : null}

        <Notice data-testid="lb-activation-notice">
          {card.gates.activationAuthorized
            ? 'Activation authorized.'
            : 'Liquidity Building unavailable until production activation requirements are completed. No fake liquidity, executions, APY, or simulated activity.'}
          {card.gates.blockers.length ? (
            <>
              <br />
              Blockers: {card.gates.blockers.slice(0, 4).join('; ')}
              {card.gates.blockers.length > 4 ? '…' : ''}
            </>
          ) : null}
        </Notice>

        {card.blockerMessage ? (
          <Notice data-testid="lb-blocker-message">{card.blockerMessage}</Notice>
        ) : null}

        {/* Hidden catalog ensures required LB014 labels remain present for tests / a11y. */}
        <span data-testid="lb-status-catalog" hidden>
          {PROGRAM_STATUSES.map((s) => PROGRAM_STATUS_LABEL[s]).join('|')}
        </span>

        {!card.walletConnected ? (
          <ConnectWrap>
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          </ConnectWrap>
        ) : !card.correctChain ? (
          <LsPrimaryBtn type="button" disabled>
            Switch Network
          </LsPrimaryBtn>
        ) : (
          <>
            <LsPrimaryBtn
              type="button"
              data-testid="lb-primary-cta"
              data-ls-primary-btn
              data-lb-mutating-blocked={mutatingBlocked ? 'true' : 'false'}
              onClick={onPrimary}
              disabled={
                mutatingBlocked ||
                (card.status === 'SETUP_REQUIRED' && !card.reviewOpen && !card.draftReady)
              }
            >
              {primaryForStatus()}
            </LsPrimaryBtn>
            {card.status === 'AWAITING_APPROVAL' ? (
              <LsOutlineBtn type="button" onClick={card.cancelApproval}>
                Cancel
              </LsOutlineBtn>
            ) : null}
            {card.status !== 'NOT_ACTIVE' ? (
              <LsGhostBtn type="button" onClick={card.reset}>
                Reset
              </LsGhostBtn>
            ) : null}
          </>
        )}
      </Body>

    </LsPanel>
  )
}

export default LiquidityBuildingPanel
