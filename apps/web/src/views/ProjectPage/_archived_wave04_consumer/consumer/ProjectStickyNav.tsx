import React from 'react'
import styled from 'styled-components'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'

/** Canonical Project Page internal navigation (UX rebuild). */
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'markets', label: 'Markets' },
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'farms', label: 'Farms' },
  { id: 'pools', label: 'Pools' },
  { id: 'about', label: 'About' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'community', label: 'Community' },
] as const

const NavBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 -16px;
  padding: 8px 16px calc(8px + env(safe-area-inset-top, 0px));
  background: ${uxRebuildColors.pageBg};
  border-bottom: 1px solid ${uxRebuildColors.border};
  font-family: ${uxRebuildFont};
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
  border: 1px solid ${uxRebuildColors.border};
  color: ${uxRebuildColors.muted};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    color: ${uxRebuildColors.gold};
    border-color: rgba(221, 185, 47, 0.45);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const ProjectStickyNav: React.FC = () => (
  <NavBar aria-label="Project page sections" data-ux-rebuild-project-nav>
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
