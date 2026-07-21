import React from 'react'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import { humanEnumLabel } from '../presentation/humanLabels'
import { BodyText, Card, MutedText, Section, SectionTitle, SubTitle } from './theme'

interface Props {
  roadmapDocument: ProjectRoadmapDocument | null
}

const ProjectRoadmapSection: React.FC<Props> = ({ roadmapDocument }) => {
  if (!roadmapDocument) {
    return (
      <Section id="roadmap" aria-labelledby="roadmap-heading">
        <SectionTitle id="roadmap-heading">Roadmap</SectionTitle>
        <MutedText>Roadmap data is unavailable for this project.</MutedText>
      </Section>
    )
  }

  const milestones = roadmapDocument.milestones

  return (
    <Section id="roadmap" aria-labelledby="roadmap-heading">
      <SectionTitle id="roadmap-heading">Roadmap</SectionTitle>

      {!roadmapDocument.published && roadmapDocument.unpublishedReason ? (
        <MutedText>{roadmapDocument.unpublishedReason}</MutedText>
      ) : null}

      {milestones.length > 0 ? (
        <Card as="ol" style={{ listStyle: 'none', margin: 0, padding: 16 }}>
          {milestones.map((milestone) => (
            <li
              key={milestone.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                paddingBottom: 14,
                borderBottom: '1px solid #2a2a2a',
              }}
            >
              <SubTitle as="h3" style={{ fontSize: 16 }}>
                {milestone.title}
              </SubTitle>
              <MutedText style={{ fontSize: 13 }}>
                {humanEnumLabel(milestone.status)}
                {milestone.targetPeriod ? ` · ${milestone.targetPeriod}` : ''}
              </MutedText>
              <BodyText style={{ fontSize: 15 }}>{milestone.description}</BodyText>
            </li>
          ))}
        </Card>
      ) : (
        <MutedText>No roadmap milestones are published in the certified registry.</MutedText>
      )}
    </Section>
  )
}

export default ProjectRoadmapSection
