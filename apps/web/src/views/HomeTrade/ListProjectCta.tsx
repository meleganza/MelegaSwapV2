import React from 'react'
import { MelegaCtaCard, MelegaProjectCube } from 'design-system/melega'

export const ListProjectCta: React.FC = () => (
  <div data-list-project-cta="true">
    <MelegaCtaCard
      visual={<MelegaProjectCube />}
      title="List your project on Melega DEX"
      description="List your token, add liquidity, create a farm, or reward MARCO holders."
      primaryAction={{ label: 'Start listing', href: '/launch' }}
      secondaryAction={{ label: 'Reward MARCO holders', href: '/pools' }}
    />
  </div>
)

export default ListProjectCta
