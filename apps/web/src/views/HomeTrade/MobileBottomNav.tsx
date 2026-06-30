import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Nav = styled.nav`
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(78px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(0, 0, 0, 0.94);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;

  @media (min-width: 1024px) {
    display: none;
  }
`

const Item = styled(Link)<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  position: relative;
  padding-top: 6px;
  color: ${({ $active }) => ($active ? ht.gold : '#bdbdbd')};
`

const Indicator = styled.div`
  position: absolute;
  top: 0;
  width: 56px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: ${ht.gold};
`

const Icon = styled.span`
  font-size: 22px;
  line-height: 1;
`

const Label = styled.span`
  font-family: ${ht.fontBody};
  font-size: 12px;
  font-weight: 500;
`

const items = [
  { href: '/', label: 'Trade', icon: '⇅' },
  { href: '/farms', label: 'Earn', icon: '◎' },
  { href: '/projects', label: 'Find', icon: '⌖' },
  { href: '/launch', label: 'Build', icon: '↑' },
  { href: '/workspace', label: 'Portfolio', icon: '▣' },
]

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useRouter()

  return (
    <Nav aria-label="Main">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Item key={item.label} href={item.href} $active={active}>
            {active && <Indicator />}
            <Icon>{item.icon}</Icon>
            <Label>{item.label}</Label>
          </Item>
        )
      })}
    </Nav>
  )
}

export default MobileBottomNav
