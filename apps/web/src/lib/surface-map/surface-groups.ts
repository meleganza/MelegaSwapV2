import { SurfaceGroup, SurfaceGroupId } from './surface-types'

export const SURFACE_MAP_VERSION = '0.1.0'

export const SURFACE_MAP_AS_OF = '2026-06-28'

export const SURFACE_MAP_DISCLAIMER =
  'Unified surface map read model for humans and AI agents. Navigation index only — no swap, wallet, or contract logic changes. Retired surfaces link to replacements; legacy NFT pages preserved.'

export const SURFACE_GROUP_ORDER: SurfaceGroupId[] = ['execute', 'create', 'understand', 'manage']

export const SURFACE_GROUPS: SurfaceGroup[] = [
  {
    id: 'execute',
    label: 'Execute',
    description: 'On-chain and decision-layer execution surfaces — swap, liquidity, farms, pools, smart execution.',
    agentSummary: 'Route economic actions and execution-quality decisions. On-chain surfaces require wallet; execution layer is read-only illustrative.',
  },
  {
    id: 'create',
    label: 'Create',
    description: 'Launch, activation, collectibles, and retired legacy creation paths.',
    agentSummary: 'Identify creation and listing capabilities. Prefer /launch and /new-project over retired /ilo.',
  },
  {
    id: 'understand',
    label: 'Understand',
    description: 'Constitutional registry graph — projects, assets, venues, events, presence, query.',
    agentSummary: 'Resolve indexed economic context before acting. Read-only registry surfaces with machine manifests.',
  },
  {
    id: 'manage',
    label: 'Manage',
    description: 'Operational workspace, economic identity, and legacy NFT wallet/market surfaces.',
    agentSummary: 'Orient operator identity and portfolio surfaces. Workspace and identity are read models; NFT pages are legacy on-chain.',
  },
]

export const getSurfaceGroup = (id: SurfaceGroupId): SurfaceGroup | undefined =>
  SURFACE_GROUPS.find((group) => group.id === id)
