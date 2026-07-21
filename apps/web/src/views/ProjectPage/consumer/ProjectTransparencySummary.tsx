import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import { Accordion, AccordionSummary, BodyText, MutedText, Section, SectionTitle, SoftCard } from './theme'

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
    <Section aria-labelledby="trust-heading" data-testid="project-transparency-summary">
      <SectionTitle id="trust-heading">Security & Transparency</SectionTitle>
      <SoftCard>
        <BodyText style={{ fontSize: 16 }}>
          Registry-backed trust and readiness signals for this project. Open the technical report
          when you need the full evidence trail.
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
          <AccordionSummary>View technical report</AccordionSummary>
          {open ? (
            <>
              <ReadinessTrustSnapshot readiness={readinessDocument} />
              <TrustEvidencePanel pack={evidencePack} />
              <ProjectMachineSection machineDocument={machineDocument} />
            </>
          ) : null}
        </Accordion>
      </SoftCard>
    </Section>
  )
}

export default ProjectTransparencySummary
