import React from 'react'
import styled from 'styled-components'
import { TRENDING_NOW_CARDS } from '../trendingStudioData'
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

export const TrendingNowGrid: React.FC = () => (
  <Section data-tr-trending-now>
    <TrSectionTitle>Trending Now</TrSectionTitle>
    <Grid>
      {TRENDING_NOW_CARDS.map((project) => (
        <TrendingProjectCard key={project.name} project={project} />
      ))}
    </Grid>
  </Section>
)

export default TrendingNowGrid
