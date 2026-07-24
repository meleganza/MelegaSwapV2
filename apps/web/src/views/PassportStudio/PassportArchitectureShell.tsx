/**
 * PASSPORT_ARCHITECTURE_000 — page shell + empty module slots.
 * Does NOT replace live PassportScreen behavior. Mounted only as architecture
 * scaffolding for future MODULE_001+ delivery. Existing /passport route remains
 * on PassportScreen until Module 001 certifies the hero cutover.
 */
import React from 'react'
import styled from 'styled-components'
import { PASSPORT_MODULE_ORDER, passportOne } from './passportTokens'

const Root = styled.div`
  color: ${passportOne.text};
  font-family: ${passportOne.font};
  background: ${passportOne.pageBg};
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: ${passportOne.pageBottomPad};
`

const Content = styled.div`
  max-width: ${passportOne.contentMax};
  width: 100%;
  margin: ${passportOne.topAfterTrending} auto 0;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${passportOne.moduleGap};

  @media (max-width: 767px) {
    width: 100%;
    max-width: ${passportOne.mobileContentW};
    padding: 0;
    margin-top: 16px;
  }
`

const Slot = styled.section<{ $h?: string; $minH?: string }>`
  width: 100%;
  max-width: ${passportOne.contentMax};
  box-sizing: border-box;
  height: ${({ $h }) => $h || 'auto'};
  min-height: ${({ $minH }) => $minH || '0'};
  border-radius: ${passportOne.radius};
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: ${passportOne.card};
  color: ${passportOne.muted};
  font-size: 12px;
  line-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
`

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: ${passportOne.bottomColW} ${passportOne.bottomColW};
  column-gap: ${passportOne.bottomGap};
  width: 100%;
  max-width: ${passportOne.contentMax};

  @media (max-width: 1199px) {
    grid-template-columns: 1fr;
    row-gap: ${passportOne.moduleGap};
  }
`

const SLOT_COPY: Record<string, string> = {
  '001-hero-identity': 'MODULE 001 — Hero + Identity Card (pending)',
  '002-portfolio': 'MODULE 002 — Portfolio Overview (pending)',
  '003-assets': 'MODULE 003 — Assets (pending)',
  '004-projects': 'MODULE 004 — My Projects (pending)',
  '005-liquidity': 'MODULE 005 — Liquidity Positions (pending)',
  '006-activity': 'MODULE 006 — Recent Activity (pending)',
  '007-security': 'MODULE 007 — Security (pending)',
  '008-mobile': 'MODULE 008 — Mobile Composition (pending)',
  '009-polish': 'MODULE 009 — Visual Polish (pending)',
}

/**
 * Architecture-only shell. Not wired to /passport in ARCHITECTURE_000.
 * Future missions mount certified modules into these slots.
 */
export const PassportArchitectureShell: React.FC = () => {
  return (
    <Root data-passport-architecture="000" data-testid="passport-architecture-shell">
      <Content data-testid="passport-architecture-content">
        <Slot
          data-testid="passport-slot-001"
          data-passport-module="001"
          $h={passportOne.heroH}
          aria-label={SLOT_COPY['001-hero-identity']}
        >
          {SLOT_COPY['001-hero-identity']}
        </Slot>
        <Slot data-testid="passport-slot-002" data-passport-module="002" $h={passportOne.portfolioH}>
          {SLOT_COPY['002-portfolio']}
        </Slot>
        <Slot data-testid="passport-slot-003" data-passport-module="003" $h={passportOne.assetsH}>
          {SLOT_COPY['003-assets']}
        </Slot>
        <Slot data-testid="passport-slot-004" data-passport-module="004" $h={passportOne.projectsH}>
          {SLOT_COPY['004-projects']}
        </Slot>
        <Slot
          data-testid="passport-slot-005"
          data-passport-module="005"
          $minH={passportOne.liquidityMinH}
        >
          {SLOT_COPY['005-liquidity']}
        </Slot>
        <BottomGrid data-testid="passport-bottom-grid">
          <Slot data-testid="passport-slot-006" data-passport-module="006">
            {SLOT_COPY['006-activity']}
          </Slot>
          <Slot data-testid="passport-slot-007" data-passport-module="007">
            {SLOT_COPY['007-security']}
          </Slot>
        </BottomGrid>
        {/* 008/009 are composition/polish missions — no desktop slots */}
        <div hidden data-passport-module-order={PASSPORT_MODULE_ORDER.join(',')}>
          {PASSPORT_MODULE_ORDER.join(',')}
        </div>
      </Content>
    </Root>
  )
}

export default PassportArchitectureShell
