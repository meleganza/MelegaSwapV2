/**
 * POOLS_MODULE_003 — single position card (288×276 desktop).
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { ChainSwitchConfirmDialog } from 'components/ChainSwitchConfirmDialog'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { poolBscScanContractUrl, resolvePoolContractAddress } from './poolContractLink'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import type { PoolsPositionAction, PoolsWalletPosition } from './poolsMyPositionsTypes'

const Card = styled.article`
  position: relative;
  width: 100%;
  max-width: ${poolsMyPositions.cardW};
  height: ${poolsMyPositions.cardH};
  box-sizing: border-box;
  padding: ${poolsMyPositions.cardPad};
  border-radius: ${poolsMyPositions.cardRadius};
  border: ${poolsMyPositions.cardBorder};
  background: ${poolsMyPositions.cardBg};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsMyPositions.tabletBreak}) {
    max-width: none;
    min-width: 250px;
    height: auto;
    min-height: ${poolsMyPositions.cardH};
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: ${poolsMyPositions.mobileCardMinH};
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
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

const RewardLogoWrap = styled.span`
  margin-left: ${poolsMyPositions.logoOverlap}px;
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const IdentityText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${poolsMyPositions.cardTitleSize};
  line-height: ${poolsMyPositions.cardTitleLine};
  font-weight: ${poolsMyPositions.titleWeight};
  color: ${poolsMyPositions.titleColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: ${poolsMyPositions.cardSubtitleSize};
  line-height: ${poolsMyPositions.cardSubtitleLine};
  color: ${poolsMyPositions.cardSubtitleColor};
`

const StatusBadge = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${poolsMyPositions.statusH};
  padding: 0 10px;
  border-radius: ${poolsMyPositions.statusRadius};
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${({ $tone }) => {
    if ($tone === 'Active') return '#6DDC8C'
    if ($tone === 'Withdraw') return '#F4C430'
    if ($tone === 'Emergency') return '#FF8A65'
    if ($tone === 'Partial') return '#E0B85A'
    if ($tone === 'Finished' || $tone === 'Ended') return '#FF6B6B'
    return 'rgba(255,255,255,0.55)'
  }};
  background: ${({ $tone }) => {
    if ($tone === 'Active') return 'rgba(109,220,140,0.12)'
    if ($tone === 'Withdraw') return 'rgba(244,196,48,0.14)'
    if ($tone === 'Emergency') return 'rgba(255,138,101,0.14)'
    if ($tone === 'Partial') return 'rgba(224,184,90,0.12)'
    if ($tone === 'Finished' || $tone === 'Ended') return 'rgba(255,107,107,0.14)'
    return 'rgba(255,255,255,0.06)'
  }};
`

const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricLabel = styled.span`
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.5);
`

const MetricValue = styled.span`
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetricSupport = styled.span`
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.45);
`

const Unlock = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  min-width: 0;

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    flex-wrap: wrap;
  }
`

const ActionButton = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex: 1 1 0;
  min-width: 0;
  min-height: ${poolsMyPositions.touchMin};
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? poolsMyPositions.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;

  &:focus-visible {
    outline: ${poolsMyPositions.focusRing};
    outline-offset: ${poolsMyPositions.focusOffset};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: ${poolsMyPositions.mobileBreak}) {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    min-height: ${poolsMyPositions.touchMin};
  }
`

function actionBusyLabel(kind: PoolsPositionAction['kind'], base: PoolsPositionAction['label']): string {
  if (kind === 'claim') return 'Claiming…'
  if (kind === 'withdraw' || kind === 'emergency_withdraw') return 'Withdrawing…'
  return base
}

export const PoolsMyPositionCard: React.FC<{
  position: PoolsWalletPosition
}> = ({ position }) => {
  const { requestModal } = usePoolsRuntime()
  const { chainId: walletChainId } = useActiveChainId()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [busyKind, setBusyKind] = useState<PoolsPositionAction['kind'] | null>(null)
  const [txNote, setTxNote] = useState<string | null>(null)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [pendingAction, setPendingAction] = useState<PoolsPositionAction | null>(null)
  const contractAddress = resolvePoolContractAddress({
    contractAddress: position.poolContract || position.sourceCard.contractAddress,
    explorerUrl: position.sourceCard.explorerUrl,
    contractExplorerUrl: position.sourceCard.analyzePreview?.contractExplorerUrl,
  })
  const contractUrl =
    (contractAddress && getBlockExploreLink(contractAddress, 'address', position.chainId)) ||
    poolBscScanContractUrl(contractAddress)
  const explorerName = getBlockExploreName(position.chainId)

  const sameToken =
    position.stakeToken.symbol &&
    position.rewardToken.symbol &&
    position.stakeToken.symbol === position.rewardToken.symbol

  const runAction = (action: PoolsPositionAction) => {
    if (!action.enabled || !action.modalAction) return
    setBusyKind(action.kind)
    setTxNote(`Opening ${action.label}…`)
    try {
      requestModal(position.sourceCard, action.modalAction)
    } catch {
      setTxNote('Transaction Failed')
    } finally {
      window.setTimeout(() => {
        setBusyKind(null)
        setTxNote(null)
      }, 1200)
    }
  }

  const onAction = (action: PoolsPositionAction) => {
    if (!action.enabled || !action.modalAction) return
    if (walletChainId != null && walletChainId !== position.chainId) {
      setPendingAction(action)
      setSwitchOpen(true)
      return
    }
    runAction(action)
  }

  const onConfirmSwitch = async () => {
    setSwitching(true)
    try {
      await switchNetworkAsync?.(position.chainId)
      setSwitchOpen(false)
      const next = pendingAction
      setPendingAction(null)
      if (next) window.setTimeout(() => runAction(next), 400)
    } catch {
      setPendingAction(null)
      setSwitchOpen(false)
    } finally {
      setSwitching(false)
    }
  }

  return (
    <Card
      data-testid="pools-my-position-card"
      data-position-id={position.positionId}
      data-position-status={position.positionStatus}
      data-pool-status={position.poolStatus}
    >
      <Header>
        <Identity>
          <LogoStack aria-hidden={false}>
            <PoolTokenIcon
              symbol={position.stakeToken.symbol}
              address={position.stakeToken.address ?? undefined}
              chainId={position.stakeToken.chainId ?? undefined}
              size={poolsMyPositions.stakeLogo}
            />
            {!sameToken ? (
              <RewardLogoWrap>
                <PoolTokenIcon
                  symbol={position.rewardToken.symbol}
                  address={position.rewardToken.address ?? undefined}
                  chainId={position.rewardToken.chainId ?? undefined}
                  size={poolsMyPositions.rewardLogo}
                />
              </RewardLogoWrap>
            ) : null}
          </LogoStack>
          <IdentityText>
            <Title title={position.title}>{position.title}</Title>
            <Subtitle>{position.subtitle}</Subtitle>
          </IdentityText>
        </Identity>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <MelegaExploreChainBadge chainId={position.chainId} />
          <StatusBadge $tone={position.statusLabel} aria-label={`Status ${position.statusLabel}`}>
            {position.statusLabel}
          </StatusBadge>
        </div>
      </Header>

      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {sameToken
          ? `${position.stakeToken.symbol} stake and reward token`
          : `${position.stakeToken.symbol} stake token and ${position.rewardToken.symbol} reward token`}
      </span>

      <Metrics>
        <Metric>
          <MetricLabel>Staked</MetricLabel>
          <MetricValue>{position.stakedFormatted}</MetricValue>
          {position.stakedValue ? <MetricSupport>{position.stakedValue}</MetricSupport> : null}
        </Metric>
        <Metric>
          <MetricLabel>Claimable</MetricLabel>
          <MetricValue>{position.claimableFormatted}</MetricValue>
          {position.claimableFormatted === '—' ? (
            <MetricSupport>Reward data unavailable</MetricSupport>
          ) : position.claimableValue ? (
            <MetricSupport>{position.claimableValue}</MetricSupport>
          ) : position.claimableFormatted && !position.claimableFormatted.startsWith('0 ') ? (
            <MetricSupport>USD value unavailable</MetricSupport>
          ) : null}
        </Metric>
        {position.unlockLine ? <Unlock>{position.unlockLine}</Unlock> : null}
      </Metrics>

      <Actions>
        {position.actions.map((action, idx) => {
          const busy = busyKind === action.kind
          const label = busy ? actionBusyLabel(action.kind, action.label) : action.label
          return (
            <ActionButton
              key={`${action.kind}-${action.label}`}
              type="button"
              $primary={idx === 0}
              disabled={!action.enabled || busy}
              aria-label={action.accessibleName}
              onClick={() => onAction(action)}
            >
              {label}
            </ActionButton>
          )
        })}
        {contractUrl ? (
          <ActionButton
            type="button"
            data-testid="pools-position-view-contract"
            data-ps-view-contract
            aria-label={`View contract for ${position.title} on ${explorerName}`}
            onClick={() => window.open(contractUrl, '_blank', 'noopener,noreferrer')}
          >
            {explorerName} ↗
          </ActionButton>
        ) : null}
      </Actions>

      <ChainSwitchConfirmDialog
        open={switchOpen}
        targetChainId={position.chainId}
        productLabel="This pool"
        busy={switching}
        onCancel={() => {
          setPendingAction(null)
          setSwitchOpen(false)
        }}
        onConfirm={onConfirmSwitch}
      />

      <span
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {txNote || ''}
      </span>
    </Card>
  )
}

export default PoolsMyPositionCard
