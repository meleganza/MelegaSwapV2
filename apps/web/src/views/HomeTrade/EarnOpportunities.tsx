import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { EarnRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Section = styled.section`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 16px 18px;
  box-sizing: border-box;
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 1024px) {
    min-height: 142px;
    display: flex;
    flex-direction: column;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const ViewLink = styled(Link)`
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  margin: 0 0 4px;
  font-family: ${ht.fontBody};
  font-size: 12px;
  font-weight: 600;
  color: ${ht.textMuted};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 56px 52px;
  gap: 8px;
  align-items: center;
  height: 30px;
`

const Name = styled.span`
  font-size: 13px;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Apr = styled.span`
  font-size: 12px;
  color: ${ht.green};
  font-weight: 600;
  text-align: right;
`

const Tvl = styled.span`
  font-size: 12px;
  color: ${ht.textMuted};
  text-align: right;
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null
  return (
    <ListBlock>
      <ListTitle>{title}</ListTitle>
      {rows.map((row) => (
        <Row key={row.id}>
          <Name>{row.name}</Name>
          <Apr>{row.apr || '—'}</Apr>
          <Tvl>{row.tvl || ''}</Tvl>
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
