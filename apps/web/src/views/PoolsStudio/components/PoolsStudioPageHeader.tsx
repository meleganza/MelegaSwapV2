import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { POOLS_STUDIO_PREVIEW_LABEL, poolsStudioColors } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PsPreviewBadge, PsPrimaryBtn } from './poolsStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: Orbitron, ${({ theme }) => theme?.fontFamily || 'sans-serif'};
  font-size: 40px;
  font-weight: 800;
  line-height: 42px;
  color: ${poolsStudioColors.text};
  letter-spacing: 0.02em;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: ${poolsStudioColors.subtitle};
  max-width: 560px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 100%;
    flex-direction: column;
  }
`

const LiveBadge = styled(PsPreviewBadge)`
  border-color: ${poolsStudioColors.green};
  color: ${poolsStudioColors.green};
  background: rgba(0, 230, 118, 0.08);
`

export const PoolsStudioPageHeader: React.FC = () => (
  <div data-ps-page-header>
    <Row>
      <Left>
        <Title>POOLS</Title>
        <Subtitle>Stake assets, distribute rewards and build long-term communities.</Subtitle>
      </Left>
      <Right>
        <LiveBadge>LIVE RUNTIME</LiveBadge>
        <PsPrimaryBtn as={Link} to="/build-studio?intent=staking-pool" type="button">
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Create Pool
        </PsPrimaryBtn>
      </Right>
    </Row>
  </div>
)

export default PoolsStudioPageHeader
