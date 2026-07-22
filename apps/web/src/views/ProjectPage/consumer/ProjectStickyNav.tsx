import React from 'react'
import styled from 'styled-components'
import { CANVAS, CARD_BORDER, GOLD, MUTED } from './theme'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'buy', label: 'Buy' },
  { id: 'about', label: 'About' },
  { id: 'community', label: 'Community' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'earn', label: 'Earn' },
  { id: 'more', label: 'More' },
] as const

const NavBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 -16px;
  padding: 8px 16px calc(8px + env(safe-area-inset-top, 0px));
  background: ${CANVAS};
  border-bottom: 1px solid ${CARD_BORDER};
`

const ScrollRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const NavLink = styled.a`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${CARD_BORDER};
  color: ${MUTED};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: ${GOLD};
    border-color: rgba(244, 196, 48, 0.45);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${GOLD};
    outline-offset: 2px;
  }
`

const ProjectStickyNav: React.FC = () => (
  <NavBar aria-label="Project page sections">
    <ScrollRow role="list">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          href={`#${item.id}`}
          role="listitem"
          aria-label={`Jump to ${item.label}`}
        >
          {item.label}
        </NavLink>
      ))}
    </ScrollRow>
  </NavBar>
)

export default ProjectStickyNav
