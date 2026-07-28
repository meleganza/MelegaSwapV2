/**
 * Melega DEX Home footer — copyright, Docs/Audit/Support, social icons only.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { Github, Instagram, Youtube, Send } from 'lucide-react'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import {
  MELEGA_FOOTER_COPYRIGHT,
  MELEGA_FOOTER_NAV,
  MELEGA_FOOTER_SOCIALS,
} from './melegaDexFooterLinks'

export { MELEGA_FOOTER_COPYRIGHT, MELEGA_FOOTER_NAV, MELEGA_FOOTER_SOCIALS }

const Shell = styled.footer`
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  box-sizing: border-box;
  min-width: 0;
`

const Copyright = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: ${uxRebuildColors.muted};
  flex: 1 1 180px;
  min-width: 0;
`

const Right = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px 16px;
  min-width: 0;
  flex: 1 1 240px;
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
`

const NavLink = styled.a`
  font-size: 12px;
  font-weight: 650;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;

  &:hover {
    color: ${uxRebuildColors.gold};
  }
`

const InternalNavLink = styled(Link)`
  font-size: 12px;
  font-weight: 650;
  color: ${uxRebuildColors.secondary};
  text-decoration: none;

  &:hover {
    color: ${uxRebuildColors.gold};
  }
`

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  max-width: 100%;
`

const SocialAnchor = styled.a`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${uxRebuildColors.border};
  background: ${uxRebuildColors.input};
  color: ${uxRebuildColors.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex: 0 0 auto;

  &:hover {
    color: ${uxRebuildColors.gold};
    border-color: rgba(221, 185, 47, 0.45);
  }
`

const XGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)

const MediumGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4.07 6.55a.72.72 0 0 0-.23-.58L2.1 3.86V3.5h6.18l4.78 10.48L17.2 3.5h5.9v.36l-1.6 1.54a.45.45 0 0 0-.17.42v10.7c.05.18.13.24.3.24l1.57 1.5v.36h-8.05v-.36l1.63-1.58c.16-.16.16-.21.16-.42V8.44l-4.53 11.5h-.61L5.85 8.44v7.72c-.04.33.07.67.3.9l2.12 2.57v.36H2.1v-.36l2.12-2.57a1.05 1.05 0 0 0 .28-.9V6.55z" />
  </svg>
)

const CmcGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5 12 7.5l3.5 7" />
    <path d="M9.6 12.5h4.8" />
  </svg>
)

const BinanceGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 3.2 14.7 5.9 9.3 11.3 6.6 8.6 12 3.2zm5.4 5.4 2.7 2.7-8.1 8.1L3.9 11.3l2.7-2.7 5.4 5.4 5.4-5.4zM6.6 13.4l2.7 2.7-2.7 2.7-2.7-2.7 2.7-2.7zm10.8 0 2.7 2.7-2.7 2.7-2.7-2.7 2.7-2.7z" />
  </svg>
)

const PublishGlyph: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M6 4.5h9.5L18 7.5v12H6z" />
    <path d="M9 10h6M9 13.5h6M9 17h4" />
  </svg>
)

function SocialIcon({ id }: { id: (typeof MELEGA_FOOTER_SOCIALS)[number]['id'] }) {
  switch (id) {
    case 'x':
      return <XGlyph />
    case 'telegram-community':
    case 'telegram-announcements':
      return <Send size={13} aria-hidden />
    case 'cmc':
      return <CmcGlyph />
    case 'binance-square':
      return <BinanceGlyph />
    case 'publish0x':
      return <PublishGlyph />
    case 'youtube':
      return <Youtube size={13} aria-hidden />
    case 'instagram':
      return <Instagram size={13} aria-hidden />
    case 'medium':
      return <MediumGlyph />
    case 'github':
      return <Github size={13} aria-hidden />
    default:
      return null
  }
}

export const MelegaDexFooter: React.FC = () => (
  <Shell data-testid="melega-dex-footer" data-home-section="footer">
    <Copyright>{MELEGA_FOOTER_COPYRIGHT}</Copyright>
    <Right>
      <Nav aria-label="Footer">
        {MELEGA_FOOTER_NAV.map((item) =>
          item.external ? (
            <NavLink key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
            </NavLink>
          ) : (
            <InternalNavLink key={item.label} href={item.href}>
              {item.label}
            </InternalNavLink>
          ),
        )}
      </Nav>
      <SocialRow>
        {MELEGA_FOOTER_SOCIALS.map((social) => (
          <SocialAnchor
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
          >
            <SocialIcon id={social.id} />
          </SocialAnchor>
        ))}
      </SocialRow>
    </Right>
  </Shell>
)

export default MelegaDexFooter
