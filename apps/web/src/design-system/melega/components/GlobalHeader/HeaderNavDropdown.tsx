import React, { useCallback, useEffect, useId, useRef } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { ds001Colors, ds001Layout } from '../../tokens/ds001'
import type { HeaderDropdownItem } from 'app-shell/config/globalHeaderNav'
import { moreItemIcon } from './HeaderIcons'

const openAnim = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`

const Panel = styled.div<{ $width: number }>`
  position: absolute;
  top: 58px;
  left: 0;
  width: ${({ $width }) => $width}px;
  padding: 8px;
  border-radius: ${ds001Layout.headerDropdownRadius};
  background: rgba(18, 18, 18, 0.98);
  border: 1px solid ${ds001Colors.border};
  box-shadow: ${ds001Layout.headerDropdownShadow};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: ${ds001Layout.headerDropdownZIndex};
  transform-origin: top left;
  animation: ${openAnim} 140ms cubic-bezier(0.2, 0.8, 0.2, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Item = styled.a<{ $active?: boolean }>`
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: ${({ $active }) => ($active ? ds001Colors.primaryGold : '#D4D4D4')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.10)' : 'transparent')};
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  text-decoration: none;
  box-sizing: border-box;

  &:hover,
  &:focus-visible {
    background: #1a1a1a;
    color: #ffffff;
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${ds001Colors.primaryGold};
    outline-offset: 2px;
  }
`

const ItemLeft = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Badge = styled.span`
  height: 18px;
  min-width: 34px;
  padding: 0 7px;
  border-radius: 999px;
  background: ${ds001Colors.primaryGold};
  color: ${ds001Colors.background};
  font-size: 9px;
  line-height: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
`

export interface HeaderNavDropdownProps {
  items: HeaderDropdownItem[]
  width: number
  pathname: string
  query: Record<string, string | string[] | undefined>
  onClose: () => void
  onNavigate: () => void
  showIcons?: boolean
}

const HeaderNavDropdown: React.FC<HeaderNavDropdownProps> = ({
  items,
  width,
  pathname,
  query,
  onClose,
  onNavigate,
  showIcons = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const focusItem = useCallback((index: number) => {
    const nodes = panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-header-menu-item]')
    nodes?.[index]?.focus()
  }, [])

  useEffect(() => {
    focusItem(0)
  }, [focusItem])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      const nodes = panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-header-menu-item]')
      if (!nodes?.length) return
      const current = Array.from(nodes).indexOf(document.activeElement as HTMLAnchorElement)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusItem(current < 0 ? 0 : (current + 1) % nodes.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusItem(current < 0 ? nodes.length - 1 : (current - 1 + nodes.length) % nodes.length)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [focusItem, onClose])

  return (
    <Panel
      ref={panelRef}
      role="menu"
      id={listId}
      $width={width}
      data-testid="melega-header-dropdown"
    >
      {items.map((item) => {
        const active = item.match?.(pathname, query) ?? false
        return (
          <Link key={item.id} href={item.href} passHref legacyBehavior>
            <Item
              role="menuitem"
              data-header-menu-item
              data-testid={`melega-header-menu-${item.id}`}
              $active={active}
              onClick={onNavigate}
            >
              <ItemLeft>
                {showIcons ? moreItemIcon(item.id) : null}
                <span>{item.label}</span>
              </ItemLeft>
              {item.badge === 'NEW' ? <Badge>NEW</Badge> : null}
            </Item>
          </Link>
        )
      })}
    </Panel>
  )
}

export default HeaderNavDropdown
