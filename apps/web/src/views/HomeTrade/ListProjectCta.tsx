import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      visual={<MelegaProjectCube />}
      title="Build with Melega"
      description="List your token, add liquidity, create a farm, or launch on Melega infrastructure."
      primaryAction={{ label: 'Import & Analyze Token', href: '/build-studio#build-import' }}
    />
  </div>
)

export default ListProjectCta
