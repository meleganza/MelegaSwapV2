import React from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { trendingStudioLayout } from '../trendingStudioTokens'
import { TrSectionTitle } from './trendingStudioPrimitives'
import TrendingProjectCard from './TrendingProjectCard'

const Section = styled.section<{ $single?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: ${({ $single }) => ($single ? 'center' : 'stretch')};
`

const Grid = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) => ($single ? 'minmax(0, 520px)' : 'repeat(2, minmax(0, 1fr))')};
  gap: ${trendingStudioLayout.trendingCardGap};
  min-width: 0;
  justify-content: ${({ $single }) => ($single ? 'center' : 'stretch')};
  width: 100%;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    justify-content: stretch;
  }
`

const Notice = styled.div`
  margin: 0;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  font-size: 13px;
  color: #9a9a9a;
  line-height: 1.45;
  text-align: center;
  max-width: 520px;
  align-self: center;
`

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8a8a8a;
`

export const TrendingNowGrid: React.FC = () => {
  const { cards, filterEmptyMessage } = useTrendingRuntime()
  const singleCard = cards.length === 1

  return (
    <Section data-tr-trending-now $single={singleCard}>
      <TrSectionTitle>Trending Now</TrSectionTitle>
      {singleCard ? (
        <Notice>
          {cards.length} tier-ranked asset from production indexer. Ranked by 24H volume → trades → liquidity →
          price change.
        </Notice>
      ) : null}
      {filterEmptyMessage ? <Empty>{filterEmptyMessage}</Empty> : null}
      <Grid $single={singleCard}>
        {cards.map((project) => (
          <TrendingProjectCard key={`${project.slug ?? project.name}-${project.rank}`} project={project} />
        ))}
      </Grid>
    </Section>
  )
}

export default TrendingNowGrid
