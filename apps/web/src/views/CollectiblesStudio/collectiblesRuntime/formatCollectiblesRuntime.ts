import { DETECTED_BABYMARCO_IMAGE_PATTERN, DETECTED_BABYMARCO_PINATA_GATEWAY } from 'registry/collectibles/collectible-constants'
import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type {
  CollectionCard,
  CollectiblesKpiItem,
  SidebarListItem,
  UtilityBadge,
} from '../collectiblesStudioData'
import { buildCollectibleHealth } from './buildCollectibleHealth'
import { buildCollectiblePrivileges, privilegeLabels } from './buildCollectiblePrivileges'
import { buildMembershipStatus } from './buildMembershipStatus'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

const UNAVAILABLE = '—'
const BABYMARCO_FALLBACK_IMAGE = '/images/collectibles/hero-civilization-reference.png'

const ART_THEME: Record<StaticCollectibleRecord['category'], CollectionCard['artTheme']> = {
  mascot_ecosystem: 'genesis',
  identity: 'hooded',
  participation_proof: 'cube',
  ai_agent_identity: 'ai',
}

function badgesFor(record: StaticCollectibleRecord, owned: boolean): UtilityBadge[] {
  const badges: UtilityBadge[] = []
  if (record.status === 'live_or_legacy_existing') badges.push('verified')
  if (record.category === 'mascot_ecosystem') badges.push('genesis')
  if (record.category === 'identity') badges.push('builder')
  if (record.category === 'ai_agent_identity') badges.push('ai-rated')
  if (record.category === 'participation_proof') badges.push('utility')
  if (owned) badges.push('membership')
  return badges.length ? badges : ['utility']
}

function identityLine(record: StaticCollectibleRecord, membership: ReturnType<typeof buildMembershipStatus>): string {
  if (membership.tier !== 'Unavailable') return `${membership.tier} Identity`
  if (record.category === 'ai_agent_identity') return 'AI Agent Passport'
  if (record.category === 'identity') return 'Civilization Passport'
  return 'Collectible Identity'
}

export function mapRecordToCollectionCard(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
  project?: EnrichedProjectRecord,
): CollectionCard {
  const health = buildCollectibleHealth(record, ownership)
  const privileges = buildCollectiblePrivileges(record, ownership)
  const membership = buildMembershipStatus(record, ownership)
  const owned = ownership.status === 'Owned'

  const utilityChips = privilegeLabels(privileges).slice(0, 4)
  if (project?.slug) utilityChips.push('Projects')

  return {
    id: record.slug,
    title: record.displayName,
    creator: project?.displayName ?? 'Melega Registry',
    slug: record.slug,
    floorPrice: UNAVAILABLE,
    volume24h: 'Market data not indexed',
    items: record.supply.statedMaxSupply ? String(record.supply.statedMaxSupply) : UNAVAILABLE,
    aiScore: health.score,
    badges: badgesFor(record, owned),
    artTheme: ART_THEME[record.category],
    identityLine: identityLine(record, membership),
    utilityChips: utilityChips.length ? utilityChips : ['DEX'],
    agentEnabled: record.category === 'ai_agent_identity' || record.role.toLowerCase().includes('ai'),
    identityBinding: {
      transferable: ownership.transferable === true ? 'Yes' : ownership.transferable === false ? 'No' : '—',
      soulbound: ownership.transferable === false ? 'Yes' : '—',
      delegable: record.category === 'ai_agent_identity' ? 'Yes' : '—',
      walletBound: owned ? 'Yes' : 'No',
      expiration: membership.expiration,
    },
    utilities: privilegeLabels(privileges),
    previewImageUrl:
      record.slug === 'babymarco-genesis'
        ? `${DETECTED_BABYMARCO_PINATA_GATEWAY}/DOG1.png`
        : record.metadata.gateway
          ? `${record.metadata.gateway.replace(/\/$/, '')}/${DETECTED_BABYMARCO_IMAGE_PATTERN.replace('{tokenId}', '1')}`
          : undefined,
    fallbackImageUrl:
      record.slug === 'babymarco-genesis'
        ? BABYMARCO_FALLBACK_IMAGE
        : '/images/melega.png',
  }
}

