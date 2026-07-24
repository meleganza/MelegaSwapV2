/**
 * Pure builder for Passport Recent Activity.
 * Production has no durable Passport-scoped activity producer — empty / partial / unavailable.
 */
import {
  ACTIVITY_EXPLORE_HREF,
  ACTIVITY_MAX_VISIBLE,
  ACTIVITY_VIEW_ALL_HREF,
  type PassportActivityItem,
  type PassportActivitySourceStatus,
  type PassportRecentActivityViewModel,
} from './passportActivityTypes'

export const ACTIVITY_SOURCE_CATALOG: readonly PassportActivitySourceStatus[] = [
  {
    id: 'identity',
    owner: 'Passport identity profile',
    endpointOrHook: 'none — no Passport identity event feed',
    available: false,
    reason: 'PASSPORT_IDENTITY_EVENTS_UNAVAILABLE',
  },
  {
    id: 'wallet',
    owner: 'Connected-wallet relationship',
    endpointOrHook: 'useAccount presence only',
    available: false,
    reason: 'WALLET_RELATIONSHIP_HISTORY_UNAVAILABLE',
  },
  {
    id: 'mcredits',
    owner: 'Treasury Runtime',
    endpointOrHook: 'M-Credits history GET — not exposed to Passport',
    available: false,
    reason: 'MCREDITS_HISTORY_UNSUPPORTED',
  },
  {
    id: 'list',
    owner: 'List / project registry',
    endpointOrHook: 'no Passport-scoped List activity producer',
    available: false,
    reason: 'LIST_ACTIVITY_UNAVAILABLE',
  },
  {
    id: 'project_page',
    owner: 'Project Page lifecycle',
    endpointOrHook: 'no Passport-scoped Project Page activity producer',
    available: false,
    reason: 'PROJECT_PAGE_ACTIVITY_UNAVAILABLE',
  },
  {
    id: 'liquidity',
    owner: 'Liquidity Studio',
    endpointOrHook: 'protocol mint/burn — not Passport identity history',
    available: false,
    reason: 'LIQUIDITY_PASSPORT_FEED_UNAVAILABLE',
  },
  {
    id: 'liquidity_building',
    owner: 'Liquidity Building',
    endpointOrHook: 'useProgramReadModel — program status only, not event ledger',
    available: false,
    reason: 'LB_EVENT_LEDGER_UNAVAILABLE',
  },
  {
    id: 'smartdrop',
    owner: 'SmartDrop',
    endpointOrHook: 'no Passport participation feed',
    available: false,
    reason: 'SMARTDROP_ACTIVITY_UNAVAILABLE',
  },
  {
    id: 'security',
    owner: 'Passport Security (Module 007)',
    endpointOrHook: 'not implemented',
    available: false,
    reason: 'SECURITY_EVENTS_UNAVAILABLE',
  },
  {
    id: 'event_fabric',
    owner: 'Civilization Event Fabric',
    endpointOrHook: 'getFabricHistory — session memory, not durable Passport history',
    available: false,
    reason: 'FABRIC_NOT_DURABLE_PASSPORT_SOURCE',
  },
] as const

export type PassportRecentActivityInput = {
  address?: string | null
  loading?: boolean
  /** Test/cert only — never production default. */
  fixtureItems?: readonly PassportActivityItem[] | null
  fixtureSources?: readonly PassportActivitySourceStatus[] | null
  forceDisconnected?: boolean
  allSourcesFailed?: boolean
  viewAllHref?: string | null
}

