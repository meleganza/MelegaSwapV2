import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { EarnRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Section = styled.section`
  margin-top: 12px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 600;
  color: ${ht.white};

  @media (min-width: 1024px) {
    font-size: 16px;
  }
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
  display: grid;
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 120px;

  @media (min-width: 1024px) {
    min-height: 136px;
  }
`

const CardTitle = styled.h3`
  margin: 0 0 10px;
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 600;
  color: ${ht.textMuted};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  gap: 8px;
`

const Name = styled.span`
  font-size: 13px;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Apr = styled.span`
  font-size: 13px;
  color: ${ht.green};
  font-weight: 600;
  flex-shrink: 0;
`

const Tvl = styled.span`
  font-size: 12px;
  color: ${ht.textMuted};
  flex-shrink: 0;
`

const Note = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  color: ${ht.textSoft};
`

const EarnList: React.FC<{ title: string; rows: EarnRow[] }> = ({ title, rows }) => {
  if (!rows.length) return null
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {rows.map((row) => (
        <Row key={row.id}>
          <Name>{row.name}</Name>
          {row.apr && <Apr>{row.apr}</Apr>}
          {row.tvl && <Tvl>{row.tvl}</Tvl>}
        </Row>
      ))}
    </Card>
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
        <EarnList title="Top Staking Pools" rows={poolRows} />
      </Grid>
      {showNote && <Note>APR and TVL shown are real-time on-chain data.</Note>}
    </Section>
  )
}

export default EarnOpportunities
