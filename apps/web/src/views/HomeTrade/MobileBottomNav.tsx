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
  background: #000000;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;

  @media (min-width: 1024px) {
    display: none;
  }
`

const Item = styled(Link)<{ $active?: boolean }>`
  flex: 1;
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-decoration: none;
  position: relative;
  padding-top: 8px;
  color: ${({ $active }) => ($active ? ht.gold : ht.textNavInactive)};
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;

  svg {
    width: 22px;
    height: 22px;
  }
`

const Label = styled.span`
  font-family: ${ht.fontBody};
  font-size: 11px;
  font-weight: 500;
`

const TradeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 10l3-3 3 3M17 14l-3 3-3-3" />
  </svg>
)

const EarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="14" r="4" />
    <circle cx="15" cy="10" r="4" />
  </svg>
)

const FindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M14 10l-2 6-2-6 6-2z" />
  </svg>
)

const BuildIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
  </svg>
)

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="7" width="16" height="12" rx="2" />
    <path d="M16 12h4v4h-4z" />
  </svg>
)

const items = [
  { href: '/', label: 'Trade', Icon: TradeIcon },
  { href: '/farms', label: 'Earn', Icon: EarnIcon },
  { href: '/projects', label: 'Find', Icon: FindIcon },
  { href: '/launch', label: 'Build', Icon: BuildIcon },
  { href: '/workspace', label: 'Portfolio', Icon: PortfolioIcon },
]

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useRouter()

  return (
    <Nav aria-label="Main">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        const IconComponent = item.Icon
        return (
          <Item key={item.label} href={item.href} $active={active}>
            {active && <Indicator />}
            <Icon>
              <IconComponent />
            </Icon>
            <Label>{item.label}</Label>
          </Item>
        )
      })}
    </Nav>
  )
}

export default MobileBottomNav
