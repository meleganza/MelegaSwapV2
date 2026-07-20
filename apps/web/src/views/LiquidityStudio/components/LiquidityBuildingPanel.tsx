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
import { PROGRAM_STATUS_LABEL, PROGRAM_STATUSES, type ProgramStatus } from '../liquidityBuilding/programStatus'
import { LbActiveDashboardView } from '../liquidityBuilding/LbActiveDashboardView'
import {
  DECISION_FREQUENCY_OPTIONS,
  LB_UX,
  MANAGE_ACTION_LABEL,
} from '../liquidityBuilding/uxCopy'

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
  gap: 12px;
  min-height: 0;
`

const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${liquidityStudioColors.muted};
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.muted};
`

const Hint = styled.span`
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
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

const StrategyCard = styled.button<{ $active?: boolean }>`
  text-align: left;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ $active }) => ($active ? liquidityStudioColors.gold : liquidityStudioColors.border)};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 0, 0, 0.18)')};
  color: ${liquidityStudioColors.text};
  cursor: pointer;
`

const StrategyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 4px;
`

const Tag = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.goldBright};
`

const ChipRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const ChipBtn = styled.button<{ $active?: boolean }>`
  min-height: 36px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? liquidityStudioColors.gold : liquidityStudioColors.border)};
  background: ${({ $active }) => ($active ? 'rgba(212, 175, 55, 0.12)' : 'transparent')};
  color: ${liquidityStudioColors.text};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px;
`

const Notice = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.22);
  font-size: 12px;
  line-height: 1.5;
  color: ${liquidityStudioColors.muted};
`

const ReadinessRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const ReadyPill = styled.span<{ $pending?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $pending }) => ($pending ? liquidityStudioColors.gold : liquidityStudioColors.green)};
  color: ${({ $pending }) => ($pending ? liquidityStudioColors.goldBright : liquidityStudioColors.green)};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`

const ReviewBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  color: ${liquidityStudioColors.text};
`

const ReviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

const ConnectWrap = styled.div`
  width: 100%;
  margin-top: ${liquidityStudioLayout.executionButtonGap};
  & > button {
    width: 100%;
  }
`

const ActionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export function LiquidityBuildingStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <StatusBadge data-testid="lb-status-badge" data-status={status} $muted={status === 'NOT_ACTIVE'}>
      {PROGRAM_STATUS_LABEL[status]}
    </StatusBadge>
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

  const statusBadge =
    card.activationPending && card.phase === 'entry' ? (
      <StatusBadge data-testid="lb-activation-required">{LB_UX.activationRequired}</StatusBadge>
    ) : card.phase === 'active' || card.phase === 'manage' ? (
      <LiquidityBuildingStatusBadge status={card.status} />
    ) : (
      <StatusBadge $muted>{PROGRAM_STATUS_LABEL[card.status]}</StatusBadge>
    )

  return (
    <LsPanel
      data-ls-panel
      data-liquidity-building-panel
      data-lb016="true"
      data-lb024="true"
      data-lb-phase={card.phase}
      $width="100%"
      $height="auto"
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <Head>
        <LsSectionTitle style={{ margin: 0 }}>{LB_UX.productName}</LsSectionTitle>
        <BadgeRow>
          <StatusBadge>{LB_UX.aiBadge}</StatusBadge>
          {statusBadge}
        </BadgeRow>
      </Head>

      <Body>
        {card.phase === 'entry' ? (
          <>
            <LsSectionTitle data-testid="lb-entry-title" style={{ margin: 0, fontSize: 16 }}>
              {LB_UX.entryTitle}
            </LsSectionTitle>
            <Lead data-testid="lb-entry-lead">{LB_UX.entryLead}</Lead>
            <Lead data-testid="lb-entry-support">{LB_UX.entrySupport}</Lead>
            {card.activationPending ? (
              <Notice data-testid="lb-blocked-banner" data-lb-ui-mode={card.readiness.uiMode} data-lb-product-status={card.readiness.productStatus}>
                <strong style={{ color: liquidityStudioColors.text }}>
                  {card.readiness.uiMode === 'available'
                    ? LB_UX.activationAvailableTitle
                    : card.readiness.uiMode === 'blocked'
                      ? LB_UX.activationBlockedTitle
                      : LB_UX.activationPendingTitle}
                </strong>
                <br />
                <span data-testid="lb-activation-pending-badge">
                  {card.readiness.uiMode === 'available' ? LB_UX.readinessReady : LB_UX.activationPendingBadge}
                </span>
                <br />
                {card.readiness.uiMode === 'available'
                  ? LB_UX.activationAvailableBody
                  : card.readiness.uiMode === 'blocked'
                    ? LB_UX.activationBlockedBody
                    : LB_UX.activationWaitingBody}
                <br />
                {card.readiness.uiMode === 'available' ? null : LB_UX.activationRequiredBody}
                <ReadinessRow style={{ marginTop: 10 }}>
                  <ReadyPill
                    data-testid="lb-ready-contracts"
                    data-state={card.readiness.contracts}
                    $pending={card.readiness.contracts === 'Pending'}
                  >
                    {LB_UX.readinessContracts}: {card.readiness.contracts === 'Ready' ? LB_UX.readinessReady : LB_UX.readinessPending}
                  </ReadyPill>
                  <ReadyPill
                    data-testid="lb-ready-runtime"
                    data-state={card.readiness.runtime}
                    $pending={card.readiness.runtime === 'Pending'}
                  >
                    {LB_UX.readinessRuntime}: {card.readiness.runtime === 'Ready' ? LB_UX.readinessReady : LB_UX.readinessPending}
                  </ReadyPill>
                  <ReadyPill
                    $pending={card.readiness.activation === 'Pending'}
                    data-testid="lb-ready-activation"
                    data-state={card.readiness.activation}
                  >
                    {LB_UX.readinessActivation}:{' '}
                    {card.readiness.activation === 'Ready' ? LB_UX.readinessReady : LB_UX.readinessPending}
                  </ReadyPill>
                </ReadinessRow>
              </Notice>
            ) : null}
          </>
        ) : null}

        {card.phase === 'setup' ? (
          <div data-testid="lb-setup-view">
            <Field>
              Token
              <ChipBtn type="button" onClick={onPresentCurrencyModal} data-testid="lb-token-select">
                {card.draft.tokenSymbol || 'Select token'}
              </ChipBtn>
              {card.draft.tokenSymbol ? (
                <Hint data-testid="lb-token-meta">
                  Symbol {card.draft.tokenSymbol}
                  {card.selectedCurrency?.decimals != null ? ` · ${card.selectedCurrency.decimals} decimals` : ''}
                  {card.walletBalanceLabel ? ` · Wallet ${card.walletBalanceLabel}` : ''}
                </Hint>
              ) : null}
              {card.draft.tokenSymbol ? (
                <Hint data-testid="lb-pair-detection">
                  {card.pairDetection.loading
                    ? LB_UX.pairLoading
                    : card.pairDetection.available
                      ? `${LB_UX.pairDetected} · ${card.pairDetection.quoteSymbol} · reserves ${card.pairDetection.reserveProject ?? '—'} / ${card.pairDetection.reserveQuote ?? '—'}`
                      : LB_UX.pairNotDetected}
                </Hint>
              ) : null}
            </Field>
            <Field>
              {LB_UX.budgetLabel}
              <Input
                data-testid="lb-budget-input"
                inputMode="decimal"
                placeholder="0.0"
                value={card.draft.tokenBudget}
                onChange={(e) => card.setBudget(e.target.value)}
              />
              <Hint>{LB_UX.budgetSupport}</Hint>
            </Field>
            <Field>
              Strategy
              <StrategyCard
                type="button"
                $active={card.draft.strategy === 'FULL_AI'}
                data-testid="lb-strategy-full-ai"
                onClick={() => card.setStrategy('FULL_AI')}
              >
                <StrategyTitle>
                  {LB_UX.strategyFullAiTitle} <Tag>{LB_UX.strategyFullAiTag}</Tag>
                </StrategyTitle>
                <Hint as="span">{LB_UX.strategyFullAiBody}</Hint>
              </StrategyCard>
              <StrategyCard
                type="button"
                $active={card.draft.strategy === 'DYNAMIC_RANGE'}
                data-testid="lb-strategy-dynamic"
                onClick={() => card.setStrategy('DYNAMIC_RANGE')}
                style={{ marginTop: 8 }}
              >
                <StrategyTitle>
                  {LB_UX.strategyRangeTitle} <Tag>{LB_UX.strategyRangeTag}</Tag>
                </StrategyTitle>
                <Hint as="span">{LB_UX.strategyRangeBody}</Hint>
              </StrategyCard>
            </Field>
            {card.draft.strategy === 'DYNAMIC_RANGE' ? (
              <ChipRow>
                <Field>
                  Minimum intensity
                  <Input
                    value={card.draft.minimumRateBps}
                    onChange={(e) => card.setRateRange(e.target.value, card.draft.maximumRateBps)}
                  />
                </Field>
                <Field>
                  Maximum intensity
                  <Input
                    value={card.draft.maximumRateBps}
                    onChange={(e) => card.setRateRange(card.draft.minimumRateBps, e.target.value)}
                  />
                </Field>
              </ChipRow>
            ) : null}
            <Field>
              {LB_UX.decisionFrequencyLabel}
              <Hint>{LB_UX.decisionFrequencyHelp}</Hint>
              <ChipRow>
                {DECISION_FREQUENCY_OPTIONS.map((opt) => (
                  <ChipBtn
                    key={opt.seconds}
                    type="button"
                    $active={card.draft.epochSeconds === opt.seconds}
                    data-testid={`lb-freq-${opt.seconds}`}
                    onClick={() => card.setEpoch(opt.seconds)}
                  >
                    {opt.label}
                  </ChipBtn>
                ))}
              </ChipRow>
            </Field>
          </div>
        ) : null}

        {card.phase === 'review' ? (
          <div data-testid="lb-review-view">
            <LsSectionTitle style={{ margin: 0, fontSize: 14 }}>{LB_UX.reviewTitle}</LsSectionTitle>
            <ReviewBlock>
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
                <span>
                  {card.draft.strategy === 'FULL_AI'
                    ? `${LB_UX.strategyFullAiTitle} — ${LB_UX.strategyFullAiTag}`
                    : `${LB_UX.strategyRangeTitle} — ${LB_UX.strategyRangeTag}`}
                </span>
              </ReviewRow>
              <ReviewRow>
                <span>Decision Frequency</span>
                <span>{card.decisionFrequencyLabel}</span>
              </ReviewRow>
              <ReviewRow>
                <span>Liquidity Pair</span>
                <span data-testid="lb-review-pair">
                  {card.pairDetection.available
                    ? `${card.draft.tokenSymbol}/${card.pairDetection.quoteSymbol}`
                    : card.pairDetection.loading
                      ? LB_UX.pairLoading
                      : LB_UX.pairNotDetected}
                </span>
              </ReviewRow>
              <ReviewRow>
                <span>LP Ownership</span>
                <span>{LB_UX.lpOwnedByOwner}</span>
              </ReviewRow>
              <ReviewRow>
                <span>Melega Success Fee</span>
                <span>5% on quote acquired</span>
              </ReviewRow>
              <ReviewRow>
                <span>Safety</span>
                <span>
                  {LB_UX.safetyNoGuarantees} {LB_UX.safetyNoManipulation} {LB_UX.safetyNoOutcomes}
                </span>
              </ReviewRow>
            </ReviewBlock>
            {!card.mutateGate.ok ? (
              <Notice data-testid="lb-review-activation-pending" style={{ marginTop: 10 }}>
                <strong style={{ color: liquidityStudioColors.text }}>{LB_UX.activationPendingBadge}</strong>
                <br />
                {LB_UX.activationWaitingBody}
              </Notice>
            ) : null}
          </div>
        ) : null}

        {card.phase === 'active' || card.phase === 'manage' ? (
          <LbActiveDashboardView status={card.status} metrics={card.metrics} activity={card.activity} />
        ) : null}

        {card.phase === 'manage' ? (
          <ActionStack data-testid="lb-manage-panel">
            <LsSectionTitle style={{ margin: 0, fontSize: 14 }}>{LB_UX.manageTitle}</LsSectionTitle>
            {card.manageActions.map((action) => {
              const disabled = !card.mutateGate.ok && action !== 'MANAGE_LP'
              const onClick = () => {
                if (disabled) return
                if (action === 'PAUSE') card.pause()
                if (action === 'RESUME') card.resume()
                if (action === 'STOP') card.stop()
              }
              return (
                <LsOutlineBtn
                  key={action}
                  type="button"
                  data-testid={`lb-manage-${action}`}
                  disabled={disabled}
                  onClick={onClick}
                >
                  {MANAGE_ACTION_LABEL[action]}
                </LsOutlineBtn>
              )
            })}
            <LsGhostBtn type="button" onClick={card.closeManage}>
              {LB_UX.back}
            </LsGhostBtn>
          </ActionStack>
        ) : null}

        <details
          data-testid="lb-technical-details"
          open={card.technicalOpen}
          onToggle={(e) => {
            const open = (e.target as HTMLDetailsElement).open
            if (open !== card.technicalOpen) card.toggleTechnical()
          }}
        >
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: liquidityStudioColors.muted }}>
            {LB_UX.technicalTitle}
          </summary>
          <Notice style={{ marginTop: 8 }} data-testid="lb-technical-body">
            Program address: {card.programSource === 'ON_CHAIN' ? 'On-chain' : 'Unavailable until deployed'}
            <br />
            Pair: {card.pairDetection.pairAddress ?? 'Unavailable until detected'}
            <br />
            Source: {card.programSource}
            {card.programReason ? ` (${card.programReason})` : ''}
            <br />
            Execution history: Real receipts only
          </Notice>
        </details>

        <span data-testid="lb-status-catalog" hidden>
          {PROGRAM_STATUSES.map((s) => PROGRAM_STATUS_LABEL[s]).join('|')}
        </span>

        <ActionStack>
          {/* LB024 — Setup/Review remain reachable while activation is blocked; only mutating CTAs stay fail-closed. */}
          {card.phase === 'entry' ? (
            <LsPrimaryBtn type="button" data-testid="lb-primary-cta" data-ls-primary-btn onClick={card.startSetup}>
              {LB_UX.startCta}
            </LsPrimaryBtn>
          ) : null}
          {card.phase === 'setup' ? (
            <>
              <LsPrimaryBtn
                type="button"
                data-testid="lb-primary-cta"
                disabled={!card.draftReady}
                onClick={card.openReview}
              >
                {LB_UX.review}
              </LsPrimaryBtn>
              <LsGhostBtn type="button" onClick={card.backToEntry}>
                {LB_UX.back}
              </LsGhostBtn>
            </>
          ) : null}
          {card.phase === 'review' ? (
            <>
              <LsPrimaryBtn
                type="button"
                data-testid="lb-primary-cta"
                data-lb-mutating-blocked={!card.mutateGate.ok ? 'true' : 'false'}
                disabled={!card.mutateGate.ok}
                onClick={card.requestDepositAndActivate}
              >
                {card.mutateGate.ok ? LB_UX.reviewCta : LB_UX.activationRequired}
              </LsPrimaryBtn>
              <LsGhostBtn type="button" onClick={card.backToSetup}>
                {LB_UX.back}
              </LsGhostBtn>
            </>
          ) : null}
          {card.phase === 'active' ? (
            <>
              <LsPrimaryBtn type="button" data-testid="lb-primary-cta" onClick={card.openManage}>
                {LB_UX.openDashboardCta}
              </LsPrimaryBtn>
              <LsGhostBtn type="button" onClick={card.reset}>
                Reset
              </LsGhostBtn>
            </>
          ) : null}
          {!card.walletConnected ? (
            <ConnectWrap>
              <ConnectWalletButton>{LB_UX.walletConnect}</ConnectWalletButton>
            </ConnectWrap>
          ) : null}
          {card.walletConnected && !card.correctChain ? (
            <LsPrimaryBtn type="button" disabled>
              {LB_UX.switchNetwork}
            </LsPrimaryBtn>
          ) : null}
        </ActionStack>
      </Body>
    </LsPanel>
  )
}

export default LiquidityBuildingPanel
