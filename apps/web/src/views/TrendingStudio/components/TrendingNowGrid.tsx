import React from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { trendingStudioLayout } from '../trendingStudioTokens'
import { TrSectionTitle } from './trendingStudioPrimitives'
import TrendingProjectCard from './TrendingProjectCard'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Grid = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) => ($single ? 'minmax(0, 560px)' : 'repeat(2, minmax(0, 1fr))')};
  gap: ${trendingStudioLayout.trendingCardGap};
  min-width: 0;
  justify-content: ${({ $single }) => ($single ? 'start' : 'stretch')};

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Notice = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8a8a8a;
  line-height: 1.45;
`

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8a8a8a;
`

export const TrendingNowGrid: React.FC = () => {
  const { cards, filterEmptyMessage } = useTrendingRuntime()
  const indexedCount = getAllProjects().length
  const singleCard = cards.length === 1

  return (
    <Section data-tr-trending-now>
      <TrSectionTitle>Trending Now</TrSectionTitle>
      {singleCard ? (
        <Notice>
          Showing {cards.length} indexed project{indexedCount === 1 ? '' : 's'} from the Melega registry. Additional
          listings appear here after import review.
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
