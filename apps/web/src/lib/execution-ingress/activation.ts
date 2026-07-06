/**
 * Execution ingress activation — KAP-006C canonical submit path.
 * Canonical ingress is active by default; internal harness flag remains test-only override.
 */
let internalIngressEnabled = false
let canonicalIngressHarnessOverride: boolean | null = null

export function isInternalIngressEnabled(): boolean {
  return internalIngressEnabled
}

/**
 * Canonical production ingress — active unless explicitly disabled.
 * Set NEXT_PUBLIC_DEX_CANONICAL_EXECUTION=false to roll back.
 */
export function isCanonicalIngressEnabled(): boolean {
  if (canonicalIngressHarnessOverride !== null) {
    return canonicalIngressHarnessOverride
  }
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEX_CANONICAL_EXECUTION === 'false') {
    return false
  }
  return true
}

/** True when dispatchExecutionInstruction may run (canonical or internal harness). */
export function isIngressDispatchActive(): boolean {
  return isCanonicalIngressEnabled() || isInternalIngressEnabled()
}

/** @internal Test and harness use only. */
export function setInternalIngressEnabled(enabled: boolean): void {
  internalIngressEnabled = enabled
}

/** @internal Test harness — override canonical ingress without env mutation. */
export function setCanonicalIngressEnabledForHarness(enabled: boolean): void {
  canonicalIngressHarnessOverride = enabled
}

/** @internal Test harness reset. */
export function resetInternalIngressActivation(): void {
  internalIngressEnabled = false
  canonicalIngressHarnessOverride = null
}
