import React from 'react'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import { useProjectWalletRelationship } from './useProjectWalletRelationship'
import WalletRelationshipSection from './WalletRelationshipSection'

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
}

/** Client-only wallet relationship — must not run in getStaticProps / SEO. */
const ProjectWalletRelationship: React.FC<Props> = ({ document, evidencePack }) => {
  const { relationshipDocument, loading } = useProjectWalletRelationship(document, evidencePack)
  return <WalletRelationshipSection document={relationshipDocument} loading={loading} />
}

export default ProjectWalletRelationship
