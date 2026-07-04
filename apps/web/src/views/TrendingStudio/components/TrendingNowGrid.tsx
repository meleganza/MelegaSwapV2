import React from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { trendingStudioLayout } from '../trendingStudioTokens'
import { TrSectionTitle } from './trendingStudioPrimitives'
import TrendingProjectCard from './TrendingProjectCard'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${trendingStudioLayout.trendingCardGap};
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8a8a8a;
`

export const TrendingNowGrid: React.FC = () => {
  const { cards, filterEmptyMessage } = useTrendingRuntime()

  return (
    <Section data-tr-trending-now>
      <TrSectionTitle>Trending Now</TrSectionTitle>
      {filterEmptyMessage ? <Empty>{filterEmptyMessage}</Empty> : null}
      <Grid>
        {cards.map((project) => (
          <TrendingProjectCard key={`${project.slug ?? project.name}-${project.rank}`} project={project} />
        ))}
      </Grid>
    </Section>
  )
}

export default TrendingNowGrid
