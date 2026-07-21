import React from 'react'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import { humanEnumLabel } from '../presentation/humanLabels'
import { BodyText, Card, MutedText, Section, SectionTitle, TextLink } from './theme'

interface Props {
  ecosystemDocument: ProjectEcosystemDocument
}

const UTILITY_GROUPS = new Set(['PRODUCTS', 'INFRASTRUCTURE', 'ECONOMY', 'DEVELOPER'])

const ProjectUtilitiesSection: React.FC<Props> = ({ ecosystemDocument }) => {
  const utilities = ecosystemDocument.services.filter((service) => UTILITY_GROUPS.has(service.group))

  return (
    <Section aria-labelledby="utilities-heading">
      <SectionTitle id="utilities-heading">Utilities</SectionTitle>

      {utilities.length === 0 ? (
        <MutedText>No public utilities are registered for this project.</MutedText>
      ) : (
        <Card as="ul" style={{ listStyle: 'none', margin: 0, padding: 16, gap: 14 }}>
          {utilities.map((service) => {
            const href = service.route ?? service.externalUrl
            return (
              <li key={service.serviceId} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <BodyText style={{ fontWeight: 600 }}>{service.title}</BodyText>
                <MutedText style={{ fontSize: 15 }}>{service.summary}</MutedText>
                <MutedText style={{ fontSize: 13 }}>
                  {humanEnumLabel(service.lifecycle)} · {humanEnumLabel(service.availability)}
                </MutedText>
                {href ? (
                  <TextLink
                    href={href}
                    {...(service.externalUrl && !service.route
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    aria-label={`Open ${service.title}`}
                  >
                    Open
                  </TextLink>
                ) : (
                  <MutedText>Open unavailable</MutedText>
                )}
              </li>
            )
          })}
        </Card>
      )}
    </Section>
  )
}

export default ProjectUtilitiesSection
