import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import type { ProjectGovernanceDocument } from 'registry/projects/identity/governance'
import type { ProjectGrowthDocument } from 'registry/projects/identity/growth'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import { humanEnumLabel } from '../presentation/humanLabels'
import {
  Accordion,
  AccordionSummary,
  BodyText,
  MutedText,
  Section,
  SectionTitle,
  SoftCard,
  TextLink,
} from './theme'
import { getRelatedProjectHref, getRelatedProjectLabel } from './helpers'

const UTILITY_GROUPS = new Set(['PRODUCTS', 'INFRASTRUCTURE', 'ECONOMY', 'DEVELOPER'])

interface Props {
  document: CanonicalProjectDocument
  developerDocument: ProjectDeveloperDocument
  governanceDocument: ProjectGovernanceDocument
  growthDocument: ProjectGrowthDocument
  ecosystemDocument: ProjectEcosystemDocument
}

const ProjectMoreSection: React.FC<Props> = ({
  document,
  developerDocument,
  governanceDocument,
  growthDocument,
  ecosystemDocument,
}) => {
  const relatedHref = getRelatedProjectHref(document.slug)
  const relatedLabel = getRelatedProjectLabel(document.slug)
  const utilities = ecosystemDocument.services.filter((service) => UTILITY_GROUPS.has(service.group))

  const hasDeveloper = developerDocument.resources.length > 0
  const hasGovernance =
    governanceDocument.governance.length > 0 || governanceDocument.treasury.length > 0
  const hasGrowth = growthDocument.programs.length > 0
  const hasResources = document.resources.length > 0
  const hasRelated = Boolean(relatedHref && relatedLabel)
  const hasUtilities = utilities.length > 0

  return (
    <Section aria-labelledby="more-heading">
      <SectionTitle id="more-heading">More</SectionTitle>
      <MutedText>Developer, governance, and growth details — collapsed by default.</MutedText>

      {hasRelated ? (
        <Accordion>
          <AccordionSummary>Related project</AccordionSummary>
          <SoftCard style={{ marginTop: 12, border: 'none', padding: 0, background: 'transparent' }}>
            <TextLink href={relatedHref!} aria-label={`View ${relatedLabel} project page`}>
              View {relatedLabel}
            </TextLink>
          </SoftCard>
        </Accordion>
      ) : null}

      {hasResources ? (
        <Accordion>
          <AccordionSummary>Official resources</AccordionSummary>
          <SoftCard as="ul" style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, gap: 8, border: 'none', background: 'transparent' }}>
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
          </SoftCard>
        </Accordion>
      ) : null}

      {hasUtilities ? (
        <Accordion>
          <AccordionSummary>Utilities</AccordionSummary>
          <SoftCard as="ul" style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, gap: 12, border: 'none', background: 'transparent' }}>
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
                    <MutedText>Not available yet</MutedText>
                  )}
                </li>
              )
            })}
          </SoftCard>
        </Accordion>
      ) : null}

      {hasDeveloper ? (
        <Accordion>
          <AccordionSummary>Developer</AccordionSummary>
          <SoftCard as="ul" style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, gap: 8, border: 'none', background: 'transparent' }}>
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
                    <MutedText>Not available yet</MutedText>
                  )}
                </li>
              )
            })}
          </SoftCard>
        </Accordion>
      ) : null}

      {hasGovernance ? (
        <Accordion>
          <AccordionSummary>Governance</AccordionSummary>
          <SoftCard style={{ marginTop: 12, border: 'none', padding: 0, background: 'transparent' }}>
            <MutedText>
              {governanceDocument.governance.length} governance record
              {governanceDocument.governance.length === 1 ? '' : 's'}
              {governanceDocument.treasury.length
                ? ` · ${governanceDocument.treasury.length} treasury disclosure${
                    governanceDocument.treasury.length === 1 ? '' : 's'
                  }`
                : ''}
            </MutedText>
          </SoftCard>
        </Accordion>
      ) : null}

      {hasGrowth ? (
        <Accordion>
          <AccordionSummary>Growth programs</AccordionSummary>
          <SoftCard as="ul" style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, gap: 8, border: 'none', background: 'transparent' }}>
            {growthDocument.programs.slice(0, 4).map((program) => (
              <li key={program.programId}>
                <BodyText style={{ fontWeight: 600, fontSize: 15 }}>{program.title}</BodyText>
                <MutedText style={{ fontSize: 14 }}>{program.summary}</MutedText>
              </li>
            ))}
          </SoftCard>
        </Accordion>
      ) : null}
    </Section>
  )
}

export default ProjectMoreSection
