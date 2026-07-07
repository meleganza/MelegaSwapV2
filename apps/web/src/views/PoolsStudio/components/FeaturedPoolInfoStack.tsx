import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const InfoCard = styled.div`
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.border};
  background: rgba(255, 255, 255, 0.02);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CardTitle = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

const CardValue = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
  line-height: 1.1;
`

const SubValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${poolsStudioColors.secondary};
`

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${poolsStudioColors.aprGreen};
  border-radius: 999px;
  transition: width 250ms ease-in-out;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: ${poolsStudioColors.secondary};

  strong {
    color: ${poolsStudioColors.text};
    font-weight: 700;
  }
`

const RiskValue = styled.span<{ $risk: string }>`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $risk }) =>
    $risk === 'Very Low' || $risk === 'Low'
      ? poolsStudioColors.aprGreen
      : $risk === 'Medium'
        ? poolsStudioColors.gold
        : poolsStudioColors.red};
`

export const FeaturedPoolInfoStack: React.FC = () => {
  const { featured } = usePoolsRuntime()
  const card = featured.card
  const remainingPct = featured.remainingRewardsPct ?? 0

  return (
    <Stack data-ps-featured-info-stack>
      <InfoCard>
        <CardTitle>Reward Budget</CardTitle>
        <CardValue>{card?.rewardBudgetUsd ?? '—'}</CardValue>
        <ProgressBar>
          <ProgressFill $pct={remainingPct} />
        </ProgressBar>
        <SubValue>{remainingPct > 0 ? `${Math.round(remainingPct)}% Remaining` : 'Emission active'}</SubValue>
      </InfoCard>

      <InfoCard>
        <CardTitle>Distribution</CardTitle>
        <Row>
          <span>Today&apos;s rewards</span>
          <strong>{featured.estimatedDailyReward}</strong>
        </Row>
        <Row>
          <span>Weekly rewards</span>
          <strong>{card?.weeklyRewards ?? '—'}</strong>
        </Row>
        <Row>
          <span>Monthly rewards</span>
          <strong>{card?.monthlyRewards ?? '—'}</strong>
        </Row>
      </InfoCard>

      <InfoCard>
        <CardTitle>Pool Safety</CardTitle>
        <Row>
          <span>Risk</span>
          <RiskValue $risk={card?.poolSafetyRisk ?? 'Medium'}>{card?.poolSafetyRisk ?? 'Medium'}</RiskValue>
        </Row>
      </InfoCard>

      <InfoCard>
        <CardTitle>Lock Summary</CardTitle>
        <Row>
          <span>Lock</span>
          <strong>{featured.lockPeriod}</strong>
        </Row>
        <Row>
          <span>Auto Compound</span>
          <strong>{card?.analyzePreview?.autoCompound ?? '—'}</strong>
        </Row>
        <Row>
          <span>Cooldown</span>
          <strong>{featured.cooldown}</strong>
        </Row>
      </InfoCard>
    </Stack>
  )
}

export default FeaturedPoolInfoStack
