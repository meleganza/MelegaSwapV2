import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
`

const Action = styled(Link)`
  display: block;
  padding: 14px 16px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.text};
  text-decoration: none;
  background: ${tokens.surface};
  transition: border-color ${tokens.transition}, color ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
    color: ${tokens.goldHighlight};
  }
`

const External = styled.a`
  display: block;
  padding: 14px 16px;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-size: 13px;
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
      link.external || link.href.startsWith('/registry') ? (
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
