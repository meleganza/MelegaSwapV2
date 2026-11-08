import React, { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { typography } from '../../tokens'
import { layoutStyles } from '../../primitives'
import { preserveEarlyNavigation } from 'lib/navigation/preserveEarlyNavigation'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaBottomNavMenuItem {
  id: string
  label: string
  href: string
}

export interface MelegaBottomNavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  menu?: MelegaBottomNavMenuItem[]
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
  min-height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding: 4px 4px env(safe-area-inset-bottom, 0px);
  background: #080808;
  backdrop-filter: blur(12px);
  border-top: 1px solid #1f1f1f;
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
  gap: 5px;
  min-height: 48px;
  min-width: 48px;
  padding: 6px 4px;
  text-decoration: none;
  position: relative;
  border-radius: 12px;
  color: ${({ $active }) => ($active ? '#DDB92F' : '#747474')};
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
  background: #ddb92f;
  opacity: 0.9;
`

const Icon = styled.span<{ $active?: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active }) => ($active ? '#DDB92F' : '#747474')};
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
  color: inherit;
`

const MenuButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 48px;
  min-width: 48px;
  padding: 6px 4px;
  border: 0;
  background: transparent;
  position: relative;
  border-radius: 12px;
  color: ${({ $active }) => ($active ? '#DDB92F' : '#747474')};
  cursor: pointer;
`

const MenuPanel = styled.div`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  width: 196px;
  padding: 6px;
  border-radius: 14px;
  background: #101010;
  border: 1px solid #2a2a2a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  z-index: 2;
`

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  color: #f3f3f3;
  text-decoration: none;
  font-size: 14px;
  font-weight: 650;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.05);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid #ddb92f;
  }
`

export const MelegaBottomNavigation: React.FC<MelegaBottomNavigationProps> = ({
  items,
  activeId,
  padding,
  margin,
  disabled,
}) => {
  const router = useRouter()
  const [openId, setOpenId] = useState<string | null>(null)
  const menuId = useId()

  useEffect(() => {
    setOpenId(null)
  }, [router.asPath])

  return (
    <Nav $padding={padding} $margin={margin} aria-label="Main navigation" style={{ opacity: disabled ? 0.45 : 1 }}>
      {items.map((item) => {
        const active = item.id === activeId
        if (item.menu?.length) {
          const open = openId === item.id
          return (
            <MenuButton
              key={item.id}
              type="button"
              $active={active || open}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={`${menuId}-${item.id}`}
              data-testid={`melega-bottom-nav-${item.id}`}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              {(active || open) && <Indicator />}
              <Icon $active={active || open}>{item.icon}</Icon>
              <Label $active={active || open}>{item.label}</Label>
              {open ? (
                <MenuPanel id={`${menuId}-${item.id}`} role="menu" aria-label={item.label}>
                  {item.menu.map((child) => (
                    <MenuLink
                      key={child.id}
                      href={child.href}
                      role="menuitem"
                      prefetch={false}
                      data-testid={`melega-bottom-nav-${item.id}-${child.id}`}
                      onClick={(event) => {
                        setOpenId(null)
                        preserveEarlyNavigation(event, child.href)
                      }}
                    >
                      {child.label}
                    </MenuLink>
                  ))}
                </MenuPanel>
              ) : null}
            </MenuButton>
          )
        }
        return (
          <Item
            key={item.id}
            href={disabled ? '#' : item.href}
            $active={active}
            aria-current={active ? 'page' : undefined}
            data-testid={`melega-bottom-nav-${item.id}`}
            prefetch={false}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault()
                return
              }
              preserveEarlyNavigation(event, item.href)
            }}
          >
            {active && <Indicator />}
            <Icon $active={active}>{item.icon}</Icon>
            <Label $active={active}>{item.label}</Label>
          </Item>
        )
      })}
    </Nav>
  )
}

export default MelegaBottomNavigation
