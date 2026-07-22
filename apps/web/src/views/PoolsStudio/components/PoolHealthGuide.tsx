import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Title = styled.h3`
  margin: 0 0 6px;
  font-family: Sora, sans-serif;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
`

const Text = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 16px;
  color: #a9a9a9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const LearnLink = styled(Link)`
  font-size: 12px;
  font-weight: 600;
  color: #f4c542;
  text-decoration: none;
`

export const PoolHealthGuide: React.FC<{ compact?: boolean }> = () => (
  <div data-ps-pool-health-guide>
    <Title>How Pool Health Works</Title>
    <Text>
      Pool Health scores reward budget, remaining emission, contract activity, and APR sustainability. Higher scores
      indicate stronger staking lanes.
    </Text>
    <LearnLink to="/pools#pool-health">Learn more →</LearnLink>
  </div>
)

export default PoolHealthGuide