export function aggregateCollectiblesKpis(
  records: StaticCollectibleRecord[],
  totalOwned: number,
  account?: string,
): CollectiblesKpiItem[] {
  const live = records.filter((r) => r.status === 'live_or_legacy_existing').length
  const verified = live
  const aiRated = records.filter((r) => r.category === 'ai_agent_identity' || r.role.toLowerCase().includes('ai')).length

  return [
    {
      id: 'total',
      label: 'Total Collectibles',
      value: String(records.length),
      delta: account ? `${totalOwned} owned` : undefined,
      deltaPositive: totalOwned > 0,
      icon: 'cube',
    },
    {
      id: 'owners',
      label: 'Wallet Owned',
      value: account ? String(totalOwned) : UNAVAILABLE,
      icon: 'users',
    },
    {
      id: 'volume',
      label: '24h Volume',
      value: UNAVAILABLE,
      icon: 'volume',
    },
    {
      id: 'verified',
      label: 'Verified Collections',
      value: String(verified),
      icon: 'shield',
    },
    {
      id: 'ai',
      label: 'AI Rated Collections',
      value: String(aiRated || records.length),
      icon: 'brain',
    },
  ]
}

export interface FeaturedCollectionRuntime {
  title: string
  description: string
  floorPrice: string
  owners: string
  items: string
  volume: string
  utilityScore: number
  identityBadges: string[]
  agentEnabled: boolean
  privileges: string[]
  slug: string
}

export function buildFeaturedCollection(
  cards: CollectionCard[],
  records: StaticCollectibleRecord[],
  ownershipBySlug: Record<string, WalletCollectibleOwnership>,
): FeaturedCollectionRuntime {
  const ownedCard = cards.find((c) => ownershipBySlug[c.slug]?.status === 'Owned')
  const featuredCard = ownedCard ?? cards.find((c) => c.badges.includes('verified')) ?? cards[0]
  const record = records.find((r) => r.slug === featuredCard?.slug) ?? records[0]

  if (!record || !featuredCard) {
    return {
      title: 'No Collection Indexed',
      description: 'Collectibles registry has no indexed collections.',
      floorPrice: UNAVAILABLE,
      owners: UNAVAILABLE,
      items: UNAVAILABLE,
      volume: UNAVAILABLE,
      utilityScore: 0,
      identityBadges: [],
      agentEnabled: false,
      privileges: [],
      slug: '',
    }
  }

  const ownership = ownershipBySlug[record.slug] ?? {
    slug: record.slug,
    balance: 0,
    status: record.contract.indexed ? 'Not owned' : 'Unavailable',
    transferable: record.contract.indexed ? true : null,
    tokenIds: [],
  }
  const privileges = buildCollectiblePrivileges(record, ownership)
  const membership = buildMembershipStatus(record, ownership)
  const health = buildCollectibleHealth(record, ownership)

  return {
    title: record.displayName.toUpperCase(),
    description: record.description,
    floorPrice: UNAVAILABLE,
    owners: ownership?.status === 'Owned' ? 'Wallet verified' : UNAVAILABLE,
    items: record.supply.statedMaxSupply ? String(record.supply.statedMaxSupply) : UNAVAILABLE,
    volume: UNAVAILABLE,
    utilityScore: health.score,
    identityBadges: [membership.tier !== 'Unavailable' ? `${membership.tier} Identity` : featuredCard.identityLine],
    agentEnabled: featuredCard.agentEnabled ?? false,
    privileges: privilegeLabels(privileges),
    slug: record.slug,
  }
}

export function buildSidebarLists(cards: CollectionCard[]): {
  mostAdopted: SidebarListItem[]
  highestGovernance: SidebarListItem[]
  mostUsedByAi: SidebarListItem[]
  newestIdentities: SidebarListItem[]
  mostActiveBuilders: SidebarListItem[]
} {
  const byScore = [...cards].sort((a, b) => b.aiScore - a.aiScore)
  const mapItem = (c: CollectionCard, rank?: number): SidebarListItem => ({
    rank,
    title: c.title,
    price: c.floorPrice !== UNAVAILABLE ? c.floorPrice : String(c.aiScore),
    artTheme: c.artTheme,
  })

  return {
    mostAdopted: byScore.slice(0, 5).map((c, i) => ({ ...mapItem(c, i + 1), change: undefined })),
    highestGovernance: byScore.slice(0, 5).map((c) => mapItem(c)),
    mostUsedByAi: cards.filter((c) => c.agentEnabled).slice(0, 5).map((c) => mapItem(c)),
    newestIdentities: cards.slice(0, 5).map((c) => mapItem(c)),
    mostActiveBuilders: cards.filter((c) => c.badges.includes('builder')).slice(0, 5).map((c) => mapItem(c)),
  }
}

export function filterCardsByChip(cards: CollectionCard[], chip: string): CollectionCard[] {
  if (chip === 'All') return cards
  const lower = chip.toLowerCase()
  return cards.filter(
    (c) =>
      c.identityLine.toLowerCase().includes(lower) ||
      c.badges.some((b) => b.includes(lower as UtilityBadge)) ||
      c.utilityChips.some((u) => u.toLowerCase().includes(lower)) ||
      c.title.toLowerCase().includes(lower),
  )
}
