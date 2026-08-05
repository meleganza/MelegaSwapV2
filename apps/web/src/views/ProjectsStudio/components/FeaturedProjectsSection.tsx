/**
 * Featured Projects — reuses Home FeaturedProjectsRail (no duplicated card system).
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
  color: ${projectsStudioColors.mute};
`

export const FeaturedProjectsSection: React.FC = () => (
  <Shell data-testid="projects-directory-featured" data-projects-section="featured">
    <Head>
      <Title>Featured Projects</Title>
      <Meta>Same cards as Home</Meta>
    </Head>
    <FeaturedProjectsRail />
  </Shell>
)

export default FeaturedProjectsSection
