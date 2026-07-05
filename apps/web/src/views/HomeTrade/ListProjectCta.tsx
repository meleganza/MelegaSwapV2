import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

export const ListProjectCta: React.FC = () => (
  <div data-build-cta="true">
    <MelegaCtaCard
      visual={<MelegaProjectCube />}
      title="Build with Melega"
      description="Import & analyze your token contract. Registry verification and infrastructure proposal in one workflow."
      primaryAction={{ label: 'Import & Analyze Token', href: '/build-studio#build-import' }}
      secondaryAction={{ label: 'Explore Projects', href: '/projects' }}
    />
  </div>
)

export default ListProjectCta
