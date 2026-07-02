import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { DEFAULT_POOL_ANALYZE } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { PoolTokenIcon, PsMetricLabel, PsMetricValue, PsSmallGhostBtn, PsSmallPrimaryBtn } from './poolsStudioPrimitives'

const Card = styled.article<{ $expanded?: boolean }>`
  position: relative;
  height: ${({ $expanded }) =>
    $expanded ? poolsStudioLayout.poolCardHeightExpanded : poolsStudioLayout.poolCardHeight};
  min-height: ${poolsStudioLayout.poolCardHeight};
  padding: 18px;
  padding-bottom: 64px;
  border-radius: 18px;
  background: ${poolsStudioColors.card};
  border: 1px solid ${poolsStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  transition: height 250ms ease, border-color 150ms ease, transform 150ms ease, background 150ms ease;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${poolsStudioLayout.poolCardHeight};
    padding-bottom: 18px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const Icons = styled.div`
  display: flex;
  align-items: center;
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
        : $status === 'coming-soon'
          ? 'rgba(255,255,255,0.16)'
          : poolsStudioColors.green};
  color: ${({ $status }) =>
    $status === 'indexing'
      ? poolsStudioColors.gold
      : $status === 'coming-soon'
        ? poolsStudioColors.muted
        : poolsStudioColors.green};
  background: ${({ $status }) =>
    $status === 'indexing' ? poolsStudioColors.previewBadgeBg : $status === 'coming-soon' ? 'rgba(255,255,255,0.04)' : 'rgba(0,230,118,0.08)'};
`

const Apr = styled.div<{ $status: PoolPreviewCard['status'] }>`
  margin-top: 10px;
  font-size: ${({ $status }) =>
    $status === 'indexing' ? '36px' : $status === 'coming-soon' ? '34px' : '44px'};
  font-weight: 800;
  line-height: 1;
  color: ${({ $status }) =>
    $status === 'indexing'
      ? poolsStudioColors.gold
      : $status === 'coming-soon'
        ? poolsStudioColors.muted
        : poolsStudioColors.green};
`

const AprLabel = styled.div`
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

const Metrics = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 8px;
  column-gap: 18px;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

const AnalyzeBlock = styled.div`
  margin-top: 10px;
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

const BtnRow = styled.div`
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  height: 40px;
  display: flex;
  gap: 10px;

  @media (max-width: 767px) {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    margin-top: 16px;
  }
`

const ComingSoonPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: ${poolsStudioColors.muted};
  font-size: 13px;
  font-weight: 700;
`

interface Props {
  pool: PoolPreviewCard
}

export const PoolGridCard: React.FC<Props> = ({ pool }) => {
  const [expanded, setExpanded] = useState(false)
  const preview = pool.analyzePreview ?? DEFAULT_POOL_ANALYZE
  const showStake = pool.cta === 'stake'
  const showAnalyze = pool.cta === 'stake' || pool.cta === 'analyze'
  const comingSoon = pool.cta === 'none'

  return (
    <Card data-ps-pool-card $expanded={expanded}>
      <TopRow>
        <NameBlock>
          <Icons>
            {pool.tokens.map((token, i) => (
              <PoolTokenIcon key={token} symbol={token} offset={i > 0} />
            ))}
          </Icons>
          <PoolName>{pool.name}</PoolName>
        </NameBlock>
        <StatusPill $status={pool.status}>
          {pool.status === 'live' ? 'LIVE' : pool.status === 'indexing' ? 'INDEXING' : 'COMING SOON'}
        </StatusPill>
      </TopRow>

      <Apr $status={pool.status}>
        {pool.status === 'coming-soon' ? 'Coming soon' : pool.apr ?? '—'}
      </Apr>
      <AprLabel>APR</AprLabel>

      <Metrics>
        <MetricCell>
          <PsMetricLabel>TVL</PsMetricLabel>
          <PsMetricValue>{pool.tvl}</PsMetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Liquidity</PsMetricLabel>
          <PsMetricValue>{pool.liquidity}</PsMetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Reward Token</PsMetricLabel>
          <PsMetricValue>{pool.rewardToken}</PsMetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Daily Rewards</PsMetricLabel>
          <PsMetricValue>{pool.dailyRewards}</PsMetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Multiplier</PsMetricLabel>
          <PsMetricValue>{pool.multiplier}</PsMetricValue>
        </MetricCell>
        <MetricCell>
          <PsMetricLabel>Participants</PsMetricLabel>
          <PsMetricValue>{pool.participants}</PsMetricValue>
        </MetricCell>
      </Metrics>

      {expanded ? (
        <AnalyzeBlock>
          <AnalyzeItem>
            APR History<span>{preview.aprHistory}</span>
          </AnalyzeItem>
          <AnalyzeItem>
            Reward Token<span>{preview.rewardToken}</span>
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

      <BtnRow>
        {comingSoon ? (
          <ComingSoonPill>Coming Soon</ComingSoonPill>
        ) : (
          <>
            {showStake ? <PsSmallPrimaryBtn type="button">Stake</PsSmallPrimaryBtn> : null}
            {showAnalyze ? (
              <PsSmallGhostBtn type="button" onClick={() => setExpanded((v) => !v)}>
                Analyze
              </PsSmallGhostBtn>
            ) : null}
          </>
        )}
      </BtnRow>
    </Card>
  )
}

export default PoolGridCard
