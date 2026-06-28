import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'

const Nav = styled.nav`
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  border-top: 1px solid ${cmd.border};
  background: rgba(0, 0, 0, 0.96);
  backdrop-filter: blur(12px);
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom));

  @media (min-width: 1025px) {
    display: none;
  }
`

const Item = styled(Link)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 2px;
  font-family: ${cmd.fontDisplay};
  font-size: 8px;
  letter-spacing: 0.08em;
  color: ${cmd.textSecondary};
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
    color: ${cmd.gold};
  }
`

const LINKS = [
  { href: '/projects', key: 'Projects' },
  { href: '/assets', key: 'Assets' },
  { href: '/venues', key: 'Venues' },
  { href: '/events', key: 'Events' },
  { href: '/graph', key: 'Graph' },
  { href: '/query', key: 'Query' },
] as const

const MobileBottomNav: React.FC = () => {
  const { t } = useCommandTranslation()

  return (
    <Nav>
      {LINKS.map(({ href, key }) => (
        <Item key={href} href={href}>
          {t(key)}
        </Item>
      ))}
    </Nav>
  )
}

export default MobileBottomNav
