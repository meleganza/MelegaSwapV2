import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaBottomNavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

export interface MelegaBottomNavigationProps extends MelegaLayoutProps {
  items: MelegaBottomNavItem[]
  activeId?: string
}

const Nav = styled.nav<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(78px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: ${colors.canvas};
  border-top: 1px solid ${colors.borderStrong};
  z-index: 200;
  box-shadow: none;

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Item = styled.a<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing[1]};
  text-decoration: none;
  position: relative;
  padding-top: ${spacing[2]};
  color: ${({ $active }) => ($active ? colors.gold : colors.textSecondary)};
`

const Indicator = styled.div`
  position: absolute;
  top: 0;
  width: 56px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: ${colors.gold};
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
  }
`

const Label = styled.span`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
`

export const MelegaBottomNavigation: React.FC<MelegaBottomNavigationProps> = ({
  items,
  activeId,
  padding,
  margin,
  disabled,
}) => (
  <Nav $padding={padding} $margin={margin} aria-label="Main navigation" style={{ opacity: disabled ? 0.45 : 1 }}>
    {items.map((item) => {
      const active = item.id === activeId
      return (
        <Item key={item.id} href={disabled ? '#' : item.href} $active={active} aria-current={active ? 'page' : undefined}>
          {active && <Indicator />}
          <Icon>{item.icon}</Icon>
          <Label>{item.label}</Label>
        </Item>
      )
    })}
  </Nav>
)

export default MelegaBottomNavigation
