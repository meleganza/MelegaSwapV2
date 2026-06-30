import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Footer = styled.footer`
  margin-top: 16px;
  padding-top: 32px;
  border-top: 1px solid ${tokens.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`

const Tagline = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tokens.textSecondary};
  letter-spacing: 0.02em;
`

const Links = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`

const Link = styled.a`
  font-size: 12px;
  color: ${tokens.textSecondary};
  text-decoration: none;

  &:hover {
    color: ${tokens.gold};
  }
`

const DEFAULT_LINKS = [
  { label: 'Docs', href: 'https://docs.melega.finance/' },
  { label: 'Status', href: '/map' },
  { label: 'AI agents', href: '/registry/surfaces/index.json' },
]

export const EconomicFooter: React.FC<{
  tagline?: string
  links?: Array<{ label: string; href: string }>
}> = ({
  tagline = 'Melega DEX — Built for humans. Verified by code. Secured by chain.',
  links = DEFAULT_LINKS,
}) => (
  <Footer>
    <Tagline>{tagline}</Tagline>
    <Links>
      {links.map((link) => (
        <Link key={link.href} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined}>
          {link.label}
        </Link>
      ))}
    </Links>
  </Footer>
)

export default EconomicFooter
