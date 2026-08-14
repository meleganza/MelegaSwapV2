/**
 * Featured Projects — single pipeline via FeaturedProjectsRail (Home / Projects / Project Page).
 * Never duplicate the card system.
 */
import React from 'react'
import styled from 'styled-components'
import { FeaturedProjectsRail } from 'views/HomeTrade/FeaturedProjectsRail'
import { PR_FONT_BODY, projectsStudioColors } from '../projectsStudioTokens'

const Shell = styled.section`
  min-width: 0;
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${projectsStudioColors.gold};
`

const Meta = styled.span`
  font-size: 12px;
  color: ${projectsStudioColors.muted};
`

export type FeaturedProjectsSectionProps = {
  /** Visual host context — same rail component everywhere. */
  surface?: 'home' | 'projects' | 'project-page'
  showHead?: boolean
}

/** Canonical Featured Projects surface — one rail, three hosts. */
export const FeaturedProjectsSection: React.FC<FeaturedProjectsSectionProps> = ({
  surface = 'projects',
  showHead = true,
}) => (
  <Shell
    data-testid={surface === 'projects' ? 'projects-directory-featured' : `featured-projects-${surface}`}
    data-projects-section="featured"
    data-featured-pipeline="FeaturedProjectsRail"
    data-featured-surface={surface}
    data-featured-max="4"
  >
    {showHead ? (
      <Head>
        <Title>Featured Projects</Title>
        <Meta>Live featured placements</Meta>
      </Head>
    ) : null}
    <FeaturedProjectsRail />
  </Shell>
)

export default FeaturedProjectsSection
