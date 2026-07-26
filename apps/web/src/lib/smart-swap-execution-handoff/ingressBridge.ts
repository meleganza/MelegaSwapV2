/**
 * Bridges Smart Swap certified handoff → execution ingress.
 * Does not sign or broadcast. Does not modify SmartSwapForm.
 */

import type { SmartSwapHandoffFailure } from './types'

export type SwapExperienceMode = 'instant' | 'smart'

export interface SmartSwapIngressHandoffSnapshot {
  experience: SwapExperienceMode
  certified: boolean
  handoffCompatible: boolean
  failures: SmartSwapHandoffFailure[]
  userMessage: string | null
  updatedAt: string
}

const DEFAULT_SNAPSHOT: SmartSwapIngressHandoffSnapshot = {
  experience: 'instant',
  certified: false,
  handoffCompatible: false,
  failures: [],
  userMessage: null,
  updatedAt: new Date(0).toISOString(),
}

let snapshot: SmartSwapIngressHandoffSnapshot = { ...DEFAULT_SNAPSHOT }

export function publishSwapExperienceMode(experience: SwapExperienceMode): void {
  snapshot = {
    ...snapshot,
    experience,
    updatedAt: new Date().toISOString(),
  }
}

export function publishSmartSwapHandoffCertification(input: {
  certified: boolean
  failures?: SmartSwapHandoffFailure[]
  userMessage?: string | null
  experience?: SwapExperienceMode
}): void {
  snapshot = {
    experience: input.experience ?? snapshot.experience,
    certified: input.certified,
    handoffCompatible: input.certified,
    failures: input.failures ?? [],
    userMessage: input.userMessage ?? null,
    updatedAt: new Date().toISOString(),
  }
}

export function readSmartSwapIngressHandoff(): Readonly<SmartSwapIngressHandoffSnapshot> {
  return snapshot
}

/**
 * Instant mode: wallet confirmation itself is the certification signal.
 * Smart mode: requires evaluated handoff certificate.
 */
export function resolveIngressCertifiedHandoff(options?: {
  /** When user has explicitly confirmed in the swap modal / commit path. */
  userConfirmedExecution?: boolean
}): { certifiedHandoff: boolean; handoffCompatible: boolean; experience: SwapExperienceMode } {
  const current = snapshot
  if (current.experience === 'instant') {
    const ok = options?.userConfirmedExecution !== false
    return {
      certifiedHandoff: ok,
      handoffCompatible: ok,
      experience: 'instant',
    }
  }
  return {
    certifiedHandoff: current.certified,
    handoffCompatible: current.handoffCompatible && current.certified,
    experience: 'smart',
  }
}

/** @internal tests */
export function resetSmartSwapIngressHandoffBridge(): void {
  snapshot = { ...DEFAULT_SNAPSHOT, updatedAt: new Date(0).toISOString() }
}
