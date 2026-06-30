import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { media } from '../../theme'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaHeaderProps extends MelegaLayoutProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

const Bar = styled.header<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[3]};
  min-height: 48px;
  background: ${colors.canvas};
  box-shadow: none;

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}

  ${media.mobile} {
    min-height: 50px;
  }
`

const Slot = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  min-width: 0;
`

const Center = styled(Slot)`
  flex: 1;
  justify-content: center;
`

export const MelegaHeader: React.FC<MelegaHeaderProps> = ({
  left,
  center,
  right,
  padding,
  margin,
  mobile,
  desktop,
}) => (
  <Bar
    $padding={padding}
    $margin={margin}
    data-melega-header
    data-mobile={mobile || undefined}
    data-desktop={desktop || undefined}
  >
    <Slot>{left}</Slot>
    {center && <Center>{center}</Center>}
    <Slot>{right}</Slot>
  </Bar>
)

export default MelegaHeader
