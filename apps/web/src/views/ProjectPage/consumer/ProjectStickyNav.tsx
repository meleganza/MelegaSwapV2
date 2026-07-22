import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CANVAS, GOLD, MUTED } from './theme'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'buy', label: 'Buy' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'earn', label: 'Earn' },
  { id: 'updates', label: 'Updates' },
  { id: 'trust', label: 'Security' },
  { id: 'more', label: 'More' },
] as const

const NavBar = styled.nav`
  position: sticky;
  top: 0;
  z-index: 900;
  margin: 0 -16px;
  padding: 0 16px;
  height: 48px;
  background: ${CANVAS};
  border-bottom: 1px solid rgba(255, 255, 255, 0.075);

  @media (min-width: 1024px) {
    top: 64px;
    height: 44px;
    margin: 0 -18px;
    padding: 0 18px;
    background: linear-gradient(180deg, rgba(5, 5, 5, 0.96), rgba(5, 5, 5, 0.88));
  }

  @media (min-width: 1280px) {
    margin: 0 -22px;
    padding: 0 22px;
  }

  @media (min-width: 1440px) {
    margin: 0 -28px;
    padding: 0 28px;
  }
`

const ScrollRow = styled.div`
  display: flex;
  gap: 4px;
  height: 100%;
  align-items: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const ChipLink = styled.a<{ $active?: boolean }>`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: ${({ $active }) => ($active ? GOLD : MUTED)};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? 'rgba(221, 185, 47, 0.08)' : 'transparent')};

  @media (min-width: 1024px) {
    min-height: 44px;
    height: 44px;
    padding: 0 11px;
    border: none;
    border-radius: 0;
    background: transparent;
    font-size: 12px;
    font-weight: 500;
    color: ${({ $active }) => ($active ? '#ddb92f' : 'rgba(255, 255, 255, 0.55)')};
    box-shadow: ${({ $active }) => ($active ? 'inset 0 -2px 0 #ddb92f' : 'none')};

    &:hover {
      color: #ffffff;
    }
  }

  &:focus-visible {
    outline: 2px solid #ddb92f;
    outline-offset: 2px;
  }
`

const ProjectStickyNav: React.FC = () => {
  const [active, setActive] = useState<string>('overview')

  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!elements.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActive(visible[0].target.id)
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: [0.15, 0.35, 0.55] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <NavBar aria-label="Project page sections" data-testid="project-sticky-nav">
      <ScrollRow role="list">
        {NAV_ITEMS.map((item) => (
          <ChipLink
            key={item.id}
            href={`#${item.id}`}
            role="listitem"
            $active={active === item.id}
            aria-current={active === item.id ? 'true' : undefined}
            aria-label={`Jump to ${item.label}`}
          >
            {item.label}
          </ChipLink>
        ))}
      </ScrollRow>
    </NavBar>
  )
}

export default ProjectStickyNav
