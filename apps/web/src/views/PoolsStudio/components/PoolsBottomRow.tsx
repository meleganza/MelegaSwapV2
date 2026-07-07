import React from 'react'
import styled from 'styled-components'
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
  height: ${poolsStudioLayout.bottomPanelHeight};
  min-height: ${poolsStudioLayout.bottomPanelHeight};
  max-height: ${poolsStudioLayout.bottomPanelHeight};
  padding: 20px;
  border-radius: 18px;
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.card};
  box-sizing: border-box;
  overflow: hidden;
`

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.text};
`

const Line = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${poolsStudioColors.subtitle};
`

export const PoolsBottomRow: React.FC = () => {
  const { terminal, analytics } = usePoolsRuntime()
  const activity = terminal.activityRows?.[0]

  return (
    <Row data-ps-bottom-panels>
      <Panel data-ps-activity-panel>
        <Title>Recent Pool Activity</Title>
        <Line>
          {activity
            ? `${activity.time} · ${activity.pool} · ${activity.action}`
            : 'No recent pool activity yet.'}
        </Line>
      </Panel>
      <Panel data-ps-emission-panel>
        <Title>Rewards Emission Live</Title>
        <Line>
          Top reward token {analytics.topRewardToken.symbol} · {analytics.topRewardToken.pct} of pools
        </Line>
      </Panel>
      <Panel data-ps-staked-panel>
        <Title>Most Staked Pool</Title>
        <Line>
          {analytics.topStakedPool.name} · {analytics.topStakedPool.tvl}
        </Line>
      </Panel>
    </Row>
  )
}

export default PoolsBottomRow
