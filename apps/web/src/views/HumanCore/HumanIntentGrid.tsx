import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`

const Tile = styled(Link)<{ $emphasized?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 18px;
  min-height: 120px;
  background: ${({ $emphasized }) => ($emphasized ? tokens.surfaceSecondary : tokens.surface)};
  border: 1px solid ${({ $emphasized }) => ($emphasized ? tokens.borderGold : tokens.border)};
  border-radius: ${tokens.radius};
  text-decoration: none;
  transition: border-color ${tokens.transition};

  &:hover {
    border-color: ${tokens.borderGold};
  }
`

const Badge = styled.span`
  align-self: flex-start;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${tokens.gold};
  border: 1px solid ${tokens.borderGold};
  border-radius: 6px;
  padding: 2px 6px;
`

const Title = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${tokens.text};
`

const Desc = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: ${tokens.textSecondary};
  flex: 1;
`

export interface HumanIntent {
  id: string
  title: string
  description: string
  href: string
  emphasized?: boolean
  badge?: string
}

export const HumanIntentGrid: React.FC<{ intents: HumanIntent[] }> = ({ intents }) => (
  <Grid>
    {intents.map((intent) => (
      <Tile key={intent.id} href={intent.href} $emphasized={intent.emphasized}>
        {intent.badge && <Badge>{intent.badge}</Badge>}
        <Title>{intent.title}</Title>
        <Desc>{intent.description}</Desc>
      </Tile>
    ))}
  </Grid>
)

export default HumanIntentGrid
