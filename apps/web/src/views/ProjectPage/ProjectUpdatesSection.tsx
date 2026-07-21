import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectUpdate, ProjectUpdatesDocument } from 'registry/projects/identity/updates'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-bottom: 12px;
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
  word-break: break-word;
`

const Details = styled.details`
  margin-top: 4px;

  & > summary {
    cursor: pointer;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.secondary};
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

function formatPublishedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function statusLabel(status: ProjectUpdate['status']): string {
  return status.replace(/_/g, ' ')
}

const UpdateCard: React.FC<{ update: ProjectUpdate }> = ({ update }) => {
  const affected = [
    ...update.affectedCapabilities.map((c) => `capability:${c}`),
    ...update.affectedDeployments.map((d) => `deployment:${d}`),
    ...update.affectedAssets.map((a) => `asset:${a}`),
    ...update.affectedContracts.map((c) => `contract:${c}`),
  ]

  return (
    <Item data-testid={`project-update-${update.updateId}`} data-update-status={update.status}>
      <Meta>
        <span data-testid="update-category">{update.category.replace(/_/g, ' ')}</span>
        {' · '}
        <time dateTime={update.publishedAt} data-testid="update-published-at">
          {formatPublishedAt(update.publishedAt)}
        </time>
        {' · '}
        <span data-testid="update-verification" aria-label={`Verification: ${update.verification.state}`}>
          {update.verification.state.replace(/_/g, ' ')}
        </span>
        {' · '}
        <span data-testid="update-status" aria-label={`Status: ${statusLabel(update.status)}`}>
          {statusLabel(update.status)}
        </span>
      </Meta>
      <Title as="h3">{update.title}</Title>
      <Fact data-testid="update-summary">{update.summary}</Fact>
      {affected.length > 0 ? (
        <Fact data-testid="update-affected-areas">Affected: {affected.slice(0, 6).join(' · ')}</Fact>
      ) : null}

      <Details data-testid="update-read-details">
        <summary aria-label={`Read update: ${update.title}`}>Read update</summary>
        <Expanded>
          <Fact data-testid="update-content" style={{ whiteSpace: 'pre-wrap' }}>
            {update.content}
          </Fact>
          {update.affectedCapabilities.length > 0 ? (
            <Fact>Capabilities: {update.affectedCapabilities.join(', ')}</Fact>
          ) : null}
          {update.affectedDeployments.length > 0 ? (
            <Fact>Chains / deployments: {update.affectedDeployments.join(', ')}</Fact>
          ) : null}
          {update.affectedContracts.length > 0 ? <Fact>Contracts: {update.affectedContracts.join(', ')}</Fact> : null}
          {update.evidenceIds.length > 0 ? (
            <Fact data-testid="update-evidence">Evidence: {update.evidenceIds.join(', ')}</Fact>
          ) : (
            <Fact>Evidence: none attached (verification not invented)</Fact>
          )}
          <Fact data-testid="update-revision">
            Revision {update.revision} · version {update.version} · author {update.authorType}/{update.authorIdentity}
          </Fact>
          {update.supersedesUpdate ? (
            <Fact data-testid="update-supersedes">Supersedes update {update.supersedesUpdate}</Fact>
          ) : null}
          {update.status === 'SUPERSEDED' ? (
            <Fact data-testid="update-superseded-notice">
              This update has been superseded. See newer timeline entries.
            </Fact>
          ) : null}
          {update.status === 'RETRACTED' ? (
            <Fact data-testid="update-retracted-notice">This update has been retracted and is not current.</Fact>
          ) : null}
          {update.status === 'ARCHIVED' ? (
            <Fact data-testid="update-archived-notice">This update is archived and retained for chronology.</Fact>
          ) : null}
        </Expanded>
      </Details>
    </Item>
  )
}

interface Props {
  updatesDocument: ProjectUpdatesDocument
}

/** Latest Updates — canonical operational timeline (not a social feed). */
const ProjectUpdatesSection: React.FC<Props> = ({ updatesDocument }) => {
  if (updatesDocument.updates.length === 0) {
    return (
      <Stack
        as="section"
        id="updates"
        data-testid="project-updates-section"
        data-pp008="true"
        aria-labelledby="updates-heading"
      >
        <Heading as="h2" id="updates-heading" scale="md">
          Latest Updates
        </Heading>
        <Fact data-testid="updates-empty">No public project updates are currently registered.</Fact>
      </Stack>
    )
  }

  return (
    <Stack
      as="section"
      id="updates"
      data-testid="project-updates-section"
      data-pp008="true"
      aria-labelledby="updates-heading"
    >
      <Heading as="h2" id="updates-heading" scale="md">
        Latest Updates
      </Heading>
      <Fact data-testid="updates-summary-line">
        {updatesDocument.summary.totalPublicUpdates} public update
        {updatesDocument.summary.totalPublicUpdates === 1 ? '' : 's'}
        {updatesDocument.summary.latestPublishedAt
          ? ` · Latest ${formatPublishedAt(updatesDocument.summary.latestPublishedAt)}`
          : ''}
      </Fact>
      <Timeline aria-label="Project updates timeline">
        {updatesDocument.updates.map((update) => (
          <UpdateCard key={update.updateId} update={update} />
        ))}
      </Timeline>
      <Fact>{updatesDocument.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectUpdatesSection
