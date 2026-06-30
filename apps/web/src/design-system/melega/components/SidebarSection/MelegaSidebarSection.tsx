import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaSidebarSectionProps extends MelegaLayoutProps {
  label: string
  children: React.ReactNode
}

const Section = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  margin-top: ${spacing[6]};

  &:first-child {
    margin-top: 0;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Label = styled.div`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${colors.textMuted};
  margin-bottom: ${spacing[2]};
  padding: 0 2px;
`

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[1]};
`

export const MelegaSidebarSection: React.FC<MelegaSidebarSectionProps> = ({
  label,
  children,
  padding,
  margin,
}) => (
  <Section $padding={padding} $margin={margin}>
    <Label>{label}</Label>
    <Items>{children}</Items>
  </Section>
)

export default MelegaSidebarSection
