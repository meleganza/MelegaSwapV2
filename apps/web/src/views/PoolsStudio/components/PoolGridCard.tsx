import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { PoolTokenIcon, PsMetricLabel, PsSmallGhostBtn, PsSmallPrimaryBtn } from './poolsStudioPrimitives'

const Card = styled.article<{ $expanded?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: ${poolsStudioLayout.poolCardHeight};
  padding: 24px;
  border-radius: 20px;
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.goldBorder};
  }

  @media (max-width: 767px) {
    min-height: auto;
    padding: 20px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
`

const Line1 = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const PoolName = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.goldBorder};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${poolsStudioColors.goldBright};
  flex-shrink: 0;
`

const AprValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.green};

  @media (max-width: 767px) {
    font-size: 40px;
  }
`

const PairRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricValue = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  width: fit-content;
  border: 1px solid
    ${({ $status }) =>
      $status === 'ENDED'
        ? 'rgba(255,255,255,0.16)'
        : $status === 'ENDING SOON' || $status === 'NEW'
          ? poolsStudioColors.gold
          : poolsStudioColors.green};
  color: ${({ $status }) =>
    $status === 'ENDED' ? poolsStudioColors.muted : $status === 'ENDING SOON' || $status === 'NEW' ? poolsStudioColors.gold : poolsStudioColors.green};
  background: ${({ $status }) =>
    $status === 'ENDED' ? 'rgba(255,255,255,0.04)' : 'rgba(0,230,118,0.08)'};
`

const RemainBar = styled.div`
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 4px;
`

const RemainFill = styled.div<{ $pct: number; $tone: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $tone }) =>
    $tone === 'green' ? poolsStudioColors.green : $tone === 'yellow' ? poolsStudioColors.gold : poolsStudioColors.red};
  border-radius: 999px;
  transition: width 220ms ease-out;
`

const ExpandBlock = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '280px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height 220ms ease-out, opacity 220ms ease-out;
  border-top: 1px solid ${poolsStudioColors.rowBorder};
  padding-top: ${({ $open }) => ($open ? '12px' : '0')};
  margin-top: ${({ $open }) => ($open ? '4px' : '0')};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  font-size: 11px;
  color: ${poolsStudioColors.secondary};

  span {
    display: block;
    color: ${poolsStudioColors.text};
    font-weight: 700;
    font-size: 12px;
    margin-top: 2px;
  }
`

const Footer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;

  button {
    width: 100%;
    height: ${poolsStudioLayout.poolCardBtnHeight};
  }
`

const MachineHidden = styled.div`
  display: none;
`

interface Props {
  pool: PoolPreviewCard
}

export const PoolGridCard: React.FC<Props> = ({ pool }) => {
  const [expanded, setExpanded] = useState(false)
  const { requestModal, account } = usePoolsRuntime()
  const { chainId } = useActiveChainId()
  const stakingToken = pool.rawPool?.stakingToken
  const earningToken = pool.rawPool?.earningToken
  const preview = pool.analyzePreview
  const isEnded = pool.status === 'ended' || pool.cta === 'none'
  const displayStatus = pool.displayStatus ?? (pool.status === 'live' ? 'LIVE' : pool.status === 'indexing' ? 'INDEXING' : 'ENDED')
  const aprText = isEnded ? 'Ended' : pool.apr ?? '—'

  return (
    <Card data-ps-pool-card $expanded={expanded}>
      <MachineHidden data-melega-pool-v2={JSON.stringify(buildPoolMachineV2(pool, chainId))} aria-hidden />
      <Body>
        <Line1>
          <NameBlock>
            {pool.tokens.map((token, i) => (
              <PoolTokenIcon
                key={token}
                symbol={token}
                offset={i > 0}
                address={i === 0 ? stakingToken?.address : earningToken?.address}
                chainId={chainId}
              />
            ))}
            <PoolName>{pool.name}</PoolName>
          </NameBlock>
          <TypeBadge>{pool.visualType ?? 'Flexible'}</TypeBadge>
        </Line1>

        <AprValue>{aprText}</AprValue>

        <PairRow>
          <MetricCell>
            <PsMetricLabel>Stake Token</PsMetricLabel>
            <MetricValue>{pool.stakeToken ?? pool.tokens[0] ?? '—'}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Reward Token</PsMetricLabel>
            <MetricValue>{pool.rewardToken}</MetricValue>
          </MetricCell>
        </PairRow>

        <PairRow>
          <MetricCell>
            <PsMetricLabel>TVL</PsMetricLabel>
            <MetricValue>{pool.tvl}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Participants</PsMetricLabel>
            <MetricValue>{pool.participants}</MetricValue>
          </MetricCell>
        </PairRow>

        <PairRow>
          <MetricCell>
            <PsMetricLabel>Daily Rewards</PsMetricLabel>
            <MetricValue>{pool.estimatedDailyReward ?? pool.dailyRewards}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Remaining Rewards</PsMetricLabel>
            <MetricValue>{pool.remainingRewards ?? '—'}</MetricValue>
            {pool.remainingRewardsPct != null ? (
              <RemainBar>
                <RemainFill $pct={pool.remainingRewardsPct} $tone={pool.remainingRewardsTone ?? 'green'} />
              </RemainBar>
            ) : null}
          </MetricCell>
        </PairRow>

        <StatusBadge $status={displayStatus}>{displayStatus}</StatusBadge>

        <ExpandBlock $open={expanded && Boolean(preview)}>
          <div>
            APR History<span>{preview?.aprHistory}</span>
          </div>
          <div>
            Pool Type<span>{pool.visualType}</span>
          </div>
          <div>
            Lock Period<span>{pool.lockPeriod}</span>
          </div>
          <div>
            Cooldown<span>{pool.cooldown}</span>
          </div>
          <div>
            Sustainability<span>{pool.rewardSustainability}</span>
          </div>
          <div>
            Auto Compound<span>{preview?.autoCompound}</span>
          </div>
          <div>
            Contract
            <span>
              <a href={pool.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                Explorer
              </a>
            </span>
          </div>
        </ExpandBlock>
      </Body>

      <Footer>
        {isEnded ? (
          <StatusBadge $status="ENDED" style={{ gridColumn: 'span 2', width: '100%', justifyContent: 'center' }}>
            Ended
          </StatusBadge>
        ) : (
          <>
            {pool.cta === 'stake' ? (
              <PsSmallPrimaryBtn type="button" onClick={() => requestModal(pool, 'stake')}>
                Stake
              </PsSmallPrimaryBtn>
            ) : (
              <span />
            )}
            <PsSmallGhostBtn type="button" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Hide Analysis' : 'Analyze'}
            </PsSmallGhostBtn>
          </>
        )}
      </Footer>
    </Card>
  )
}

export default PoolGridCard
