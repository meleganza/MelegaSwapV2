/**
 * PASSPORT_MODULE_006 — Recent Activity normalized contracts.
 * Read-only; never invents production events.
 */

export const ACTIVITY_MAX_VISIBLE = 4
export const ACTIVITY_EXPLORE_HREF = '/' as const
/** No dedicated Passport activity route — View All only when a factual destination exists. */
export const ACTIVITY_VIEW_ALL_HREF: string | null = null

export type PassportActivityCategory =
  | 'identity'
  | 'wallet'
  | 'mcredits'
  | 'token'
  | 'project'
  | 'liquidity'
  | 'liquidity_building'
  | 'smartdrop'
  | 'security'
  | 'ecosystem'

export type PassportActivityValueKind =
  | 'mcredits'
  | 'crypto'
  | 'fiat'
  | 'status'
  | 'none'

export type PassportActivityValueTone = 'positive' | 'warning' | 'error' | 'neutral' | 'none'

export type PassportActivityFreshness = 'fresh' | 'partial' | 'stale' | 'unavailable'

export type PassportActivityPrivacy = 'public' | 'passport_scoped' | 'excluded'

export type PassportActivityItem = {
  id: string
  category: PassportActivityCategory
  eventType: string
  title: string
  context: string
  value: string | null
  valueKind: PassportActivityValueKind
  valueTone: PassportActivityValueTone
  status: string | null
  timestamp: number
  exactTimestamp: string
  relativeTime: string
  source: string
  evidenceUrl: string | null
  destination: string | null
  freshness: PassportActivityFreshness
  provenance: string
  privacyClassification: PassportActivityPrivacy
}

export type PassportActivitySourceStatus = {
  id: string
  owner: string
  endpointOrHook: string
  available: boolean
  reason: string | null
}

export type PassportRecentActivityViewModel = {
  loading: boolean
  walletConnected: boolean
  items: PassportActivityItem[]
  visibleItems: PassportActivityItem[]
  totalCount: number
  hasMore: boolean
  viewAllHref: string | null
  showViewAll: boolean
  showLatestDisclosure: boolean
  state: 'disconnected' | 'loading' | 'empty' | 'ready' | 'partial' | 'unavailable'
  sources: PassportActivitySourceStatus[]
  partialDisclosure: string | null
  exploreHref: string
}

declare global {
  interface Window {
    __PASSPORT_MODULE_006_FIXTURE__?: {
      walletConnected?: boolean
      loading?: boolean
      allSourcesFailed?: boolean
      items?: PassportActivityItem[]
      sources?: PassportActivitySourceStatus[]
      viewAllHref?: string | null
    }
  }
}
