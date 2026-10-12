/**
 * Secondary Tools. Not a primary action.
 * Create Farm and Create Pool are not public self-service.
 * Paid Boost stays reachable here; it is not mounted on Home.
 */

export type AdvancedConsoleGroup = 'You' | 'Discover' | 'Account'

export interface AdvancedConsoleItem {
  id: string
  label: string
  group: AdvancedConsoleGroup
  href?: string
  unavailable?: boolean
  reason?: string
}

export const ADVANCED_CONSOLE_ITEMS: AdvancedConsoleItem[] = [
  { id: 'portfolio', group: 'You', label: 'Portfolio', href: '/portfolio' },
  { id: 'withdraw-lp', group: 'You', label: 'Remove liquidity', href: '/liquidity-studio?view=remove' },
  { id: 'withdraw-farms', group: 'You', label: 'Farm positions', href: '/farms?view=my' },
  { id: 'withdraw-pools', group: 'You', label: 'Pool positions', href: '/pools?view=positions' },
  { id: 'melega-space', group: 'Discover', label: 'Melega Space', href: '/projects' },
  { id: 'trend-boost', group: 'Discover', label: 'Trend Boost', href: '/list#trend-boost' },
  { id: 'list', group: 'Discover', label: 'List a project', href: '/list' },
  { id: 'create-token', group: 'Discover', label: 'Create Token', href: '/list?intent=create-token' },
  { id: 'fees', group: 'Account', label: 'Fees & Treasury', href: '/pricing-fees' },
  { id: 'docs', group: 'Account', label: 'Docs', href: '/docs' },
  { id: 'audit', group: 'Account', label: 'Audit', href: '/audit' },
]

export const ADVANCED_CONSOLE_GROUPS: AdvancedConsoleGroup[] = ['You', 'Discover', 'Account']
