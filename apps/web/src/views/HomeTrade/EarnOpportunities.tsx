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

  @media (min-width: 1024px) {
    min-height: 142px;
    height: 142px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};
`

const ViewLink = styled(Link)`
  font-family: ${ht.fontBody};
  font-size: 13px;
  color: ${ht.gold};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
`

const ListBlock = styled.div`
  min-width: 0;
`

const ListTitle = styled.h3`
  margin: 0 0 6px;
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 600;
  color: ${ht.textMuted};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  gap: 8px;
`

const Name = styled.span`
  font-size: 13px;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`

const Apr = styled.span`
  font-size: 13px;
  color: ${ht.green};
  font-weight: 600;
  flex-shrink: 0;
`

const Note = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  color: ${ht.textSoft};
  flex-shrink: 0;
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null
  return (
    <ListBlock>
      <ListTitle>{title}</ListTitle>
      {rows.map((row) => (
        <Row key={row.id}>
          <Name>{row.name}</Name>
          {row.apr && <Apr>{row.apr}</Apr>}
        </Row>
      ))}
    </ListBlock>
  )
}

export const EarnOpportunities: React.FC<{
  farmRows: EarnRow[]
  poolRows: EarnRow[]
  showNote: boolean
}> = ({ farmRows, poolRows, showNote }) => {
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
      {showNote && <Note>APR shown is real-time on-chain data.</Note>}
    </Section>
  )
}

export default EarnOpportunities
