import React from 'react'
import styled from 'styled-components'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import { BodyText, EmptyState, EmptyStateBody, EmptyStateTitle, MutedText, Section, SectionTitle } from './theme'

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-left: 2px solid rgba(212, 175, 55, 0.25);
`

const Milestone = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 24px 16px;

  &::before {
    content: '';
    position: absolute;
    left: -27px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #d4af37;
    border: 2px solid #0a0a0a;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.35);
  }

  &:last-child {
    padding-bottom: 0;
  }
`

const StatusPill = styled.span<{ $tone: 'done' | 'active' | 'upcoming' | 'planned' }>`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $tone }) =>
    $tone === 'done'
      ? '#1be77a'
      : $tone === 'active'
        ? '#d4af37'
        : $tone === 'upcoming'
          ? '#c8c8c8'
          : '#8f8f8f'};
  background: ${({ $tone }) =>
    $tone === 'done'
      ? 'rgba(27, 231, 122, 0.12)'
      : $tone === 'active'
        ? 'rgba(212, 175, 55, 0.12)'
        : 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'done'
        ? 'rgba(27, 231, 122, 0.35)'
        : $tone === 'active'
          ? 'rgba(212, 175, 55, 0.35)'
          : 'rgba(255, 255, 255, 0.08)'};
`

const MilestoneTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: #ffffff;
`

function roadmapStatusLabel(status: string): string {
  const normalized = status.toUpperCase()
  if (/COMPLETE|DONE|SHIPPED/.test(normalized)) return 'Completed'
  if (/PROGRESS|ACTIVE|CURRENT/.test(normalized)) return 'In progress'
  if (/UPCOMING|NEXT/.test(normalized)) return 'Upcoming'
  return 'Planned'
}

function roadmapStatusTone(status: string): 'done' | 'active' | 'upcoming' | 'planned' {
  const label = roadmapStatusLabel(status)
  if (label === 'Completed') return 'done'
  if (label === 'In progress') return 'active'
  if (label === 'Upcoming') return 'upcoming'
  return 'planned'
}

interface Props {
  roadmapDocument: ProjectRoadmapDocument | null
}

const ProjectRoadmapSection: React.FC<Props> = ({ roadmapDocument }) => {
  if (!roadmapDocument) {
    return (
      <Section id="roadmap" aria-labelledby="roadmap-heading">
        <SectionTitle id="roadmap-heading">Roadmap</SectionTitle>
        <EmptyState>
          <EmptyStateTitle>Publishing soon</EmptyStateTitle>
          <EmptyStateBody>Milestone updates will appear here when the team publishes them.</EmptyStateBody>
        </EmptyState>
      </Section>
    )
  }

  const milestones = roadmapDocument.milestones

  return (
    <Section id="roadmap" aria-labelledby="roadmap-heading">
      <SectionTitle id="roadmap-heading">Roadmap</SectionTitle>

      {milestones.length > 0 ? (
        <Timeline aria-label="Project roadmap">
          {milestones.map((milestone) => (
            <Milestone key={milestone.id}>
              <StatusPill $tone={roadmapStatusTone(milestone.status)}>
                {roadmapStatusLabel(milestone.status)}
              </StatusPill>
              <MilestoneTitle>{milestone.title}</MilestoneTitle>
              {milestone.targetPeriod ? (
                <MutedText style={{ fontSize: 13 }}>{milestone.targetPeriod}</MutedText>
              ) : null}
              <BodyText style={{ fontSize: 15 }}>{milestone.description}</BodyText>
            </Milestone>
          ))}
        </Timeline>
      ) : (
        <EmptyState>
          <EmptyStateTitle>Publishing soon</EmptyStateTitle>
          <EmptyStateBody>
            {roadmapDocument.unpublishedReason ??
              'The team has not published roadmap milestones yet. Check back soon.'}
          </EmptyStateBody>
        </EmptyState>
      )}
    </Section>
  )
}

export default ProjectRoadmapSection
