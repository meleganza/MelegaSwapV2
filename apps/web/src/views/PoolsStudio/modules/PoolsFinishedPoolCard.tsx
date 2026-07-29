/**
 * POOLS_MODULE_005 — Finished pool card (430×240 desktop).
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolBscScanContractUrl, resolvePoolContractAddress } from './poolContractLink'
import { poolsFinished } from './poolsFinishedPoolsTokens'
import type { PoolsFinishedAction, PoolsFinishedPoolCardModel } from './poolsFinishedPoolsTypes'

const Card = styled.article`
  position: relative;
  width: 100%;
  max-width: ${poolsFinished.cardW};
  height: ${poolsFinished.cardH};
  box-sizing: border-box;
  padding: ${poolsFinished.cardPad};
  border-radius: ${poolsFinished.cardRadius};
  border: ${poolsFinished.cardBorder};
  background: ${poolsFinished.cardBg};
  box-shadow: ${poolsFinished.cardShadow};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsFinished.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${poolsFinished.cardH};
  }

  @media (max-width: ${poolsFinished.mobileBreak}) {
    max-width: none;
    min-height: 220px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const LogoStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const RewardWrap = styled.span`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const TextCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${poolsFinished.titleSize};
  line-height: ${poolsFinished.titleLine};
  font-weight: ${poolsFinished.titleWeight};
  color: ${poolsFinished.titleColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EndedDate = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.5);
`

const Status = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${({ $tone }) => {
    if ($tone === 'Emergency') return '#FF8A65'
    if ($tone === 'Withdraw') return '#F4C430'
    return '#B39DDB'
  }};
  background: ${({ $tone }) => {
    if ($tone === 'Emergency') return 'rgba(255,138,101,0.14)'
    if ($tone === 'Withdraw') return 'rgba(244,196,48,0.14)'
    return 'rgba(179,157,219,0.12)'
  }};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  flex: 1;
  min-width: 0;
`

const Metric = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.5);
`

const MetricValue = styled.span`
  font-size: 14px;
  line-height: 18px;
  font-weight: 700;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const WithdrawalState = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`

const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex: 1 1 0;
  min-height: ${poolsFinished.touchMin};
  height: 40px;
  border-radius: 10px;
  border: 1px solid
    ${({ $danger, $primary }) =>
      $danger ? 'rgba(255,138,101,0.45)' : $primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)'};
  background: ${({ $danger, $primary }) =>
    $danger ? 'rgba(255,138,101,0.14)' : $primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $danger, $primary }) => ($danger ? '#FF8A65' : $primary ? poolsFinished.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 700;

  &:focus-visible {
    outline: ${poolsFinished.focusRing};
    outline-offset: ${poolsFinished.focusOffset};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

function busyLabel(kind: PoolsFinishedAction['kind'], base: PoolsFinishedAction['label']): string {
  if (kind === 'withdraw' || kind === 'emergency_withdraw') return 'Withdrawing…'
  return base
}

export const PoolsFinishedPoolCard: React.FC<{ pool: PoolsFinishedPoolCardModel }> = ({ pool }) => {
  const { requestModal } = usePoolsRuntime()
  const [busy, setBusy] = useState<PoolsFinishedAction['kind'] | null>(null)
  const contractAddress = resolvePoolContractAddress({
    contractAddress: pool.sourceCard.contractAddress,
    explorerUrl: pool.sourceCard.explorerUrl,
    contractExplorerUrl: pool.sourceCard.analyzePreview?.contractExplorerUrl,
  })
  const contractUrl = poolBscScanContractUrl(contractAddress)

  return (
    <Card
      data-testid="pools-finished-card"
      data-position-id={pool.positionId}
      data-finished-status={pool.status}
    >
      <Header>
        <Identity>
          <LogoStack aria-hidden="true">
            <PoolTokenIcon
              symbol={pool.stakeToken.symbol}
              address={pool.stakeToken.address ?? undefined}
              chainId={pool.stakeToken.chainId ?? undefined}
              size={32}
            />
            <RewardWrap>
              <PoolTokenIcon
                symbol={pool.rewardToken.symbol}
                address={pool.rewardToken.address ?? undefined}
                chainId={pool.rewardToken.chainId ?? undefined}
                size={24}
              />
            </RewardWrap>
          </LogoStack>
          <TextCol>
            <Title title={pool.title}>{pool.title}</Title>
            <EndedDate>{pool.endedDateLabel}</EndedDate>
          </TextCol>
        </Identity>
        <Status $tone={pool.statusLabel} aria-label={`Status ${pool.statusLabel}`}>
          {pool.statusLabel}
        </Status>
      </Header>

      <Metrics>
        <Metric>
          <MetricLabel>Principal remaining</MetricLabel>
          <MetricValue>{pool.principalFormatted}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Claimable rewards</MetricLabel>
          <MetricValue>{pool.claimableFormatted}</MetricValue>
        </Metric>
      </Metrics>

      <WithdrawalState>{pool.withdrawalState}</WithdrawalState>

      <Actions>
        {pool.actions.map((action, idx) => {
          const isBusy = busy === action.kind
          return (
            <Btn
              key={`${action.kind}-${action.label}`}
              type="button"
              $primary={idx === 0 && action.kind !== 'emergency_withdraw'}
              $danger={action.kind === 'emergency_withdraw'}
              disabled={!action.enabled || isBusy}
              aria-label={action.accessibleName}
              onClick={() => {
                if (!action.enabled || !action.modalAction) return
                setBusy(action.kind)
                try {
                  requestModal(pool.sourceCard, action.modalAction)
                } finally {
                  window.setTimeout(() => setBusy(null), 1200)
                }
              }}
            >
              {isBusy ? busyLabel(action.kind, action.label) : action.label}
            </Btn>
          )
        })}
        {contractUrl ? (
          <Btn
            type="button"
            data-testid="pools-finished-view-contract"
            data-ps-view-contract
            aria-label={`View contract for ${pool.title} on BscScan`}
            onClick={() => window.open(contractUrl, '_blank', 'noopener,noreferrer')}
          >
            View Contract ↗
          </Btn>
        ) : null}
      </Actions>
    </Card>
  )
}

export default PoolsFinishedPoolCard
