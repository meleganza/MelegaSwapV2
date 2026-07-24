/**
 * Pure builder for Passport Portfolio Overview.
 * Production: no certified USD total, no performance series, no M-Credits balance,
 * no controlled-projects count — honest unavailable / Not Available only.
 */
import {
  PORTFOLIO_NOT_AVAILABLE,
  PORTFOLIO_UNAVAILABLE,
  type PassportPortfolioOverviewViewModel,
  type PortfolioKpiCardModel,
  type PortfolioMetricAvailability,
} from './passportPortfolioOverviewTypes'

export type PassportPortfolioOverviewInput = {
  address?: string | null
  loading?: boolean
  /** Test-only overrides — never ship production mock portfolio totals. */
  fixture?: Partial<PassportPortfolioOverviewViewModel> | null
}

function unavailableHorizons(): PassportPortfolioOverviewViewModel['performance'] {
  return [
    { label: '24h', value: null, availability: 'unavailable' },
    { label: '7d', value: null, availability: 'unavailable' },
    { label: '30d', value: null, availability: 'unavailable' },
  ] as const
}

function kpi(
  id: PortfolioKpiCardModel['id'],
  title: string,
  availability: PortfolioMetricAvailability,
  value = PORTFOLIO_UNAVAILABLE,
  status = PORTFOLIO_NOT_AVAILABLE,
): PortfolioKpiCardModel {
  return { id, title, value, status, availability }
}

export function buildPassportPortfolioOverviewViewModel(
  input: PassportPortfolioOverviewInput = {},
): PassportPortfolioOverviewViewModel {
  if (input.fixture) {
    const base = buildLive(input)
    return { ...base, ...input.fixture, kpis: input.fixture.kpis ?? base.kpis }
  }
  return buildLive(input)
}

function buildLive(input: PassportPortfolioOverviewInput): PassportPortfolioOverviewViewModel {
  const walletConnected = Boolean(input.address)
  const loading = Boolean(input.loading)

  if (!walletConnected) {
    return {
      loading,
      walletConnected: false,
      totalValueDisplay: PORTFOLIO_UNAVAILABLE,
      totalAvailability: 'wallet_not_connected',
      totalDisclosure: 'Connect an external wallet to evaluate crypto and liquidity positions.',
      performance: unavailableHorizons(),
      chartAvailability: 'unavailable',
      chartPlaceholderLabel: 'Performance history unavailable',
      kpis: [
        kpi('crypto', 'Crypto Assets', 'wallet_not_connected'),
        kpi('mcredits', 'M-Credits', 'unavailable', PORTFOLIO_UNAVAILABLE, PORTFOLIO_NOT_AVAILABLE),
        kpi('projects', 'Projects', 'unavailable'),
      ],
    }
  }

  // Connected: no certified USD aggregator / series / M-Credits / controlled projects today.
  return {
    loading,
    walletConnected: true,
    totalValueDisplay: PORTFOLIO_UNAVAILABLE,
    totalAvailability: 'unavailable',
    totalDisclosure:
      'Total includes only factually valued crypto and liquidity. M-Credits and projects stay separate. Valuation unavailable.',
    performance: unavailableHorizons(),
    chartAvailability: 'unavailable',
    chartPlaceholderLabel: 'Performance history unavailable',
    kpis: [
      kpi('crypto', 'Crypto Assets', 'unavailable'),
      kpi('mcredits', 'M-Credits', 'unavailable', PORTFOLIO_UNAVAILABLE, 'Separate service account'),
      kpi('projects', 'Projects', 'unavailable'),
    ],
  }
}
