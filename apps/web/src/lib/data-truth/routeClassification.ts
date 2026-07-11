export type RouteClassification =
  | 'PUBLIC_PRODUCT'
  | 'FOUNDER_ONLY'
  | 'OPERATOR_ONLY'
  | 'INTERNAL'
  | 'DEPRECATED'

export interface ClassifiedRoute {
  path: string
  classification: RouteClassification
  label: string
  publicNav: boolean
  notes?: string
}

/** R780 — route exposure matrix for public vs internal surfaces. */
export const MELEGA_ROUTE_CLASSIFICATION: ClassifiedRoute[] = [
  { path: '/', classification: 'PUBLIC_PRODUCT', label: 'Home', publicNav: true },
  { path: '/trade', classification: 'PUBLIC_PRODUCT', label: 'Trade', publicNav: true },
  { path: '/farms', classification: 'PUBLIC_PRODUCT', label: 'Farms', publicNav: true },
  { path: '/pools', classification: 'PUBLIC_PRODUCT', label: 'Pools', publicNav: true },
  { path: '/trending', classification: 'PUBLIC_PRODUCT', label: 'Trending', publicNav: true },
  { path: '/projects', classification: 'PUBLIC_PRODUCT', label: 'Projects', publicNav: true },
  { path: '/collectibles', classification: 'PUBLIC_PRODUCT', label: 'Identity Hub', publicNav: true },
  {
    path: '/radar',
    classification: 'PUBLIC_PRODUCT',
    label: 'DEX Intelligence',
    publicNav: true,
    notes: 'Coming Soon — analytics not operational',
  },
  { path: '/build', classification: 'PUBLIC_PRODUCT', label: 'Build Studio', publicNav: true },
  { path: '/orchestrator', classification: 'OPERATOR_ONLY', label: 'Economic Orchestrator', publicNav: false },
  { path: '/runtime/labs', classification: 'INTERNAL', label: 'Labs Runtime Connector', publicNav: false },
  { path: '/runtime', classification: 'INTERNAL', label: 'Runtime manifests', publicNav: false },
  { path: '/api/indexer/run', classification: 'OPERATOR_ONLY', label: 'Indexer cron', publicNav: false },
]

export function getPublicRoutes(): ClassifiedRoute[] {
  return MELEGA_ROUTE_CLASSIFICATION.filter((r) => r.publicNav && r.classification === 'PUBLIC_PRODUCT')
}

export function isPublicNavRoute(path: string): boolean {
  const row = MELEGA_ROUTE_CLASSIFICATION.find((r) => r.path === path)
  return row?.publicNav === true
}
