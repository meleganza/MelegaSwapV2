import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import { Accordion, AccordionSummary, BodyText, Card, MutedText, Section, SectionTitle } from './theme'

const ReadinessTrustSnapshot = dynamic(() => import('../ReadinessTrustSnapshot'), { ssr: false })
const TrustEvidencePanel = dynamic(() => import('../TrustEvidencePanel'), { ssr: false })
const ProjectMachineSection = dynamic(() => import('../ProjectMachineSection'), { ssr: false })

interface Props {
  evidencePack: ProjectEvidencePack
  readinessDocument: ProjectReadinessDocument
  machineDocument: ProjectMachineDocument
}

const ProjectTransparencySummary: React.FC<Props> = ({
  evidencePack,
  readinessDocument,
  machineDocument,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Section aria-labelledby="transparency-heading" data-testid="project-transparency-summary">
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
        <Accordion
          open={open}
          onToggle={(event) => {
            const next = (event.currentTarget as HTMLDetailsElement).open
            setOpen(next)
          }}
        >
          <AccordionSummary>View technical transparency report</AccordionSummary>
          {open ? (
            <>
              <ReadinessTrustSnapshot readiness={readinessDocument} />
              <TrustEvidencePanel pack={evidencePack} />
              <ProjectMachineSection machineDocument={machineDocument} />
            </>
          ) : null}
        </Accordion>
      </Card>
    </Section>
  )
}

export default ProjectTransparencySummary
