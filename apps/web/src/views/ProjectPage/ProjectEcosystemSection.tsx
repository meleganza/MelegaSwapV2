import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEcosystemDocument, ProjectService } from 'registry/projects/identity/ecosystem'
import { ECOSYSTEM_GROUP_KEYS, GROUP_LABELS, type EcosystemGroupKey } from 'registry/projects/identity/ecosystem'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Cards = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const IconBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const Meta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  word-break: break-word;
`

const Title = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const OpenLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Details = styled.details`
  margin-top: 2px;

  & > summary {
    cursor: pointer;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.textSubtle};
    text-decoration: underline;
    text-underline-offset: 2px;
    list-style: none;
  }

  & > summary::-webkit-details-marker {
    display: none;
  }

  & > summary:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Expanded = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const SubHeading = styled(Heading)`
  && {
    font-size: 18px;
  }
`

function openHref(service: ProjectService): string | null {
  return service.route ?? service.externalUrl
}

function isExternal(service: ProjectService): boolean {
  return Boolean(service.externalUrl) && !service.route
}

const ServiceCard: React.FC<{ service: ProjectService }> = ({ service }) => {
  const href = openHref(service)
  const openable =
    Boolean(href) &&
    (service.lifecycle === 'ACTIVE' ||
      service.lifecycle === 'BETA' ||
      service.lifecycle === 'PREVIEW' ||
      service.lifecycle === 'PLANNED')

  return (
    <Card data-testid={`ecosystem-service-${service.serviceId}`} data-lifecycle={service.lifecycle}>
      <Flex style={{ gap: 10, alignItems: 'flex-start' }}>
        <IconBadge aria-hidden="true" title={service.category}>
          {service.iconKey}
        </IconBadge>
        <Flex flexDirection="column" style={{ gap: 4, minWidth: 0, flex: 1 }}>
          <Meta>
            <span data-testid="service-category">{service.category.replace(/_/g, ' ')}</span>
            {' · '}
            <span data-testid="service-lifecycle" aria-label={`Lifecycle: ${service.lifecycle}`}>
              {service.lifecycle}
            </span>
            {' · '}
            <span data-testid="service-type">{service.type.replace(/_/g, ' ')}</span>
          </Meta>
          <Title as="h4">{service.title}</Title>
          <Fact data-testid="service-summary">{service.summary}</Fact>
          {service.supportedChains.length > 0 ? (
            <Fact data-testid="service-chains">Chains: {service.supportedChains.join(', ')}</Fact>
          ) : null}
          {openable && href ? (
            <OpenLink
              href={href}
              data-testid="service-open"
              aria-label={`Open ${service.title}`}
              {...(isExternal(service) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              Open
            </OpenLink>
          ) : (
            <Meta data-testid="service-open-unavailable">Open unavailable</Meta>
          )}

          <Details data-testid="service-details">
            <summary aria-label={`Service details for ${service.title}`}>Details</summary>
            <Expanded>
              <Fact>{service.summary}</Fact>
              {service.capabilities.length > 0 ? <Fact>Capabilities: {service.capabilities.join(', ')}</Fact> : null}
              {service.supportedChains.length > 0 ? (
                <Fact>Supported chains: {service.supportedChains.join(', ')}</Fact>
              ) : null}
              <Fact>
                Provenance: {service.provenance.sourceClass} · Verification: {service.verification.state}
              </Fact>
              {service.evidenceIds.length > 0 ? (
                <Fact data-testid="service-evidence">Evidence: {service.evidenceIds.join(', ')}</Fact>
              ) : (
                <Fact>Evidence: none attached</Fact>
              )}
              {service.relatedSectionIds.length > 0 ? (
                <Fact>
                  Related sections:{' '}
                  {service.relatedSectionIds.map((id, idx) => (
                    <React.Fragment key={id}>
                      {idx > 0 ? ', ' : null}
                      <a href={`#${id}`}>{id}</a>
                    </React.Fragment>
                  ))}
                </Fact>
              ) : null}
              {service.relatedUpdateIds.length > 0 ? (
                <Fact data-testid="service-related-updates">
                  Related updates: {service.relatedUpdateIds.join(', ')}
                </Fact>
              ) : null}
              {service.relatedDocumentationUrls.length > 0 ? (
                <Fact>
                  Documentation:{' '}
                  {service.relatedDocumentationUrls.map((url, idx) => (
                    <React.Fragment key={url}>
                      {idx > 0 ? ', ' : null}
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </a>
                    </React.Fragment>
                  ))}
                </Fact>
              ) : null}
              <Fact>
                Revision {service.revision} · updated <time dateTime={service.updatedAt}>{service.updatedAt}</time>
              </Fact>
            </Expanded>
          </Details>
        </Flex>
      </Flex>
    </Card>
  )
}

interface Props {
  ecosystemDocument: ProjectEcosystemDocument
  document: CanonicalProjectDocument
}

const ProjectEcosystemSection: React.FC<Props> = ({ ecosystemDocument, document: doc }) => {
  const byGroup = ECOSYSTEM_GROUP_KEYS.reduce<Record<EcosystemGroupKey, ProjectService[]>>((acc, key) => {
    acc[key] = ecosystemDocument.services.filter((s) => s.group === key)
    return acc
  }, {} as Record<EcosystemGroupKey, ProjectService[]>)

  return (
    <Stack
      as="section"
      id="ecosystem"
      data-testid="project-ecosystem-section"
      data-pp009="true"
      aria-labelledby="ecosystem-heading"
    >
      <Heading as="h2" id="ecosystem-heading" scale="md">
        Ecosystem
      </Heading>
      <Fact data-testid="ecosystem-summary-line">
        {ecosystemDocument.summary.totalServices} services · {ecosystemDocument.summary.activeServiceCount} active
      </Fact>

      {ECOSYSTEM_GROUP_KEYS.map((group) => {
        const items = byGroup[group]
        if (!items.length) return null
        const headingId = `ecosystem-group-${group.toLowerCase()}`
        return (
          <Group key={group} aria-labelledby={headingId} data-testid={`ecosystem-group-${group}`}>
            <SubHeading as="h3" id={headingId} scale="md">
              {GROUP_LABELS[group]}
            </SubHeading>
            <Cards>
              {items.map((service) => (
                <ServiceCard key={service.serviceId} service={service} />
              ))}
            </Cards>
          </Group>
        )
      })}

      <Group aria-labelledby="deployments-heading" data-testid="project-deployments">
        <SubHeading as="h3" id="deployments-heading" scale="md">
          Supported chains and deployments
        </SubHeading>
        {doc.deployments.length > 0 ? (
          <Cards as="ul">
            {doc.deployments.map((deployment) => (
              <Card key={deployment.deploymentId} as="li">
                <Text fontSize="14px">
                  {doc.chains.find((c) => c.chainId === deployment.chainId)?.label ?? deployment.caip2}
                </Text>
                <Fact>
                  {deployment.caip2}
                  {deployment.status.meta.availability === 'AVAILABLE' && deployment.status.value
                    ? ` · ${deployment.status.value}`
                    : ''}
                  {` · ${deployment.associatedContractIds.length} associated contract(s)`}
                </Fact>
              </Card>
            ))}
          </Cards>
        ) : (
          <Fact>No deployments listed in registry.</Fact>
        )}
      </Group>

      {ecosystemDocument.relationships.length > 0 ? (
        <Fact data-testid="ecosystem-relationships-count">
          {ecosystemDocument.relationships.length} machine-readable relationship
          {ecosystemDocument.relationships.length === 1 ? '' : 's'}
        </Fact>
      ) : null}

      <Fact>{ecosystemDocument.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectEcosystemSection
