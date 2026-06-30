import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import { HumanPageHeader } from './HumanPageHeader'
import { HumanLiquidityNav } from './HumanLiquidityNav'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: ${tokens.contentMaxWidth};
  margin: 0 auto 24px;
  padding: 0 16px;
`

export const HumanLiquidityChrome: React.FC = () => (
  <Wrap>
    <HumanPageHeader
      title="Liquidity"
      subtitle="Add or remove liquidity from supported pools."
      primaryAction={{ href: '/add', label: 'Add liquidity' }}
    />
    <HumanLiquidityNav />
  </Wrap>
)

export default HumanLiquidityChrome
