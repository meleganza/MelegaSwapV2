/**
 * Single source of truth for Execution Details accordion open state.
 * Presentation-only — does not touch swap execution / router / fees.
 */

let executionDetailsOpen = false
const listeners = new Set<(open: boolean) => void>()

export function getExecutionDetailsOpen(): boolean {
  return executionDetailsOpen
}

export function setExecutionDetailsOpen(open: boolean): void {
  if (executionDetailsOpen === open) return
  executionDetailsOpen = open
  listeners.forEach((l) => l(executionDetailsOpen))
}

export function toggleExecutionDetailsOpen(): boolean {
  setExecutionDetailsOpen(!executionDetailsOpen)
  return executionDetailsOpen
}

export function subscribeExecutionDetailsOpen(listener: (open: boolean) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** @internal tests */
export function resetExecutionDetailsOpen(): void {
  executionDetailsOpen = false
  listeners.clear()
}
