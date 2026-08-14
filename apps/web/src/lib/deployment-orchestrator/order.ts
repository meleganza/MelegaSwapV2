import type { SubsystemId } from './types'

/** Canonical production deployment order — frozen for the orchestrator. */
export const DEPLOYMENT_ORDER: readonly SubsystemId[] = [
  'liquidity_builder',
  'create_token',
  'public_farm_factory',
] as const

export const DEPLOYMENT_ORDER_STEPS = [
  {
    sequence: 1,
    id: 'liquidity_builder' as const,
    label: 'Liquidity Builder',
    pipeline: ['Deploy', 'Verify', 'Bind', 'Runtime READY'] as const,
  },
  {
    sequence: 2,
    id: 'create_token' as const,
    label: 'Create Token Factory',
    pipeline: ['Deploy', 'Verify', 'Bind', 'Runtime READY'] as const,
    dependsOn: 'liquidity_builder' as const,
  },
  {
    sequence: 3,
    id: 'public_farm_factory' as const,
    label: 'Public Farm Factory',
    pipeline: ['Deploy', 'Verify', 'Bind', 'Runtime READY'] as const,
    dependsOn: 'create_token' as const,
  },
] as const
