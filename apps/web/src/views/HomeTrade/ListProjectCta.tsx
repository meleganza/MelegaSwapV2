import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

/** Home entry for the canonical contract-first List flow. */
export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      href="/list"
      visual={<MelegaProjectCube />}
      title="Create / Import Project"
      description="Detect an existing token or create one, then complete liquidity and claim its Project Page."
    />
  </div>
)

export default ListProjectCta
