import React from 'react'
import dynamic from 'next/dynamic'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'

const ClientPositions = dynamic(() => import('./ProjectParticipationPositionsClient'), {
  ssr: false,
}) as React.ComponentType<{
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}>

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

/** Client-only wallet positions — reuses PP004 observation, never SSR. */
const ProjectParticipationPositions: React.FC<Props> = ({ document, evidencePack }) => (
  <ClientPositions document={document} evidencePack={evidencePack} />
)

export default ProjectParticipationPositions
