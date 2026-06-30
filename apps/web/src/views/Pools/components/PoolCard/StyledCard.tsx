import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

export const StyledCard = styled(Card)<{ isFinished?: boolean }>`
  max-width: 352px;
  width: calc(100% - 16px);
  margin: 0 8px 24px;
  display: flex;
  border-radius: ${tokens.radius};
  border: 1px solid ${tokens.border};
  background: ${tokens.surface};
  flex-direction: column;
  align-self: baseline;
  position: relative;
  color: ${({ isFinished, theme }) => theme.colors[isFinished ? 'textDisabled' : 'secondary']};
  box-shadow: none;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    margin: 0 12px 32px;
  }
`

export default StyledCard
