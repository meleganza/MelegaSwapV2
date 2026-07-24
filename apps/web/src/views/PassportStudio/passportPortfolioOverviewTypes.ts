/**
 * PASSPORT_MODULE_002 — Portfolio Overview view-model contract.
 * Total may include only factually valued crypto + liquidity.
 * M-Credits and Projects never enter Total Portfolio Value.
 */

export type PortfolioMetricAvailability =
  | 'ready'
  | 'partial'
  | 'empty'
  | 'unavailable'
  | 'wallet_not_connected'

export type PortfolioPerformanceHorizon = {
  label: '24h' | '7d' | '30d'
  value: string | null
  availability: PortfolioMetricAvailability
}

export type PortfolioKpiCardModel = {
  id: 'crypto' | 'mcredits' | 'projects'
  title: string
  value: string
  status: string
  availability: PortfolioMetricAvailability
}

export type PassportPortfolioOverviewViewModel = {
  loading: boolean
  walletConnected: boolean
  totalValueDisplay: string
  totalAvailability: PortfolioMetricAvailability
  totalDisclosure: string | null
  performance: readonly PortfolioPerformanceHorizon[]
  chartAvailability: PortfolioMetricAvailability
  chartPlaceholderLabel: string
  kpis: readonly PortfolioKpiCardModel[]
}

export const PORTFOLIO_UNAVAILABLE = '—' as const
export const PORTFOLIO_NOT_AVAILABLE = 'Not Available' as const
