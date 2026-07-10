import React from 'react'
import styled from 'styled-components'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${poolsStudioLayout.cardGap};

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.div`
  min-height: ${poolsStudioLayout.bottomPanelHeight};
  padding: 20px;
  border-radius: 18px;
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.card};
  box-sizing: border-box;
  overflow: auto;
`

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: ${poolsStudioColors.text};
`

const Line = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${poolsStudioColors.subtitle};
`

export const PoolsBottomRow: React.FC = () => {
  const { terminal, analytics } = usePoolsRuntime()
  const activity = terminal.activityRows?.[0]

  const activityLine = activity
    ? `${activity.time} · ${activity.pool} · ${activity.action}`
    : RUNTIME_UNAVAILABLE_LABEL

  const emissionLine =
    analytics.topRewardToken.symbol && analytics.topRewardToken.pct
      ? `Top reward token ${analytics.topRewardToken.symbol} · ${analytics.topRewardToken.pct} of pools`
      : RUNTIME_UNAVAILABLE_LABEL

  const stakedLine =
    analytics.topStakedPool.name && analytics.topStakedPool.tvl
      ? `${analytics.topStakedPool.name} · ${analytics.topStakedPool.tvl}`
      : RUNTIME_UNAVAILABLE_LABEL

  return (
    <Row data-ps-bottom-panels>
      <Panel data-ps-activity-panel>
        <Title>Recent Pool Activity</Title>
        <Line>{activityLine}</Line>
      </Panel>
      <Panel data-ps-emission-panel>
        <Title>Rewards Emission Live</Title>
        <Line>{emissionLine}</Line>
      </Panel>
      <Panel data-ps-staked-panel>
        <Title>Most Staked Pool</Title>
        <Line>{stakedLine}</Line>
      </Panel>
    </Row>
  )
}

export default PoolsBottomRow
