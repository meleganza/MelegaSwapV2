import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { typography } from '../../tokens'
import { layoutStyles } from '../../primitives'
import { preserveEarlyNavigation } from 'lib/navigation/preserveEarlyNavigation'
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
  min-height: calc(72px + env(safe-area-inset-bottom, 0px));
  padding: 8px 8px calc(6px + env(safe-area-inset-bottom, 0px));
  background: #f7f6f2;
  border-top: 1px solid #efede6;
  z-index: 200;
  box-shadow: none;

  /* DS001.2 — desktop global header from 1024px; keep bottom nav for tablet/mobile. */
  @media (min-width: 1024px) {
    display: none;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Item = styled(Link)<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  min-width: 48px;
  padding: 6px 4px;
  text-decoration: none;
  position: relative;
  border-radius: 16px;
  background: ${({ $active }) => ($active ? '#FFF6D6' : 'transparent')};
  color: ${({ $active }) => ($active ? '#E9B10F' : '#72736E')};
  transition: color 160ms ease, background 160ms ease;

  &:active {
    background: #f0eee7;
  }
`

const Icon = styled.span<{ $active?: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? '#E9B10F' : '#72736E')};
  transition: color 160ms ease;

  svg {
    width: 26px;
    height: 26px;
  }
`

const Label = styled.span<{ $active?: boolean }>`
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? typography.fontWeight.semibold : typography.fontWeight.medium)};
  letter-spacing: 0.01em;
  line-height: 1;
  color: inherit;
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
        <Item
          key={item.id}
          href={disabled ? '#' : item.href}
          $active={active}
          aria-current={active ? 'page' : undefined}
          prefetch={false}
          onClick={(event) => {
            if (disabled) {
              event.preventDefault()
              return
            }
            preserveEarlyNavigation(event, item.href)
          }}
        >
          <Icon $active={active}>{item.icon}</Icon>
          <Label $active={active}>{item.label}</Label>
        </Item>
      )
    })}
  </Nav>
)

export default MelegaBottomNavigation
