import React from 'react'
import styled from 'styled-components'
import { trendingStudioColors } from '../trendingStudioTokens'
import { TrGhostBtn } from './trendingStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.05;
  color: ${trendingStudioColors.white};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: ${trendingStudioColors.gray};
  max-width: 640px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
`

const LivePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px;
  border-radius: 21px;
  border: 1px solid ${trendingStudioColors.border};
  font-size: 14px;
  font-weight: 700;
  color: ${trendingStudioColors.gray};
  white-space: nowrap;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${trendingStudioColors.green};
    box-shadow: 0 0 8px ${trendingStudioColors.green};
  }
`

export const TrendingStudioPageHeader: React.FC = () => (
  <div data-tr-page-header>
    <Row>
      <Left>
        <Title>TRENDING</Title>
        <Subtitle>Discover the fastest growing crypto opportunities ranked by Melega AI.</Subtitle>
      </Left>
      <Right>
        <TrGhostBtn type="button" style={{ whiteSpace: 'nowrap' }}>
          ✦ AI Discovery Engine
        </TrGhostBtn>
        <LivePill>Updated every minute</LivePill>
      </Right>
    </Row>
  </div>
)

export default TrendingStudioPageHeader
