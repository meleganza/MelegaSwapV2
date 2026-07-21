import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

/** Home entry for Create / Import Project → certified Import Existing Token flow. */
export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      href="/import-existing-token"
      visual={<MelegaProjectCube />}
      title="Create / Import Project"
      description="Import an existing token, open a Project Page, or continue into Build Studio infrastructure tools."
    />
  </div>
)

export default ListProjectCta
