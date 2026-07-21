import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaStudioGhostBtn } from 'design-system/melega'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { homeTypography } from './homeTradeTokens'

const Shell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${homeTypography.sectionTitle.size};
  font-weight: ${homeTypography.sectionTitle.weight};
  line-height: ${homeTypography.sectionTitle.lineHeight};
  color: ${premiumStudioColors.text};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
`

const QUICK_ACTIONS = [
  { id: 'swap', label: 'Swap', href: '/trade' },
  { id: 'liquidity', label: 'Liquidity', href: '/liquidity-studio' },
  { id: 'pools', label: 'Pools', href: '/pools' },
  { id: 'farms', label: 'Farms', href: '/farms' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'import', label: 'Import', href: '/import-existing-token' },
  { id: 'build', label: 'Build', href: '/build-studio' },
] as const

/** R760 — identical quick-action buttons across core studios. */
export const HomeQuickActions: React.FC = () => (
  <Shell data-home-quick-actions>
    <Title>Quick actions</Title>
    <Grid>
      {QUICK_ACTIONS.map((action) => (
        <MelegaStudioGhostBtn
          key={action.id}
          as={Link}
          href={action.href}
          style={{ width: '100%', textDecoration: 'none' }}
        >
          {action.label}
        </MelegaStudioGhostBtn>
      ))}
    </Grid>
  </Shell>
)

export default HomeQuickActions
