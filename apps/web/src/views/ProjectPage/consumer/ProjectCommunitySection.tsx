import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import { BodyText, Card, MutedText, Section, SectionTitle, TextLink } from './theme'
import { getSocialResources } from './helpers'

interface Props {
  document: CanonicalProjectDocument
  ecosystemDocument: ProjectEcosystemDocument
}

const COMMUNITY_GROUPS = new Set(['GOVERNANCE', 'RESOURCES', 'AI'])

const ProjectCommunitySection: React.FC<Props> = ({ document, ecosystemDocument }) => {
  const socials = getSocialResources(document)
  const communityServices = ecosystemDocument.services.filter((service) =>
    COMMUNITY_GROUPS.has(service.group),
  )

  return (
    <Section aria-labelledby="community-heading">
      <SectionTitle id="community-heading">Community</SectionTitle>

      {socials.length > 0 ? (
        <Card>
          <BodyText style={{ fontWeight: 600 }}>Official links</BodyText>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {socials.map((resource) => (
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
      ) : (
        <MutedText>No official community links are registered.</MutedText>
      )}

      {communityServices.length > 0 ? (
        <Card>
          <BodyText style={{ fontWeight: 600 }}>Community services</BodyText>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {communityServices.slice(0, 4).map((service) => {
              const href = service.route ?? service.externalUrl
              return (
                <li key={service.serviceId}>
                  <BodyText style={{ fontWeight: 600, fontSize: 15 }}>{service.title}</BodyText>
                  <MutedText style={{ fontSize: 14 }}>{service.summary}</MutedText>
                  {href ? (
                    <TextLink
                      href={href}
                      {...(service.externalUrl && !service.route
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      Open
                    </TextLink>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}
    </Section>
  )
}

export default ProjectCommunitySection
