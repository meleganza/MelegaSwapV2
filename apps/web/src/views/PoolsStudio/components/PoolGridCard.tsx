import React, { useState } from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PoolTokenIcon, PsMetricLabel, PsSmallGhostBtn, PsSmallPrimaryBtn } from './poolsStudioPrimitives'

const Card = styled.article<{ $expanded?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: ${poolsStudioLayout.poolCardHeight};
  height: ${({ $expanded }) => ($expanded ? 'auto' : poolsStudioLayout.poolCardHeight)};
  padding: 16px;
  border-radius: 20px;
  background: #131313;
  border: 1px solid #262626;
  box-sizing: border-box;
  min-width: 0;
  overflow: visible;

  @media (max-width: 767px) {
    height: auto;
    min-height: 280px;
    padding: 14px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
`

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const PoolName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StatusPill = styled.span<{ $status: PoolPreviewCard['status'] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
  border: 1px solid
    ${({ $status }) =>
      $status === 'indexing'
        ? poolsStudioColors.gold
        : $status === 'ended'
          ? 'rgba(255,255,255,0.16)'
          : poolsStudioColors.green};
  color: ${({ $status }) =>
    $status === 'indexing'
      ? poolsStudioColors.gold
      : $status === 'ended'
        ? poolsStudioColors.muted
        : poolsStudioColors.green};
  background: ${({ $status }) =>
    $status === 'indexing' ? poolsStudioColors.previewBadgeBg : $status === 'ended' ? 'rgba(255,255,255,0.04)' : 'rgba(0,230,118,0.08)'};
`

const AprSection = styled.div<{ $ended?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: ${poolsStudioLayout.poolCardAprGap};
  flex-shrink: 0;
  ${({ $ended }) =>
    $ended
      ? `
    flex: 1;
    justify-content: center;
    align-items: center;
    text-align: center;
  `
      : ''}
`

const AprValue = styled.div<{ $status: PoolPreviewCard['status'] }>`
  font-size: ${({ $status }) =>
    $status === 'indexing' ? '28px' : $status === 'ended' ? '36px' : '32px'};
  font-weight: 800;
  line-height: ${({ $status }) =>
    $status === 'indexing' ? '30px' : $status === 'ended' ? '38px' : '36px'};
  color: ${({ $status }) =>
    $status === 'indexing'
      ? poolsStudioColors.gold
      : $status === 'ended'
        ? poolsStudioColors.muted
        : poolsStudioColors.green};

  @media (max-width: 767px) {
    font-size: ${({ $status }) =>
      $status === 'indexing' ? '26px' : $status === 'ended' ? '32px' : '28px'};
    line-height: ${({ $status }) =>
      $status === 'indexing' ? '28px' : $status === 'ended' ? '34px' : '32px'};
  }
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${poolsStudioLayout.poolCardMetricColGap};
  row-gap: ${poolsStudioLayout.poolCardMetricRowGap};
  flex: 1;
  min-height: 0;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
`

const MetricValue = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? poolsStudioColors.green
      : $tone === 'gold'
        ? poolsStudioColors.gold
        : $tone === 'muted'
          ? poolsStudioColors.muted
          : poolsStudioColors.text};
`

const AnalyzeBlock = styled.div`
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid ${poolsStudioColors.rowBorder};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
`

const AnalyzeItem = styled.div`
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
  margin-top: ${poolsStudioLayout.poolCardMetricsFooterGap};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: ${poolsStudioLayout.poolCardBtnGap};
  flex-shrink: 0;
  padding-top: 8px;

  button {
    min-width: 72px;
    flex: 1 1 auto;
    max-width: 120px;
    font-size: 13px;
    height: ${poolsStudioLayout.poolCardBtnHeight};
  }

  @media (max-width: 767px) {
    button {
      max-width: none;
      flex: 1 1 calc(50% - 4px);
    }
  }
`

const EndedPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: ${poolsStudioColors.muted};
  font-size: 13px;
  font-weight: 700;
`

function formatRewardValue(value: string) {
  if (!value || value === '—') return value
  return formatCompactDisplay(value.replace(/\s*MARCO\s*$/i, ''))
}

function statusLabel(status: PoolPreviewCard['status']) {
  if (status === 'live') return 'Live'
  if (status === 'indexing') return 'Indexing'
  return 'Ended'
}

interface Props {
  pool: PoolPreviewCard
}

export const PoolGridCard: React.FC<Props> = ({ pool }) => {
  const [expanded, setExpanded] = useState(false)
  const { requestModal, account } = usePoolsRuntime()
  const preview = pool.analyzePreview
  const showStake = pool.cta === 'stake'
  const showAnalyze = pool.cta === 'stake' || pool.cta === 'analyze'
  const isEnded = pool.status === 'ended' || pool.cta === 'none'
  const hasPending = pool.pendingReward?.gt(0)
  const hasStaked = pool.userStaked?.gt(0)

  const aprText = pool.status === 'ended' ? 'Ended' : pool.apr ?? '—'

  return (
    <Card data-ps-pool-card $expanded={expanded}>
      <Body>
        <TopRow>
          <NameBlock>
            {pool.tokens.map((token, i) => (
              <PoolTokenIcon key={token} symbol={token} offset={i > 0} />
            ))}
            <PoolName>{pool.name}</PoolName>
          </NameBlock>
          <StatusPill $status={pool.status}>
            {pool.status === 'live' ? 'LIVE' : pool.status === 'indexing' ? 'INDEXING' : 'ENDED'}
          </StatusPill>
        </TopRow>

        <AprSection $ended={pool.status === 'ended'}>
          <PsMetricLabel>APR</PsMetricLabel>
          <AprValue $status={pool.status}>{aprText}</AprValue>
        </AprSection>

        {!isEnded ? (
        <Metrics>
          <MetricCell>
            <PsMetricLabel>TVL</PsMetricLabel>
            <MetricValue>{pool.tvl}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Liquidity</PsMetricLabel>
            <MetricValue>{pool.liquidity}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Reward Token</PsMetricLabel>
            <MetricValue>{pool.rewardToken}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Multiplier</PsMetricLabel>
            <MetricValue $tone="gold">{pool.multiplier}</MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Daily Rewards</PsMetricLabel>
            <MetricValue $tone={pool.dailyRewards !== '—' ? 'green' : 'muted'}>
              {formatRewardValue(pool.dailyRewards)}
            </MetricValue>
          </MetricCell>
          <MetricCell>
            <PsMetricLabel>Status</PsMetricLabel>
            <MetricValue
              $tone={pool.status === 'live' ? 'green' : pool.status === 'indexing' ? 'gold' : 'muted'}
            >
              {statusLabel(pool.status)}
            </MetricValue>
          </MetricCell>
        </Metrics>
        ) : null}

        {expanded && preview ? (
          <AnalyzeBlock>
            <AnalyzeItem>
              APR History<span>{preview.aprHistory}</span>
            </AnalyzeItem>
            <AnalyzeItem>
              Pool Type<span>{pool.poolTypeLabel ?? '—'}</span>
            </AnalyzeItem>
            <AnalyzeItem>
              Emission<span>{preview.emission}</span>
            </AnalyzeItem>
            <AnalyzeItem>
              Contract<span>{preview.contract}</span>
            </AnalyzeItem>
            <AnalyzeItem>
              Risk<span>{preview.risk}</span>
            </AnalyzeItem>
            <AnalyzeItem>
              Auto Compound<span>{preview.autoCompound}</span>
            </AnalyzeItem>
            <AnalyzeItem style={{ gridColumn: 'span 2' }}>
              Estimated ROI<span>{preview.estimatedRoi}</span>
            </AnalyzeItem>
          </AnalyzeBlock>
        ) : null}
      </Body>

      <Footer>
        {isEnded ? (
          <EndedPill>Ended</EndedPill>
        ) : (
          <>
            {showStake ? (
              <PsSmallPrimaryBtn type="button" onClick={() => requestModal(pool, 'stake')}>
                Stake
              </PsSmallPrimaryBtn>
            ) : null}
            {hasStaked && account ? (
              <PsSmallGhostBtn type="button" onClick={() => requestModal(pool, 'unstake')}>
                Unstake
              </PsSmallGhostBtn>
            ) : null}
            {hasPending && account ? (
              <PsSmallGhostBtn type="button" onClick={() => requestModal(pool, 'claim')}>
                Claim
              </PsSmallGhostBtn>
            ) : null}
            {showAnalyze ? (
              <PsSmallGhostBtn type="button" onClick={() => setExpanded((v) => !v)}>
                Analyze
              </PsSmallGhostBtn>
            ) : null}
          </>
        )}
      </Footer>
    </Card>
  )
}

export default PoolGridCard
