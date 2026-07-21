import React from 'react'
import {
  MelegaStudioGhostBtn,
  MelegaStudioPageHeader,
  MelegaStudioPrimaryBtn,
  STUDIO_PAGE_TITLES,
} from 'design-system/melega'

export const ProjectsStudioPageHeader: React.FC = () => (
  <MelegaStudioPageHeader
    data-studio-header="projects"
    title={STUDIO_PAGE_TITLES.projects}
    subtitle="Discover AI-indexed crypto projects. Find verified ecosystems. Trade with confidence."
    actions={
      <>
        <MelegaStudioPrimaryBtn as="a" href="/import-existing-token" style={{ textDecoration: 'none' }}>
          Import Existing Token
        </MelegaStudioPrimaryBtn>
        <MelegaStudioGhostBtn as="a" href="/import-existing-token?mode=claim" style={{ textDecoration: 'none' }}>
          Claim Existing Project
        </MelegaStudioGhostBtn>
        <MelegaStudioGhostBtn as="a" href="/@marco/" style={{ textDecoration: 'none' }}>
          Open Project Page
        </MelegaStudioGhostBtn>
      </>
    }
  />
)

export default ProjectsStudioPageHeader
