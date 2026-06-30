import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { EarnRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Section = styled.section`
  background: ${ht.surface1};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px;
  box-sizing: border-box;
  min-height: 138px;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 20px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const ViewLink = styled(Link)`
  font-family: ${ht.fontBody};
  font-size: 13px;
  color: ${ht.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
`

const ListBlock = styled.div`
  min-width: 0;
`

const ListTitle = styled.h3`
  margin: 0 0 6px;
  font-family: ${ht.fontBody};
  font-size: 12px;
  font-weight: 600;
  color: ${ht.textMuted};
`

const Row = styled.div<{ $hasTvl?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $hasTvl }) => ($hasTvl ? '1fr 72px 72px' : '1fr 72px')};
  gap: 12px;
  align-items: center;
  height: 28px;
`

const Name = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Apr = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${ht.green};
  text-align: right;
`

const Tvl = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #d8d8d8;
  text-align: right;
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null
  const hasTvl = rows.some((r) => r.tvl)
  return (
    <ListBlock>
      <ListTitle>{title}</ListTitle>
      {rows.map((row) => (
        <Row key={row.id} $hasTvl={hasTvl}>
          <Name>{row.name}</Name>
          <Apr>{row.apr || '—'}</Apr>
          {hasTvl && <Tvl>{row.tvl || ''}</Tvl>}
        </Row>
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
    <Section>
      <Header>
        <Title>Earn Opportunities</Title>
        <ViewLink href="/farms">View Earn →</ViewLink>
      </Header>
      <Grid>
        <EarnList title="Top Farms" rows={farmRows} />
        {poolRows.length > 0 && <EarnList title="Top Staking Pools" rows={poolRows} />}
      </Grid>
    </Section>
  )
}

export default EarnOpportunities
