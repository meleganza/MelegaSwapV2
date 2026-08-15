import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export const PortalPage = styled.main`
  min-height: 72vh;
  padding: 24px 32px 64px;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: radial-gradient(circle at 82% 6%, rgba(221, 185, 47, 0.07), transparent 28%),
    ${uxRebuildColors.pageBg};

  @media (max-width: 767px) {
    padding: 14px 12px 40px;
  }
`

export const PortalInner = styled.div`
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
`

export const PortalHero = styled.header`
  min-height: 216px;
  padding: 32px 36px;
  border: 1px solid rgba(221, 185, 47, 0.26);
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(112deg, rgba(24, 20, 7, 0.92), rgba(9, 10, 11, 0.98) 54%, rgba(13, 18, 20, 0.96));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 767px) {
    min-height: 0;
    padding: 24px 20px;
    align-items: flex-start;
    flex-direction: column;
  }
`

export const HeroCopy = styled.div`
  min-width: 0;
  max-width: 720px;
`

export const Eyebrow = styled.div`
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  line-height: 16px;
  font-weight: 780;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`

export const HeroTitle = styled.h1`
  margin: 12px 0 8px;
  font-size: clamp(38px, 5vw, 64px);
  line-height: 1;
  letter-spacing: -0.04em;
`

export const HeroLead = styled.p`
  margin: 0;
  max-width: 680px;
  color: ${uxRebuildColors.bodySoft};
  font-size: 17px;
  line-height: 1.55;
`

export const StatusRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
`

export const StatusPill = styled.span<{ $ok?: boolean }>`
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid ${({ $ok }) => ($ok ? 'rgba(0, 230, 118, 0.42)' : 'rgba(221, 185, 47, 0.42)')};
  border-radius: 999px;
  color: ${({ $ok }) => ($ok ? '#59e58d' : uxRebuildColors.gold)};
  background: rgba(0, 0, 0, 0.28);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 680;
`

export const PortalGrid = styled.section`
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(210px, 250px) minmax(0, 1fr) minmax(280px, 390px);
  gap: 14px;
  align-items: start;

  @media (max-width: 1080px) {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const SideNav = styled.nav`
  position: sticky;
  top: 92px;
  padding: 18px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};

  @media (max-width: 767px) {
    position: static;
  }
`

export const NavTitle = styled.div`
  margin-bottom: 10px;
  color: ${uxRebuildColors.gold};
  font-size: 11px;
  font-weight: 780;
  letter-spacing: 0.11em;
  text-transform: uppercase;
`

export const NavLink = styled(Link)`
  display: block;
  padding: 8px 0;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;
  font-size: 13px;

  &:hover {
    color: ${uxRebuildColors.gold};
  }
`

export const Stack = styled.div`
  min-width: 0;
  display: grid;
  gap: 14px;
`

export const Panel = styled.section`
  min-width: 0;
  padding: 20px;
  border: 1px solid ${uxRebuildColors.border};
  border-radius: ${uxRebuildRadius.card};
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.025), transparent 45%), ${uxRebuildColors.card};
`

export const PanelTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 19px;
  line-height: 25px;
`

export const PanelBody = styled.p`
  margin: 0;
  color: ${uxRebuildColors.secondary};
  font-size: 14px;
  line-height: 1.55;
`

export const Code = styled.pre`
  margin: 14px 0 0;
  padding: 16px;
  overflow: auto;
  border: 1px solid rgba(221, 185, 47, 0.22);
  border-radius: 10px;
  background: #050707;
  color: #8bea9d;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`

export const Cta = styled(Link)`
  min-height: 40px;
  margin-top: 14px;
  padding: 0 16px;
  border-radius: 9px;
  background: ${uxRebuildColors.gold};
  color: #080808;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 760;
`

export const ExternalCta = styled.a`
  min-height: 40px;
  margin-top: 14px;
  padding: 0 16px;
  border: 1px solid rgba(221, 185, 47, 0.45);
  border-radius: 9px;
  color: ${uxRebuildColors.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 13px;
  font-weight: 720;
`

export const DataRow = styled.div`
  min-height: 42px;
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;

  &:first-of-type {
    border-top: 0;
  }

  strong {
    color: ${uxRebuildColors.text};
    text-align: right;
  }
`

export const PortalFooter: React.FC = () => (
  <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: 12 }}>
    <NavLink href="/docs">Docs</NavLink>
    <NavLink href="/api-agents">API / Agent documentation</NavLink>
    <NavLink href="/devs">Devs</NavLink>
    <NavLink href="/audit">Audit</NavLink>
    <NavLink href="/support">Support</NavLink>
  </div>
)
