import { HumanIntent } from 'views/HumanCore'

export const CREATE_INTENTS: HumanIntent[] = [
  {
    id: 'list-project',
    title: 'List project',
    description: 'List your token on Melega DEX and submit for review.',
    href: '/submit',
    emphasized: true,
    badge: 'Recommended',
  },
  {
    id: 'create-token',
    title: 'Create token',
    description: 'Start a token launch flow when available on your chain.',
    href: '/launch',
  },
  {
    id: 'add-liquidity',
    title: 'Add liquidity',
    description: 'Provide liquidity using the existing safe flow.',
    href: '/liquidity',
  },
  {
    id: 'create-farm',
    title: 'Create farm',
    description: 'Boost visibility with a farm when supported.',
    href: '/farms',
  },
  {
    id: 'reward-marco',
    title: 'Reward MARCO holders',
    description: 'Stake MARCO → earn your token. Recommended for project visibility.',
    href: '/pools',
    emphasized: true,
    badge: 'Recommended',
  },
  {
    id: 'create-staking-pool',
    title: 'Create staking pool',
    description: 'Custom staking pool configuration when supported.',
    href: '/pools',
  },
  {
    id: 'submit-metadata',
    title: 'Submit metadata',
    description: 'Upload logo, links, and project metadata for review.',
    href: '/submit',
  },
  {
    id: 'create-collectible',
    title: 'Create collectible',
    description: 'Explore collectible surfaces and legacy mint paths.',
    href: '/collectibles',
  },
]

export const MARCO_STAKING_INTENTS: HumanIntent[] = [
  {
    id: 'marco-recommended',
    title: 'Stake MARCO → Earn your token',
    description:
      'Let MARCO holders stake MARCO and earn your token. Connects your launch to the canonical MARCO economy.',
    href: '/pools',
    emphasized: true,
    badge: 'Recommended',
  },
  {
    id: 'marco-custom',
    title: 'Custom staking pool',
    description: 'Configure your own stake and reward pair when supported.',
    href: '/pools',
  },
]
