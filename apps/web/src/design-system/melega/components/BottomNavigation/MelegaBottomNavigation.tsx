import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
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
  align-items: stretch;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: calc(56px + env(safe-area-inset-bottom, 0px));
  padding: 6px 4px env(safe-area-inset-bottom, 0px);
  background: rgba(5, 5, 5, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 200;
  box-shadow: none;

  /* DS001.2 — desktop global header from 1024px; keep bottom nav for tablet/mobile. */
  @media (min-width: 1024px) {
    display: none;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Item = styled.a<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 48px;
  min-width: 48px;
  padding: 6px 4px;
  text-decoration: none;
  position: relative;
  border-radius: 12px;
  color: ${({ $active }) => ($active ? colors.textPrimary : colors.textSecondary)};
  transition: color 160ms ease, background 160ms ease;

  &:active {
    background: rgba(255, 255, 255, 0.04);
  }
`

const Indicator = styled.div`
  position: absolute;
  top: 2px;
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: ${colors.gold};
  opacity: 0.9;
`

const Icon = styled.span<{ $active?: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? colors.gold : 'inherit')};
  transition: color 160ms ease;

  svg {
    width: 24px;
    height: 24px;
  }
`

const Label = styled.span<{ $active?: boolean }>`
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? typography.fontWeight.semibold : typography.fontWeight.medium)};
  letter-spacing: 0.01em;
  line-height: 1;
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
          <Icon $active={active}>{item.icon}</Icon>
          <Label $active={active}>{item.label}</Label>
        </Item>
      )
    })}
  </Nav>
)

export default MelegaBottomNavigation
