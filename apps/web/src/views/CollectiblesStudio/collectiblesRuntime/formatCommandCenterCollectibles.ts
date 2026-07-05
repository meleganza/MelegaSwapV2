import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import {
  BABYMARCO_GENESIS_DISPLAY_NAME,
  getBabyMarcoImageUri,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import type { CollectibleItem } from 'views/CommandCenter/commandCenterData'
import { buildCollectiblePrivileges, privilegeLabels } from './buildCollectiblePrivileges'
import { buildMembershipStatus } from './buildMembershipStatus'
import {
  buildIdentityCapabilityCards,
  buildIdentityLevels,
  resolveCurrentIdentity,
  resolveIdentityLevelLabel,
} from './identityCapabilities'
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
    const ownershipResolved =
      ownership ?? { slug: r.slug, balance: 0, status: 'Not owned', transferable: null, tokenIds: [] }
    const membership = buildMembershipStatus(r, ownershipResolved)
    const privileges = buildCollectiblePrivileges(r, ownershipResolved)
    const activePrivileges = privilegeLabels(privileges)
    const owned = ownership?.status === 'Owned'
    return {
      id: r.slug,
      title: r.slug === 'babymarco-genesis' ? BABYMARCO_GENESIS_DISPLAY_NAME : r.displayName,
      subtitle: owned ? `${membership.tier} · Owner` : membership.tier,
      icon: ICONS[r.category],
      privileges: activePrivileges,
    }
  })
}

export function commandCenterIdentitySummary(
  records: StaticCollectibleRecord[],
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
  totalOwned: number,
  account?: string,
) {
  const genesis = ownershipBySlug['babymarco-genesis']
  const ownedGenesis = genesis?.status === 'Owned'
  const currentIdentity = resolveCurrentIdentity(ownershipBySlug)
  const levels = buildIdentityLevels(currentIdentity)
  const capabilities = buildIdentityCapabilityCards(ownershipBySlug)

  return {
    identities: records.length,
    owned: totalOwned,
    connected: Boolean(account),
    currentIdentity,
    identity: ownedGenesis ? 'Genesis Identity' : account ? 'No Identity Connected' : 'No Identity Connected',
    identityLevel: resolveIdentityLevelLabel(levels),
    privileges: ownedGenesis
      ? privilegeLabels(buildCollectiblePrivileges(records.find((r) => r.slug === 'babymarco-genesis')!, genesis!))
      : [],
    capabilities: capabilities.map((c) => ({ label: c.label, status: c.status })),
    collection: ownedGenesis ? BABYMARCO_GENESIS_DISPLAY_NAME : null,
    currentLevel: resolveIdentityLevelLabel(levels),
    builderLevel: ownedGenesis || ownershipBySlug['masterm-identity']?.status === 'Owned' ? 1 : 0,
    validatorStatus:
      ownershipBySlug['achievement-collectibles']?.status === 'Owned'
        ? 'Active'
        : ownershipBySlug['achievement-collectibles']
          ? 'Runtime'
          : 'Unavailable',
    aiPassport: records.some((r) => r.category === 'ai_agent_identity') ? 'Planned' : 'Unavailable',
    artworkUrl:
      ownedGenesis && genesis?.tokenIds[0] ? getBabyMarcoImageUri(genesis.tokenIds[0]) : null,
    memberships: records.map((r) =>
      buildMembershipStatus(
        r,
        ownershipBySlug[r.slug] ?? {
          slug: r.slug,
          balance: 0,
          status: 'Not owned',
          transferable: null,
          tokenIds: [],
        },
      ),
    ),
  }
}
