import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  font-size: 12px;
`

const Link = styled.a`
  color: ${tokens.gold};
  text-decoration: none;

  &:hover {
    color: ${tokens.goldHighlight};
    text-decoration: underline;
  }
`

const Label = styled.span`
  color: ${tokens.textSecondary};
  margin-right: 8px;
`

export interface ManifestEntry {
  label: string
  uri: string
}

export const EconomicManifestLink: React.FC<{ manifests: ManifestEntry[] }> = ({ manifests }) => (
  <List>
    {manifests.map((entry) => (
      <Item key={entry.uri}>
        <Label>{entry.label}</Label>
        <Link href={entry.uri}>{entry.uri}</Link>
      </Item>
    ))}
  </List>
)

export default EconomicManifestLink
