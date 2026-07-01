import React from 'react'
import styled from 'styled-components'
import { colors } from 'design-system/melega'

const Shell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Token = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1.1;
`

const Arrow = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gold};
  font-size: 18px;
  line-height: 1;
`

export interface TradePairHeaderProps {
  inputSymbol: string
  outputSymbol: string
}

export const TradePairHeader: React.FC<TradePairHeaderProps> = ({ inputSymbol, outputSymbol }) => (
  <Shell data-trade-pair-header aria-label={`Trading pair ${inputSymbol} to ${outputSymbol}`}>
    <Token>{inputSymbol}</Token>
    <Arrow aria-hidden>↓</Arrow>
    <Token>{outputSymbol}</Token>
  </Shell>
)

export default TradePairHeader
