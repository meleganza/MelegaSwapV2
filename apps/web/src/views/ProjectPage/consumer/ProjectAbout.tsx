import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import { BodyText, EmptyState, EmptyStateBody, EmptyStateTitle, MutedText, Section, SectionTitle } from './theme'

interface Props {
  document: CanonicalProjectDocument
}

const ProjectAbout: React.FC<Props> = ({ document }) => {
  const description =
    document.identity.description.meta.availability === 'AVAILABLE'
      ? document.identity.description.value
      : null

  return (
    <Section aria-labelledby="about-heading">
      <SectionTitle id="about-heading">About</SectionTitle>
      {description ? (
        <BodyText>{description}</BodyText>
      ) : (
        <EmptyState>
          <EmptyStateTitle>Not available yet</EmptyStateTitle>
          <EmptyStateBody>A project overview will appear here once it is published.</EmptyStateBody>
        </EmptyState>
      )}
    </Section>
  )
}

export default ProjectAbout
