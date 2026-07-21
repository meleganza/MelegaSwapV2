import React from 'react'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import TrustEvidencePanel from '../TrustEvidencePanel'
import ReadinessTrustSnapshot from '../ReadinessTrustSnapshot'
import ProjectMachineSection from '../ProjectMachineSection'
import { Accordion, AccordionSummary, BodyText, Card, MutedText, Section, SectionTitle } from './theme'

interface Props {
  evidencePack: ProjectEvidencePack
  readinessDocument: ProjectReadinessDocument
  machineDocument: ProjectMachineDocument
}

const ProjectTransparencySummary: React.FC<Props> = ({
  evidencePack,
  readinessDocument,
  machineDocument,
}) => (
  <Section aria-labelledby="transparency-heading">
    <SectionTitle id="transparency-heading">Transparency</SectionTitle>
    <Card>
      <BodyText style={{ fontSize: 16 }}>
        This project publishes registry-backed trust and readiness signals. Detailed machine evidence
        stays available for reviewers who need the full technical report.
      </BodyText>
      <MutedText>
        Readiness {readinessDocument.readiness.score}/{readinessDocument.readiness.maxScore} ·{' '}
        {readinessDocument.readiness.stateLabel}
      </MutedText>
      <Accordion>
        <AccordionSummary>View technical transparency report</AccordionSummary>
        <ReadinessTrustSnapshot readiness={readinessDocument} />
        <TrustEvidencePanel pack={evidencePack} />
        <ProjectMachineSection machineDocument={machineDocument} />
      </Accordion>
    </Card>
  </Section>
)

export default ProjectTransparencySummary
