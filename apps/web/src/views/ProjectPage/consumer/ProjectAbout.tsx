import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import { BodyText, MutedText, Section, SectionTitle } from './theme'

interface Props {
  document: CanonicalProjectDocument
}

const ProjectAbout: React.FC<Props> = ({ document }) => {
  const description =
    document.identity.description.meta.availability === 'AVAILABLE'
      ? document.identity.description.value
      : null

  return (
    <Section id="overview" aria-labelledby="overview-heading">
      <SectionTitle id="overview-heading">Overview</SectionTitle>
      {description ? (
        <BodyText>{description}</BodyText>
      ) : (
        <MutedText>Overview description unavailable in registry.</MutedText>
      )}
    </Section>
  )
}

export default ProjectAbout
