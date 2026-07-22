import { useCallback, useEffect, useState } from 'react'
import type { ActivationGateSummary } from './programStatus'
import { BLOCKED_ACTIVATION_GATES } from './programStatus'
import type { ProductActivationStatus } from 'lib/liquidity-building-runtime/activationGateConsumer'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from './addresses'

export type ReadinessPill = 'Ready' | 'Pending'

export type ActivationReadiness = {
  contracts: ReadinessPill
  runtime: ReadinessPill
  activation: ReadinessPill
  gates: ActivationGateSummary
  healthStatus: string | null
  /** LB021 deterministic product status */
  productStatus: ProductActivationStatus
  uiMode: 'available' | 'pending' | 'blocked'
  /** Re-fetch activation-status + health (real endpoints). */
  refresh: () => Promise<void>
  refreshing: boolean
}

type ActivationStatusPayload = {
  productStatus?: ProductActivationStatus
  activationAuthorized?: boolean
  mainnetCycleAuthorized?: boolean
  deploymentInputsValid?: boolean
  contractsDeployed?: boolean
  validatorResult?: string | null
  blockers?: string[]
  uiMode?: 'available' | 'pending' | 'blocked'
  allRequiredGatesReady?: boolean
}

type HealthPayload = {
  status?: string
  blockers?: string[]
  reasons?: string[]
  ready?: boolean
  components?: {
    programDiscovery?: string
  }
}

function mergeGates(
  status: ActivationStatusPayload | null,
  health: HealthPayload | null,
): ActivationGateSummary {
  if (!status && !health) return { ...BLOCKED_ACTIVATION_GATES }

  const blockers = [
    ...(status?.blockers ?? []),
    ...(health?.blockers ?? []),
    ...(health?.reasons ?? []),
  ].map(String)

  const frontendBound =
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbAuthorizer) &&
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFeeSink)

  const contractsDeployed = status?.contractsDeployed === true || frontendBound
  const deploymentInputsValid = status?.deploymentInputsValid === true
  // Never elevate authorization beyond consumer + fail-closed defaults.
  const activationAuthorized = status?.activationAuthorized === true && deploymentInputsValid

  return {
    activationAuthorized,
    mainnetCycleAuthorized: status?.mainnetCycleAuthorized === true && activationAuthorized,
    contractsDeployed,
    deploymentInputsValid,
    runtimeReady: health?.status === 'READY' && health?.ready === true,
    blockers: blockers.length ? blockers : [...BLOCKED_ACTIVATION_GATES.blockers],
  }
}

const FAIL_CLOSED: Omit<ActivationReadiness, 'refresh' | 'refreshing'> = {
  contracts: 'Pending',
  runtime: 'Pending',
  activation: 'Pending',
  gates: { ...BLOCKED_ACTIVATION_GATES },
  healthStatus: null,
  productStatus: 'PENDING_EXTERNAL_ACTIVATION',
  uiMode: 'pending',
}

/**
 * Live readiness for Liquidity Building.
 * Consumes LB021 activation-status (gate consumer) + health — fail-closed.
 * Never exposes KMS/Treasury/BC003S labels.
 */
export function useActivationReadiness(): ActivationReadiness {
  const [state, setState] = useState<Omit<ActivationReadiness, 'refresh' | 'refreshing'>>(FAIL_CLOSED)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [statusRes, healthRes] = await Promise.all([
        fetch('/api/liquidity-building/activation-status', { cache: 'no-store' }),
        fetch('/api/liquidity-building/health', { cache: 'no-store' }),
      ])
      const statusJson = (await statusRes.json()) as ActivationStatusPayload
      const healthJson = (await healthRes.json()) as HealthPayload

      const gates = mergeGates(statusJson, healthJson)
      const productStatus = statusJson.productStatus ?? 'PENDING_EXTERNAL_ACTIVATION'
      const uiMode = statusJson.uiMode ?? 'pending'

      setState({
        contracts: gates.contractsDeployed ? 'Ready' : 'Pending',
        runtime: healthJson.status === 'READY' ? 'Ready' : 'Pending',
        activation: gates.activationAuthorized ? 'Ready' : 'Pending',
        gates,
        healthStatus: healthJson.status ?? null,
        productStatus,
        uiMode,
      })
    } catch {
      setState({
        ...FAIL_CLOSED,
        gates: { ...BLOCKED_ACTIVATION_GATES, blockers: ['RUNTIME_HEALTH_UNAVAILABLE'] },
      })
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await refresh()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  return { ...state, refresh, refreshing }
}
