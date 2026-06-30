import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { media } from '../../theme'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaFooterProps extends MelegaLayoutProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

const Bar = styled.footer<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[4]};
  padding: ${spacing[6]} 0;
  border-top: 1px solid ${colors.border};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  box-shadow: none;

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}

  ${media.mobile} {
    flex-direction: column;
    align-items: flex-start;
    padding: ${spacing[4]} 0 ${spacing[12]};
  }
`

const Slot = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[4]};
`

export const MelegaFooter: React.FC<MelegaFooterProps> = ({ left, center, right, padding, margin }) => (
  <Bar $padding={padding} $margin={margin}>
    <Slot>{left}</Slot>
    <Slot>{center}</Slot>
    <Slot>{right}</Slot>
  </Bar>
)

export default MelegaFooter
