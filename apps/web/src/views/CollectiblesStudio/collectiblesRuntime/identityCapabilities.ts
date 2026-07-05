import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export type IdentityCapabilityId =
  | 'genesis'
  | 'builder'
  | 'validator'
  | 'master'
  | 'founder'
  | 'priority_ai'
  | 'premium_radar'
  | 'build_studio'
  | 'identity_badge'
  | 'future_governance'
  | 'early_access'

export type CapabilitySurface = 'live' | 'future' | 'unavailable'

/** User-facing privilege status — never use "Inactive" as primary label. */
export type PrivilegeDisplayStatus = 'ACTIVE' | 'LOCKED' | 'COMING SOON'

export interface IdentityPrivilege {
  id: IdentityCapabilityId
  label: string
  description: string
  surface: CapabilitySurface
  status: PrivilegeDisplayStatus
  capabilityRef: string
}

export interface IdentityCapabilityCard {
  id: IdentityCapabilityId
  label: string
  description: string
  surface: CapabilitySurface
  status: PrivilegeDisplayStatus
}

const GENESIS_PRIVILEGES: Omit<IdentityPrivilege, 'status'>[] = [
  {
    id: 'priority_ai',
    label: 'Priority AI',
    description: 'Elevated AI briefing and advisor surfaces in Command Center.',
    surface: 'live',
    capabilityRef: '/command-center',
  },
  {
    id: 'premium_radar',
    label: 'Premium Radar',
    description: 'Expanded contract intelligence in Radar Studio.',
    surface: 'live',
    capabilityRef: '/radar',
  },
  {
    id: 'build_studio',
    label: 'Build Studio',
    description: 'Economic infrastructure builder workspace access.',
    surface: 'live',
    capabilityRef: '/build-studio',
  },
  {
    id: 'identity_badge',
    label: 'Identity Badge',
    description: 'Genesis identity badge across civilization surfaces.',
    surface: 'live',
    capabilityRef: '/collectibles',
  },
  {
    id: 'future_governance',
    label: 'Future Governance',
    description: 'Civilization governance participation — not yet indexed.',
    surface: 'future',
    capabilityRef: 'future:governance',
  },
  {
    id: 'early_access',
    label: 'Early Access',
    description: 'Priority access to upcoming civilization capabilities.',
    surface: 'future',
    capabilityRef: 'future:early-access',
  },
]

const CAPABILITY_CARDS: IdentityCapabilityCard[] = [
  {
    id: 'genesis',
    label: 'Genesis',
    description: 'BabyMARCO Genesis civilization identity — wallet-verified ownership.',
    surface: 'live',
    status: 'LOCKED',
  },
  {
    id: 'builder',
    label: 'Builder',
    description: 'Builder identity linkage — planned civilization tier.',
    surface: 'future',
    status: 'COMING SOON',
  },
  {
    id: 'validator',
    label: 'Validator',
    description: 'Participation proof and achievement identity — planned.',
    surface: 'future',
    status: 'COMING SOON',
  },
]

export type CurrentIdentityKind = 'Genesis' | 'Builder' | 'Validator' | 'None'

export function resolveCurrentIdentity(
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
): CurrentIdentityKind {
  if (ownershipBySlug['babymarco-genesis']?.status === 'Owned') return 'Genesis'
  if (ownershipBySlug['masterm-identity']?.status === 'Owned') return 'Builder'
  if (ownershipBySlug['achievement-collectibles']?.status === 'Owned') return 'Validator'
  return 'None'
}

export function resolvePrivilegeDisplayStatus(
  surface: CapabilitySurface,
  owned: boolean,
  recordLive: boolean,
): PrivilegeDisplayStatus {
  if (!recordLive) return 'COMING SOON'
  if (surface === 'future') return 'COMING SOON'
  return owned ? 'ACTIVE' : 'LOCKED'
}

export function buildGenesisIdentityPrivileges(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
): IdentityPrivilege[] {
  const owned = ownership.status === 'Owned'
  const recordLive = record.status === 'live_or_legacy_existing'

  return GENESIS_PRIVILEGES.map((p) => ({
    ...p,
    status: resolvePrivilegeDisplayStatus(p.surface, owned, recordLive),
  }))
}

export function buildIdentityCapabilityCards(
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
): IdentityCapabilityCard[] {
  const genesisOwned = ownershipBySlug['babymarco-genesis']?.status === 'Owned'
  const builderOwned = ownershipBySlug['masterm-identity']?.status === 'Owned'
  const validatorOwned = ownershipBySlug['achievement-collectibles']?.status === 'Owned'

  return CAPABILITY_CARDS.map((card) => {
    if (card.id === 'genesis') {
      return { ...card, status: genesisOwned ? 'ACTIVE' : 'LOCKED', surface: 'live' as const }
    }
    if (card.id === 'builder') {
      return {
        ...card,
        status: builderOwned ? 'ACTIVE' : 'COMING SOON',
        surface: builderOwned ? ('live' as const) : ('future' as const),
      }
    }
    if (card.id === 'validator') {
      return {
        ...card,
        status: validatorOwned ? 'ACTIVE' : 'COMING SOON',
        surface: validatorOwned ? ('live' as const) : ('future' as const),
      }
    }
    return card
  })
}

export type IdentityLevelProgress = 'current' | 'available' | 'future'

export interface IdentityLevelRow {
  level: number
  title: string
  requirement: string
  progress: IdentityLevelProgress
}

export function buildIdentityLevels(current: CurrentIdentityKind): IdentityLevelRow[] {
  const currentLevel =
    current === 'Genesis' ? 1 : current === 'Builder' ? 2 : current === 'Validator' ? 3 : 0

  const rows: Omit<IdentityLevelRow, 'progress'>[] = [
    { level: 0, title: 'Citizen', requirement: 'Connect wallet to Melega DEX' },
    { level: 1, title: 'Genesis Owner', requirement: 'Own a BabyMARCO Genesis identity' },
    { level: 2, title: 'Builder', requirement: 'Builder identity collection (planned)' },
    { level: 3, title: 'Validator', requirement: 'Validator participation proof (planned)' },
    { level: 4, title: 'Master', requirement: 'Master identity collection (planned)' },
    { level: 5, title: 'Founder', requirement: 'Founder civilization tier (planned)' },
  ]

  return rows.map((row) => {
    if (row.level === currentLevel) return { ...row, progress: 'current' as const }
    if (row.level === currentLevel + 1 && row.level <= 3) return { ...row, progress: 'available' as const }
    if (row.level < currentLevel) return { ...row, progress: 'available' as const }
    return { ...row, progress: 'future' as const }
  })
}

export function resolveIdentityLevelLabel(levels: IdentityLevelRow[]): string {
  const current = levels.find((l) => l.progress === 'current')
  return current ? `L${current.level} ${current.title}` : 'L0 Citizen'
}
