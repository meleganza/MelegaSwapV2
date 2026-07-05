import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      visual={<MelegaProjectCube />}
      title="Build with Melega"
      description="List your token, add liquidity, create a farm, or reward MARCO holders."
      primaryAction={{ label: 'Open Build Studio', href: '/build-studio' }}
      secondaryAction={{ label: 'Reward MARCO holders', href: '/pools' }}
    />
  </div>
)

export default ListProjectCta
