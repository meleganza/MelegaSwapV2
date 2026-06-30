import styled from 'styled-components'
import { Box } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

const Card = styled(Box)<{
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
}>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1.25rem'};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius ?? tokens.radiusSm};
  background-color: ${tokens.surfaceSecondary};
`
export default Card

export const LightCard = styled(Card)`
  border: 1px solid ${tokens.border};
  background-color: ${tokens.surfaceSecondary};
`

export const LightGreyCard = styled(Card)`
  border: 1px solid ${tokens.border};
  background-color: ${tokens.surface};
`

export const GreyCard = styled(Card)`
  border: 1px solid ${tokens.border};
  background-color: ${tokens.surfaceSecondary};
`
