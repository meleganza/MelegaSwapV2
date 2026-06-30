import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`

const Action = styled(Link)`
  display: block;
  padding: 16px 18px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 14px;
  font-weight: 500;
  color: ${tokens.text};
  text-decoration: none;
  background: ${tokens.surface};
  transition: border-color ${tokens.transition}, background ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
    background: ${tokens.surfaceSecondary};
  }
`

const External = styled.a`
  display: block;
  padding: 16px 18px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 14px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  text-decoration: none;
  background: ${tokens.surface};

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.text};
  }
`

export interface ActionLink {
  label: string
  href: string
  external?: boolean
}

export const EconomicActionGrid: React.FC<{ links: ActionLink[] }> = ({ links }) => (
  <Grid>
    {links.map((link) =>
      link.external || link.href.startsWith('/registry') || link.href.startsWith('http') ? (
        <External key={link.href} href={link.href}>
          {link.label}
        </External>
      ) : (
        <Action key={link.href} href={link.href}>
          {link.label}
        </Action>
      ),
    )}
  </Grid>
)

export default EconomicActionGrid
