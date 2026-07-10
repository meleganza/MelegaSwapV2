/**
 * Identity Hub — civilization identity collection registry.
 * Honest status only; only BabyMARCO Genesis is active in this build.
 */

export type IdentityCollectionStatus = 'active' | 'planned' | 'future'

export interface IdentityHubCollectionCard {
  id: string
  name: string
  status: IdentityCollectionStatus
  statusLabel: 'Active' | 'Planned' | 'Future'
  role: string
  supply: string
  mintAvailable: boolean
}

export const IDENTITY_HUB_COLLECTIONS: IdentityHubCollectionCard[] = [
  {
    id: 'babymarco-genesis',
    name: 'BabyMARCO Genesis',
    status: 'active',
    statusLabel: 'Active',
    role: 'Genesis Identity',
    supply: '1000',
    mintAvailable: true,
  },
  {
    id: 'masterm',
    name: 'Master M',
    status: 'planned',
    statusLabel: 'Planned',
    role: 'Master Identity',
    supply: 'Planned',
    mintAvailable: false,
  },
  {
    id: 'aaron',
    name: 'Aaron',
    status: 'planned',
    statusLabel: 'Planned',
    role: 'Builder Identity',
    supply: 'Planned',
    mintAvailable: false,
  },
  {
    id: 'raky',
    name: 'Raky',
    status: 'planned',
    statusLabel: 'Planned',
    role: 'Operator Identity',
    supply: 'Planned',
    mintAvailable: false,
  },
  {
    id: 'future',
    name: 'Future',
    status: 'future',
    statusLabel: 'Future',
    role: 'Civilization Expansion',
    supply: 'Future',
    mintAvailable: false,
  },
]

export const IDENTITY_HUB_NAV_LABEL = 'Identity Hub'

/** Page hero — civilization identity program (distinct from Identity Console economic read model). */
export const IDENTITY_HUB_PAGE_TITLE = 'Identity Hub'
