import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { CollectibleItem } from 'views/CommandCenter/commandCenterData'
import { buildMembershipStatus } from './buildMembershipStatus'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

const ICONS: Record<StaticCollectibleRecord['category'], string> = {
  mascot_ecosystem: '✦',
  identity: '🛡',
  participation_proof: '🏗',
  ai_agent_identity: '🤖',
}

export function formatCommandCenterCollectibles(
  records: StaticCollectibleRecord[],
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
  account?: string,
): CollectibleItem[] {
  if (!account) return []

  return records.map((r) => {
    const ownership = ownershipBySlug[r.slug]
    const membership = buildMembershipStatus(
      r,
      ownership ?? { slug: r.slug, balance: 0, status: 'Not owned', transferable: null, tokenIds: [] },
    )
    const owned = ownership?.status === 'Owned'
    return {
      id: r.slug,
      title: r.displayName,
      subtitle: owned ? `${membership.tier} · Owned` : membership.tier,
      icon: ICONS[r.category],
    }
  })
}

export function commandCenterIdentitySummary(
  records: StaticCollectibleRecord[],
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
  totalOwned: number,
) {
  const ownedGenesis = ownershipBySlug['babymarco-genesis']?.status === 'Owned'
  return {
    identities: records.length,
    owned: totalOwned,
    builderLevel: ownedGenesis ? 1 : 0,
    validatorStatus: ownedGenesis ? 'Candidate' : 'Unavailable',
    aiPassport: records.some((r) => r.category === 'ai_agent_identity') ? 'Planned' : 'Unavailable',
    memberships: records.map((r) => buildMembershipStatus(r, ownershipBySlug[r.slug] ?? {
      slug: r.slug,
      balance: 0,
      status: 'Not owned',
      transferable: null,
      tokenIds: [],
    })),
  }
}
