/**
 * DS001.4 — Liquidity Building product step query model.
 * Canonical: /liquidity-studio?view=building&step=setup
 */

export const LB_PRODUCT_STEPS = ['intro', 'setup', 'review', 'status', 'dashboard', 'manage'] as const

export type LbProductStep = (typeof LB_PRODUCT_STEPS)[number]

/** Maps URL step ↔ internal UX phase used by the card hook. */
export type LbUxPhase = 'entry' | 'setup' | 'review' | 'status' | 'active' | 'manage'

export function isLbProductStep(value: unknown): value is LbProductStep {
  return typeof value === 'string' && (LB_PRODUCT_STEPS as readonly string[]).includes(value)
}

export function stepFromQuery(value: unknown): LbProductStep | null {
  if (Array.isArray(value)) return stepFromQuery(value[0])
  return isLbProductStep(value) ? value : null
}

export function phaseToStep(phase: LbUxPhase): LbProductStep {
  switch (phase) {
    case 'entry':
      return 'intro'
    case 'setup':
      return 'setup'
    case 'review':
      return 'review'
    case 'status':
      return 'status'
    case 'active':
      return 'dashboard'
    case 'manage':
      return 'manage'
    default:
      return 'intro'
  }
}

export function stepToPhase(step: LbProductStep): LbUxPhase {
  switch (step) {
    case 'intro':
      return 'entry'
    case 'setup':
      return 'setup'
    case 'review':
      return 'review'
    case 'status':
      return 'status'
    case 'dashboard':
      return 'active'
    case 'manage':
      return 'manage'
    default:
      return 'entry'
  }
}

/** Informational stepper index: Configure / Review / Activate / Build (0–3). */
export function stepperIndexForPhase(phase: LbUxPhase): number {
  switch (phase) {
    case 'entry':
    case 'setup':
      return 0
    case 'review':
      return 1
    case 'status':
      return 2
    case 'active':
    case 'manage':
      return 3
    default:
      return 0
  }
}

export function showProductStepper(phase: LbUxPhase): boolean {
  return phase === 'entry' || phase === 'setup' || phase === 'review' || phase === 'status'
}

export const LB_BUILDING_HREF = '/liquidity-studio?view=building'

export function buildingHref(step?: LbProductStep): string {
  if (!step || step === 'intro') return LB_BUILDING_HREF
  return `${LB_BUILDING_HREF}&step=${step}`
}
