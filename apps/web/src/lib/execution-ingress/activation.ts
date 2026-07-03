/**
 * Internal instruction ingress — inactive by default.
 * Enable only for internal/testing harnesses; never in production UI paths.
 */
let internalIngressEnabled = false

export function isInternalIngressEnabled(): boolean {
  return internalIngressEnabled
}

/** @internal Test and harness use only. */
export function setInternalIngressEnabled(enabled: boolean): void {
  internalIngressEnabled = enabled
}

/** @internal Test harness reset. */
export function resetInternalIngressActivation(): void {
  internalIngressEnabled = false
}
