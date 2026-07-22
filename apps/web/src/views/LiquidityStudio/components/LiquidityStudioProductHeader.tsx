import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ds001FontFamily } from 'design-system/melega/tokens/ds001'
import type { LiquidityStudioMode } from '../liquidityRuntime/liquidityStudioView'
import { IconArrowLeft } from './LiquidityStudioIcons'

const Row = styled.div`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const Back = styled(Link)`
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b5b5b5;
  font-family: ${ds001FontFamily.sans};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  background: transparent;

  &:hover {
    color: #ffffff;
    background: #141414;
  }

  &:focus-visible {
    outline: 2px solid #f4c430;
    outline-offset: 3px;
  }
`

const ProductTitle = styled.h1`
  margin: 0;
  font-family: ${ds001FontFamily.sans};
  font-size: 28px;
  line-height: 34px;
  font-weight: 600;
  color: #ffffff;
`

const TITLES: Record<LiquidityStudioMode, string> = {
  'My Positions': 'My Positions',
  'Add Liquidity': 'Add Liquidity',
  'Remove Liquidity': 'Remove Liquidity',
  'Liquidity Building': 'Liquidity Building',
  Simulation: 'Simulation',
}

interface Props {
  mode: LiquidityStudioMode
}

const LiquidityStudioProductHeader: React.FC<Props> = ({ mode }) => (
  <div data-testid="ls-product-header" data-ls-product-mode={mode}>
    <Row>
      <Back href="/liquidity-studio" data-testid="ls-back-to-studio">
        <IconArrowLeft size={16} />
        Back to Liquidity Studio
      </Back>
    </Row>
    <ProductTitle>{TITLES[mode]}</ProductTitle>
  </div>
)

export default LiquidityStudioProductHeader
