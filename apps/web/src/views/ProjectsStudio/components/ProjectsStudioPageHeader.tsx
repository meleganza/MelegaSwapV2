import React from 'react'
import {
  MelegaStudioGhostBtn,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
} from 'design-system/melega'

/** Claim Project → ownership-gated customize flow (List Studio claim intent). */
export const CLAIM_PROJECT_HREF = '/list?intent=claim-project'

export const ProjectsStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="projects"
    data-testid="projects-directory-header"
    title={STUDIO_PAGE_TITLES.projects}
    subtitle="Discover trending and listed projects. Open a project page. Trade with confidence."
    actions={
      <>
        <MelegaStudioPrimaryBtn as="a" href="/list" style={{ textDecoration: 'none' }} data-testid="projects-list-cta">
          List Your Project
        </MelegaStudioPrimaryBtn>
        <MelegaStudioGhostBtn
          as="a"
          href={CLAIM_PROJECT_HREF}
          style={{ textDecoration: 'none' }}
          data-testid="projects-claim-cta"
        >
          Claim Project
        </MelegaStudioGhostBtn>
      </>
    }
  />
)

export default ProjectsStudioPageHeader
