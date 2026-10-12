/**
 * Advanced Console — existing technical and commercial tools.
 * Not part of the four public destinations.
 * Create Pool stays unavailable; the public pools page does not open a creator.
 */

export type AdvancedConsoleGroup = 'Create' | 'Commercial' | 'Technical'

export interface AdvancedConsoleItem {
  id: string
  label: string
  group: AdvancedConsoleGroup
  href?: string
  unavailable?: boolean
  reason?: string
}

export const ADVANCED_CONSOLE_ITEMS: AdvancedConsoleItem[] = [
  { id: 'create-token', group: 'Create', label: 'Create Token', href: '/list?intent=create-token' },
  { id: 'create-farm', group: 'Create', label: 'Create Farm', href: '/farms?create=1' },
  {
    id: 'create-pool',
    group: 'Create',
    label: 'Create Pool',
    unavailable: true,
    reason: 'Create Pool is unavailable',
  },
  { id: 'trend-boost', group: 'Commercial', label: 'Trend Boost', href: '/list#trend-boost' },
  { id: 'list', group: 'Commercial', label: 'List a project', href: '/list' },
  { id: 'fees', group: 'Technical', label: 'Fees & Treasury', href: '/pricing-fees' },
  { id: 'docs', group: 'Technical', label: 'Docs', href: '/docs' },
  { id: 'audit', group: 'Technical', label: 'Audit', href: '/audit' },
  { id: 'radar', group: 'Technical', label: 'DEX Intelligence', href: '/radar' },
  { id: 'collectibles', group: 'Technical', label: 'Collectibles', href: '/collectibles' },
  { id: 'identity-console', group: 'Technical', label: 'Identity Console', href: '/identity' },
]

export const ADVANCED_CONSOLE_GROUPS: AdvancedConsoleGroup[] = ['Create', 'Commercial', 'Technical']