export function formatRelativeActivityTime(timestampMs: number, nowMs = Date.now()): string {
  const diff = Math.max(0, nowMs - timestampMs)
  const sec = Math.floor(diff / 1000)
  if (sec < 45) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day}d ago`
  const d = new Date(timestampMs)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function shortWalletLabel(address: string): string {
  if (!address || address.length < 10) return 'Wallet'
  return `Wallet ${address.slice(0, 4)}…${address.slice(-4)}`
}

/** Deduplicate by authoritative id or provenance — never title+timestamp alone. */
export function dedupeActivityItems(items: readonly PassportActivityItem[]): PassportActivityItem[] {
  const seen = new Set<string>()
  const out: PassportActivityItem[] = []
  for (const item of items) {
    if (item.privacyClassification === 'excluded') continue
    const key = item.provenance || item.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function sortActivityNewestFirst(items: readonly PassportActivityItem[]): PassportActivityItem[] {
  return [...items].sort((a, b) => b.timestamp - a.timestamp)
}

export function buildPassportRecentActivityViewModel(
  input: PassportRecentActivityInput = {},
): PassportRecentActivityViewModel {
  const loading = Boolean(input.loading)
  const walletConnected = input.forceDisconnected ? false : Boolean(input.address)
  const sources = input.fixtureSources ? [...input.fixtureSources] : [...ACTIVITY_SOURCE_CATALOG]
  const availableCount = sources.filter((s) => s.available).length
  const viewAllHref =
    input.viewAllHref !== undefined ? input.viewAllHref : ACTIVITY_VIEW_ALL_HREF

  if (input.forceDisconnected || (!walletConnected && !input.fixtureItems)) {
    return {
      loading: false,
      walletConnected: false,
      items: [],
      visibleItems: [],
      totalCount: 0,
      hasMore: false,
      viewAllHref: null,
      showViewAll: false,
      showLatestDisclosure: false,
      state: 'disconnected',
      sources,
      partialDisclosure: null,
      exploreHref: ACTIVITY_EXPLORE_HREF,
    }
  }

  // Fixture path: connected presentation for cert/tests (localhost / vitest only).
  // When fixtureItems is provided and forceDisconnected is not set, treat as connected
  // even if wagmi address is null (guest browser during Playwright cert).
  if (input.fixtureItems) {
    const connected = !input.forceDisconnected
    if (!connected) {
      return buildPassportRecentActivityViewModel({ ...input, fixtureItems: null, forceDisconnected: true })
    }
    if (input.allSourcesFailed) {
      return {
        loading: false,
        walletConnected: true,
        items: [],
        visibleItems: [],
        totalCount: 0,
        hasMore: false,
        viewAllHref: null,
        showViewAll: false,
        showLatestDisclosure: false,
        state: 'unavailable',
        sources: sources.map((s) => ({ ...s, available: false })),
        partialDisclosure: null,
        exploreHref: ACTIVITY_EXPLORE_HREF,
      }
    }
    if (loading) {
      return {
        loading: true,
        walletConnected: true,
        items: [],
        visibleItems: [],
        totalCount: 0,
        hasMore: false,
        viewAllHref: null,
        showViewAll: false,
        showLatestDisclosure: false,
        state: 'loading',
        sources,
        partialDisclosure: null,
        exploreHref: ACTIVITY_EXPLORE_HREF,
      }
    }
    const items = sortActivityNewestFirst(dedupeActivityItems(input.fixtureItems))
    const visibleItems = items.slice(0, ACTIVITY_MAX_VISIBLE)
    const hasMore = items.length > ACTIVITY_MAX_VISIBLE
    const anyUnavailable = sources.some((s) => !s.available)
    const anyAvailable = sources.some((s) => s.available)
    const state =
      items.length === 0
        ? 'empty'
        : anyUnavailable && anyAvailable
          ? 'partial'
          : 'ready'
    const showViewAll = hasMore && Boolean(viewAllHref)
    return {
      loading: false,
      walletConnected: true,
      items,
      visibleItems,
      totalCount: items.length,
      hasMore,
      viewAllHref: showViewAll ? viewAllHref : null,
      showViewAll,
      showLatestDisclosure: hasMore && !showViewAll,
      state,
      sources,
      partialDisclosure:
        state === 'partial' ? 'Some activity sources are temporarily unavailable.' : null,
      exploreHref: ACTIVITY_EXPLORE_HREF,
    }
  }

  if (loading) {
    return {
      loading: true,
      walletConnected: true,
      items: [],
      visibleItems: [],
      totalCount: 0,
      hasMore: false,
      viewAllHref: null,
      showViewAll: false,
      showLatestDisclosure: false,
      state: 'loading',
      sources,
      partialDisclosure: null,
      exploreHref: ACTIVITY_EXPLORE_HREF,
    }
  }

  // Explicit hard failure (tests / cert) — distinct from honest empty.
  if (input.allSourcesFailed) {
    return {
      loading: false,
      walletConnected: true,
      items: [],
      visibleItems: [],
      totalCount: 0,
      hasMore: false,
      viewAllHref: null,
      showViewAll: false,
      showLatestDisclosure: false,
      state: 'unavailable',
      sources,
      partialDisclosure: null,
      exploreHref: ACTIVITY_EXPLORE_HREF,
    }
  }

  // Production default: no Passport-scoped durable activity producer → honest empty
  // (sources catalog documents unavailability; do not fake an error).
  void availableCount
  return {
    loading: false,
    walletConnected: true,
    items: [],
    visibleItems: [],
    totalCount: 0,
    hasMore: false,
    viewAllHref: null,
    showViewAll: false,
    showLatestDisclosure: false,
    state: 'empty',
    sources,
    partialDisclosure: null,
    exploreHref: ACTIVITY_EXPLORE_HREF,
  }
}
