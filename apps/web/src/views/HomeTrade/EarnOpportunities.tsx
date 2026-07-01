import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaSectionCard, colors } from 'design-system/melega'
import { EarnRow } from './useHomeTradeData'

const SectionLink = styled(Link)`
  color: ${colors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Subheader = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 8px;
  margin-bottom: 6px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr 72px;
  align-items: center;
  gap: 10px;
  height: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
`

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.gold};
  border: 1px solid rgba(212, 175, 55, 0.5);
`

const Pair = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Apr = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${colors.green};
  text-align: right;
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null

  return (
    <div>
      <Subheader>{title}</Subheader>
      {rows.map((row) => (
        <Row key={row.id}>
          <Dot aria-hidden />
          <Pair>{row.name}</Pair>
          <Apr>{row.apr || '—'}</Apr>
        </Row>
      ))}
    </div>
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
      minHeight="190px"
      action={<SectionLink href="/farms">View Earn →</SectionLink>}
    >
      <EarnList title="Top Farms" rows={farmRows} />
      {poolRows.length > 0 && <EarnList title="Top Staking Pools" rows={poolRows} />}
    </MelegaSectionCard>
  )
}

export default EarnOpportunities
