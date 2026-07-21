import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { DeveloperResource, ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import {
  DEVELOPER_GROUP_KEYS,
  DEVELOPER_GROUP_LABELS,
  type DeveloperGroupKey,
} from 'registry/projects/identity/developer'

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

function openHref(resource: DeveloperResource): string | null {
  return resource.route ?? resource.url
}

function isExternal(resource: DeveloperResource): boolean {
  return Boolean(resource.url) && !resource.route
}

const ResourceCard: React.FC<{ resource: DeveloperResource }> = ({ resource }) => {
  const href = openHref(resource)
  const openable =
    Boolean(href) &&
    (resource.lifecycle === 'ACTIVE' ||
      resource.lifecycle === 'BETA' ||
      resource.lifecycle === 'PREVIEW' ||
      resource.lifecycle === 'PLANNED')

  return (
    <Card data-testid={`developer-resource-${resource.resourceId}`} data-lifecycle={resource.lifecycle}>
      <Meta>
        <span data-testid="resource-category">{resource.category.replace(/_/g, ' ')}</span>
        {' · '}
        <span data-testid="resource-lifecycle" aria-label={`Lifecycle: ${resource.lifecycle}`}>
          {resource.lifecycle}
        </span>
        {' · '}
        <span data-testid="resource-version" aria-label={`Version ${resource.version}`}>
          v{resource.version}
        </span>
        {' · '}
        <span data-testid="resource-availability">{resource.availability}</span>
      </Meta>
      <Title as="h4">{resource.title}</Title>
      <Fact data-testid="resource-summary">{resource.summary}</Fact>
      {resource.contractAddress ? (
        <Fact data-testid="resource-contract">Contract: {resource.contractAddress}</Fact>
      ) : null}
      {openable && href ? (
        <OpenLink
          href={href}
          data-testid="resource-open"
          aria-label={`Open ${resource.title}`}
          {...(isExternal(resource) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          Open
        </OpenLink>
      ) : (
        <Meta data-testid="resource-open-unavailable">Open unavailable</Meta>
      )}

      <Details data-testid="resource-details">
        <summary aria-label={`Resource details for ${resource.title}`}>Details</summary>
        <Expanded>
          <Fact>{resource.summary}</Fact>
          <Fact>
            Type: {resource.type.replace(/_/g, ' ')} · Machine-readable: {resource.machineReadable ? 'yes' : 'no'}
          </Fact>
          {resource.supportedChains.length > 0 ? (
            <Fact>Supported chains: {resource.supportedChains.join(', ')}</Fact>
          ) : null}
          <Fact>
            Provenance: {resource.provenance.sourceClass} · Verification: {resource.verification.state}
          </Fact>
          {resource.evidenceIds.length > 0 ? (
            <Fact data-testid="resource-evidence">Evidence: {resource.evidenceIds.join(', ')}</Fact>
          ) : (
            <Fact>Evidence: none attached</Fact>
          )}
          {resource.relatedSectionIds.length > 0 ? (
            <Fact>
              Related sections:{' '}
              {resource.relatedSectionIds.map((id, idx) => (
                <React.Fragment key={id}>
                  {idx > 0 ? ', ' : null}
                  <a href={`#${id}`}>{id}</a>
                </React.Fragment>
              ))}
            </Fact>
          ) : null}
          {resource.relatedServiceIds.length > 0 ? (
            <Fact data-testid="resource-related-services">
              Related services: {resource.relatedServiceIds.join(', ')}
            </Fact>
          ) : null}
          {resource.relatedUpdateIds.length > 0 ? (
            <Fact data-testid="resource-related-updates">Related updates: {resource.relatedUpdateIds.join(', ')}</Fact>
          ) : null}
          <Fact>
            Revision {resource.revision} · updated <time dateTime={resource.updatedAt}>{resource.updatedAt}</time>
          </Fact>
        </Expanded>
      </Details>
    </Card>
  )
}

interface Props {
  developerDocument: ProjectDeveloperDocument
}

const ProjectDeveloperSection: React.FC<Props> = ({ developerDocument }) => {
  const byGroup = DEVELOPER_GROUP_KEYS.reduce<Record<DeveloperGroupKey, DeveloperResource[]>>((acc, key) => {
    acc[key] = developerDocument.resources.filter((r) => r.group === key)
    return acc
  }, {} as Record<DeveloperGroupKey, DeveloperResource[]>)

  return (
    <Stack
      as="section"
      id="developer"
      data-testid="project-developer-section"
      data-pp010="true"
      aria-labelledby="developer-heading"
    >
      <Heading as="h2" id="developer-heading" scale="md">
        Developer
      </Heading>
      <Fact data-testid="developer-summary-line">
        {developerDocument.summary.totalResources} resources · {developerDocument.summary.activeResourceCount} active
      </Fact>

      {DEVELOPER_GROUP_KEYS.map((group) => {
        const items = byGroup[group]
        if (!items.length) return null
        const headingId = `developer-group-${group.toLowerCase()}`
        return (
          <Group key={group} aria-labelledby={headingId} data-testid={`developer-group-${group}`}>
            <SubHeading as="h3" id={headingId} scale="md">
              {DEVELOPER_GROUP_LABELS[group]}
            </SubHeading>
            <Cards>
              {items.map((resource) => (
                <ResourceCard key={resource.resourceId} resource={resource} />
              ))}
            </Cards>
          </Group>
        )
      })}

      {developerDocument.relationships.length > 0 ? (
        <Fact data-testid="developer-relationships-count">
          {developerDocument.relationships.length} machine-readable relationship
          {developerDocument.relationships.length === 1 ? '' : 's'}
        </Fact>
      ) : null}

      <Fact>{developerDocument.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectDeveloperSection
