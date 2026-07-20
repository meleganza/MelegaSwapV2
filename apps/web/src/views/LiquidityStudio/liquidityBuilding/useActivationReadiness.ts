import { useEffect, useState } from 'react'
import type { ActivationGateSummary } from './programStatus'
import { BLOCKED_ACTIVATION_GATES } from './programStatus'

export type ReadinessPill = 'Ready' | 'Pending'

export type ActivationReadiness = {
  contracts: ReadinessPill
  runtime: ReadinessPill
  activation: ReadinessPill
  gates: ActivationGateSummary
  healthStatus: string | null
}

type HealthPayload = {
  status?: string
  blockers?: string[]
  reasons?: string[]
  ok?: boolean
  ready?: boolean
  components?: {
    programDiscovery?: string
    kmsSigner?: string
    relay?: string
    treasuryIngestion?: string
    quotePolicy?: string
  }
}

function gatesFromHealth(payload: HealthPayload | null): ActivationGateSummary {
  if (!payload) return { ...BLOCKED_ACTIVATION_GATES }
  const blockers = [...(payload.blockers || []), ...(payload.reasons || [])]
  const runtimeReady = payload.status === 'READY' && payload.ready === true
  const deploymentInputsValid = !blockers.some((b) => String(b).includes('DEPLOYMENT_INPUTS'))
  const contractsDeployed = payload.components?.programDiscovery === 'READY'
  return {
    activationAuthorized: false,
    mainnetCycleAuthorized: false,
    contractsDeployed,
    deploymentInputsValid,
    runtimeReady,
    blockers: blockers.length ? blockers.map(String) : [...BLOCKED_ACTIVATION_GATES.blockers],
  }
}

/**
 * Live readiness pills for the frozen blocked banner.
 * Contracts Ready only when program discovery component is READY.
 * Never exposes KMS/Treasury/BC003S labels.
 */
export function useActivationReadiness(): ActivationReadiness {
  const [state, setState] = useState<ActivationReadiness>({
    contracts: 'Pending',
    runtime: 'Pending',
    activation: 'Pending',
    gates: { ...BLOCKED_ACTIVATION_GATES },
    healthStatus: null,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/liquidity-building/health', { cache: 'no-store' })
        const json = (await res.json()) as HealthPayload
        if (cancelled) return
        const gates = gatesFromHealth(json)
        const contracts: ReadinessPill = json.components?.programDiscovery === 'READY' ? 'Ready' : 'Pending'
        const runtime: ReadinessPill = json.status === 'READY' ? 'Ready' : 'Pending'
        setState({
          contracts,
          runtime,
          activation: gates.activationAuthorized ? 'Ready' : 'Pending',
          gates,
          healthStatus: json.status ?? null,
        })
      } catch {
        if (!cancelled) {
          setState({
            contracts: 'Pending',
            runtime: 'Pending',
            activation: 'Pending',
            gates: { ...BLOCKED_ACTIVATION_GATES, blockers: ['RUNTIME_HEALTH_UNAVAILABLE'] },
            healthStatus: null,
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
