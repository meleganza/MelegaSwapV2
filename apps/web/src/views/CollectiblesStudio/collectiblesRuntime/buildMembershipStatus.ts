import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export type MembershipTier =
  | 'Genesis'
  | 'Founder'
  | 'Builder'
  | 'Validator'
  | 'AI Passport'
  | 'Community'
  | 'Institutional'
  | 'Unavailable'

export interface MembershipStatus {
  tier: MembershipTier
  acquired: string
  expiration: string
  upgradeEligible: boolean
}

export function resolveMembershipTier(record: StaticCollectibleRecord): MembershipTier {
  if (record.slug === 'babymarco-genesis') return 'Genesis'
  if (record.slug === 'masterm-identity') return 'Builder'
  if (record.slug === 'achievement-collectibles') return 'Validator'
  if (record.category === 'identity') return 'Builder'
  if (record.category === 'ai_agent_identity') return 'AI Passport'
  if (record.category === 'participation_proof') return 'Validator'
  if (record.status === 'live_or_legacy_existing') return 'Genesis'
  return 'Unavailable'
}

export function buildMembershipStatus(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
): MembershipStatus {
  const tier = resolveMembershipTier(record)
  const owned = ownership.status === 'Owned'

  return {
    tier,
    acquired: owned ? 'Wallet verified' : '—',
    expiration: record.status === 'planned' ? 'Pending' : owned ? '—' : 'Not acquired',
    upgradeEligible: !owned && record.contract.indexed && record.status === 'live_or_legacy_existing',
  }
}
