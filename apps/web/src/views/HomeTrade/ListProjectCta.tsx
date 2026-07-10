import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      href="/build-studio"
      visual={<MelegaProjectCube />}
      title="Build with Melega"
      description="List your token, add liquidity, create a farm, or launch on Melega infrastructure."
    />
  </div>
)

export default ListProjectCta
