export const USER_WORKSPACE_VERSION = '0.1.0'

export const USER_WORKSPACE_AS_OF = '2026-06-28'

export const USER_WORKSPACE_DISCLAIMER =
  'User Economic Workspace read model only. Registry-indexed surfaces — no wallet balances, TVL, or on-chain execution in this view.'

export const WORKSPACE_EMPTY_MESSAGE = 'No economic activity yet.'

export const WORKSPACE_SECTION_ORDER = [
  'projects',
  'assets',
  'liquidity',
  'pools',
  'farms',
  'presence',
  'activation',
  'execution',
] as const

export const WORKSPACE_FUTURE_SURFACES = [
  {
    id: 'treasury',
    label: 'Treasury',
    status: 'PLANNED' as const,
    manifest: 'manifest://melega/platform/treasury-runtime@0.2.0',
    notes: 'Treasury Runtime — Phase 2. No amounts indexed.',
  },
  {
    id: 'labs',
    label: 'Labs',
    status: 'PLANNED' as const,
    manifest: 'labs://narrative/validated',
    notes: 'Labs handoff — narrative validation not indexed in this build.',
  },
  {
    id: 'radar',
    label: 'Radar',
    status: 'PLANNED' as const,
    manifest: 'manifest://melega/platform/radar@0.2.0',
    notes: 'Incident feed — Phase 2.',
  },
  {
    id: 'space',
    label: 'Space',
    status: 'PLANNED' as const,
    manifest: 'manifest://melega/platform/space@0.2.0',
    notes: 'Community bind — Phase 2.',
  },
  {
    id: 'smartdrop',
    label: 'SmartDrop',
    status: 'PLANNED' as const,
    manifest: 'manifest://melega/platform/smartdrop@0.2.0',
    notes: 'Campaign runtime — Phase 2.',
  },
]
