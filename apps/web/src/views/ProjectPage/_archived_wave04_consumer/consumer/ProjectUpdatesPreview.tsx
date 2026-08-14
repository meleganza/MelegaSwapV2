import React from 'react'
import styled from 'styled-components'
import type { ProjectUpdate, ProjectUpdatesDocument } from 'registry/projects/identity/updates'
import { formatRelativeTime, humanEnumLabel } from '../presentation/humanLabels'
import { BodyText, Card, MutedText, Section, SectionTitle, TextLink } from './theme'

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
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Meta = styled.span`
  font-size: 13px;
  color: #8f8f8f;
`

interface Props {
  updatesDocument: ProjectUpdatesDocument
}

const PREVIEW_COUNT = 3

function formatPublishedAt(iso: string): string {
  return formatRelativeTime(iso) ?? iso
}

const UpdatePreview: React.FC<{ update: ProjectUpdate }> = ({ update }) => (
  <Item>
    <Meta>
      {humanEnumLabel(update.category)} · {formatPublishedAt(update.publishedAt)} ·{' '}
      {humanEnumLabel(update.status)}
    </Meta>
    <BodyText style={{ fontWeight: 600 }}>{update.title}</BodyText>
    <MutedText style={{ fontSize: 15 }}>{update.summary}</MutedText>
  </Item>
)

const ProjectUpdatesPreview: React.FC<Props> = ({ updatesDocument }) => {
  const preview = updatesDocument.updates.slice(0, PREVIEW_COUNT)
  const hasMore = updatesDocument.updates.length > PREVIEW_COUNT

  return (
    <Section id="updates" aria-labelledby="updates-heading">
      <SectionTitle id="updates-heading">Updates</SectionTitle>

      {preview.length === 0 ? (
        <MutedText style={{ fontSize: 15 }}>No public updates yet.</MutedText>
      ) : (
        <>
          <Card>
            <Timeline aria-label="Latest project updates">
              {preview.map((update) => (
                <UpdatePreview key={update.updateId} update={update} />
              ))}
            </Timeline>
          </Card>
          {hasMore ? (
            <TextLink href="#updates-all" aria-label="View all project updates">
              View all updates
            </TextLink>
          ) : null}
        </>
      )}

      {hasMore ? (
        <Section id="updates-all" aria-labelledby="updates-all-heading" style={{ gap: 10 }}>
          <SectionTitle as="h3" id="updates-all-heading" style={{ fontSize: '22px' }}>
            All updates
          </SectionTitle>
          <Card>
            <Timeline aria-label="All project updates">
              {updatesDocument.updates.map((update) => (
                <UpdatePreview key={`all-${update.updateId}`} update={update} />
              ))}
            </Timeline>
          </Card>
        </Section>
      ) : null}
    </Section>
  )
}

export default ProjectUpdatesPreview
