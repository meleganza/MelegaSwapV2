import React from 'react'
import styled from 'styled-components'
import AIRewardAdvisorPanel from './AIRewardAdvisorPanel'
import PoolHealthGuide from './PoolHealthGuide'
import StakeDonutChart from './StakeDonutChart'

const Stack = styled.aside`
  width: 340px;
  flex-shrink: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1099px) {
    width: 100%;
  }
`

const SidebarCard = styled.div`
  width: 340px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #141414;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 1099px) {
    width: 100%;
  }
`

const AdvisorCard = styled(SidebarCard)`
  height: 260px;
  min-height: 260px;
  max-height: 260px;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid #262626;
  overflow: visible;

  @media (max-width: 767px) {
    height: auto;
    min-height: 0;
    max-height: none;
  }
`

const HealthCard = styled(SidebarCard)`
  height: 150px;
  min-height: 150px;
  max-height: 150px;
`

const DonutCard = styled(SidebarCard)`
  height: 220px;
  min-height: 220px;
  max-height: 220px;
  display: flex;
  flex-direction: column;
`

const DonutTitle = styled.h3`
  margin: 0 0 10px;
  font-family: Orbitron, sans-serif;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
`

export const PoolsSidebar: React.FC = () => (
  <Stack data-ps-sidebar>
    <AdvisorCard data-ps-advisor-wrap data-r716-advisor-wrap>
      <AIRewardAdvisorPanel embedded compact />
    </AdvisorCard>
    <HealthCard data-ps-health-guide>
      <PoolHealthGuide compact />
    </HealthCard>
    <DonutCard data-ps-reward-pie>
      <DonutTitle>Total Reward Tokens Live</DonutTitle>
      <StakeDonutChart compact />
    </DonutCard>
  </Stack>
)

export default PoolsSidebar
