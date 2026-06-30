import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaFeedRow, MelegaSectionCard, spacing } from 'design-system/melega'
import { EarnRow } from './useHomeTradeData'

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing[4]};
  }
`

const ListBlock = styled.div`
  min-width: 0;
`

const ListTitle = styled.h3`
  margin: 0 0 ${spacing[2]};
  font-size: 12px;
  font-weight: 600;
  color: inherit;
  opacity: 0.65;
`

const SectionLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null

  return (
    <ListBlock>
      <ListTitle>{title}</ListTitle>
      {rows.map((row) => (
        <MelegaFeedRow
          key={row.id}
          icon="◉"
          title={row.name}
          subtitle={row.tvl}
          trailing={row.apr || '—'}
          href={row.href}
        />
      ))}
    </ListBlock>
  )
}

export const EarnOpportunities: React.FC<{
  farmRows: EarnRow[]
  poolRows: EarnRow[]
  showNote: boolean
}> = ({ farmRows, poolRows }) => {
  if (!farmRows.length && !poolRows.length) return null

  return (
    <MelegaSectionCard
      title="Earn Opportunities"
      minHeight="138px"
      action={
        <SectionLink href="/farms">View Earn →</SectionLink>
      }
    >
      <Grid>
        <EarnList title="Top Farms" rows={farmRows} />
        {poolRows.length > 0 && <EarnList title="Top Staking Pools" rows={poolRows} />}
      </Grid>
    </MelegaSectionCard>
  )
}

export default EarnOpportunities
