import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { AdvisorRow } from '../collectiblesStudioData'
import { buildCollectibleHealth } from './buildCollectibleHealth'
import { buildMembershipStatus } from './buildMembershipStatus'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

function ownershipFor(
  record: StaticCollectibleRecord,
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
): WalletCollectibleOwnership {
  return (
    ownershipBySlug[record.slug] ?? {
      slug: record.slug,
      balance: 0,
      status: record.contract.indexed ? 'Not owned' : 'Unavailable',
      transferable: record.contract.indexed ? true : null,
      tokenIds: [],
    }
  )
}

const ART: Record<StaticCollectibleRecord['category'], AdvisorRow['artTheme']> = {
  mascot_ecosystem: 'genesis',
  identity: 'hooded',
  participation_proof: 'cube',
  ai_agent_identity: 'ai',
}

export function buildAiAdvisorRows(
  records: StaticCollectibleRecord[],
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
): AdvisorRow[] {
  const rows: AdvisorRow[] = []

  const live = records.find((r) => r.status === 'live_or_legacy_existing')
  if (live) {
    const ownership = ownershipFor(live, ownershipBySlug)
    const health = buildCollectibleHealth(live, ownership)
    if (ownership.status !== 'Owned') {
      rows.push({
        category: 'Genesis eligibility',
        title: live.displayName,
        score: health.score,
        artTheme: ART[live.category],
      })
    }
  }

  const identity = records.find((r) => r.category === 'identity')
  if (identity) {
    rows.push({
      category: 'Builder Identity recommended',
      title: identity.displayName,
      score: buildCollectibleHealth(identity, ownershipFor(identity, ownershipBySlug)).score,
      artTheme: ART[identity.category],
    })
  }

  const ai = records.find((r) => r.category === 'ai_agent_identity' || r.role.toLowerCase().includes('ai'))
  if (ai) {
    rows.push({
      category: 'Acquire AI Passport',
      title: ai.displayName,
      score: buildCollectibleHealth(ai, ownershipFor(ai, ownershipBySlug)).score,
      artTheme: 'ai',
    })
  }

  const participation = records.find((r) => r.category === 'participation_proof')
  if (participation) {
    rows.push({
      category: 'Infrastructure privileges',
      title: participation.displayName,
      score: buildCollectibleHealth(participation, ownershipFor(participation, ownershipBySlug)).score,
      artTheme: ART[participation.category],
    })
  }

  if (live && ownershipFor(live, ownershipBySlug).status === 'Owned') {
    const ownership = ownershipFor(live, ownershipBySlug)
    const membership = buildMembershipStatus(live, ownership)
    rows.push({
      category: 'Upgrade Validator',
      title: 'Validator Seal — planned',
      score: 70,
      artTheme: 'validator',
    })
    if (membership.upgradeEligible) {
      rows.unshift({
        category: 'Membership active',
        title: live.displayName,
        score: buildCollectibleHealth(live, ownership).score,
        artTheme: ART[live.category],
      })
    }
  }

  return rows.slice(0, 5)
}
