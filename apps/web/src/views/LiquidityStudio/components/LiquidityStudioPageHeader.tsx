import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors } from '../liquidityStudioTokens'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  min-width: 0;
`

const Left = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  color: #a8a8a8;
  max-width: 640px;
`

const Badge = styled.span`
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.goldBright};
  background: ${liquidityStudioColors.previewBadge};
  border: 1px solid rgba(212, 175, 55, 0.28);
`

export const LiquidityStudioPageHeader: React.FC = () => (
  <Row data-ls-page-header>
    <Left>
      <Title>Liquidity Studio</Title>
      <Subtitle>Build markets, manage liquidity and optimise LP performance.</Subtitle>
    </Left>
    <Badge>Preview Layout</Badge>
  </Row>
)

export default LiquidityStudioPageHeader
