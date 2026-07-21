import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import type { ProjectGovernanceDocument } from 'registry/projects/identity/governance'
import type { ProjectGrowthDocument } from 'registry/projects/identity/growth'
import { BodyText, Card, MutedText, Section, SectionTitle, SubTitle, TextLink } from './theme'
import { getRelatedProjectHref, getRelatedProjectLabel } from './helpers'

interface Props {
  document: CanonicalProjectDocument
  developerDocument: ProjectDeveloperDocument
  governanceDocument: ProjectGovernanceDocument
  growthDocument: ProjectGrowthDocument
}

const ProjectMoreSection: React.FC<Props> = ({
  document,
  developerDocument,
  governanceDocument,
  growthDocument,
}) => {
  const relatedHref = getRelatedProjectHref(document.slug)
  const relatedLabel = getRelatedProjectLabel(document.slug)

  return (
    <Section id="more" aria-labelledby="more-heading">
      <SectionTitle id="more-heading">More</SectionTitle>

      {relatedHref && relatedLabel ? (
        <Card>
          <SubTitle as="h3">Related project</SubTitle>
          <TextLink href={relatedHref} aria-label={`View ${relatedLabel} project page`}>
            View {relatedLabel}
          </TextLink>
        </Card>
      ) : null}

      {document.resources.length > 0 ? (
        <Card>
          <SubTitle as="h3">Official resources</SubTitle>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {document.resources.slice(0, 6).map((resource) => (
              <li key={resource.url}>
                <TextLink
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${resource.label} (opens in a new tab)`}
                >
                  {resource.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {developerDocument.resources.length > 0 ? (
        <Card>
          <SubTitle as="h3">Developer</SubTitle>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {developerDocument.resources.slice(0, 4).map((resource) => {
              const href = resource.route ?? resource.url
              return (
                <li key={resource.resourceId}>
                  <BodyText style={{ fontWeight: 600, fontSize: 15 }}>{resource.title}</BodyText>
                  {href ? (
                    <TextLink
                      href={href}
                      {...(resource.url && !resource.route
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      Open
                    </TextLink>
                  ) : (
                    <MutedText>Link unavailable</MutedText>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}

      {governanceDocument.governance.length > 0 || governanceDocument.treasury.length > 0 ? (
        <Card>
          <SubTitle as="h3">Governance</SubTitle>
          <MutedText>
            {governanceDocument.governance.length} governance record
            {governanceDocument.governance.length === 1 ? '' : 's'}
            {governanceDocument.treasury.length
              ? ` · ${governanceDocument.treasury.length} treasury disclosure${
                  governanceDocument.treasury.length === 1 ? '' : 's'
                }`
              : ''}
          </MutedText>
        </Card>
      ) : null}

      {growthDocument.programs.length > 0 ? (
        <Card>
          <SubTitle as="h3">Growth programs</SubTitle>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {growthDocument.programs.slice(0, 4).map((program) => (
              <li key={program.programId}>
                <BodyText style={{ fontWeight: 600, fontSize: 15 }}>{program.title}</BodyText>
                <MutedText style={{ fontSize: 14 }}>{program.summary}</MutedText>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Section>
  )
}

export default ProjectMoreSection
