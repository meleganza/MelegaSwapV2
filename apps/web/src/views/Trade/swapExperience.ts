/**
 * Swap experience — single Smart Swap surface.
 * `instant` remains in the type for archived handoff compatibility only.
 */
export type SwapExperienceMode = 'instant' | 'smart'

export const SWAP_EXPERIENCE_LABEL: Record<SwapExperienceMode, string> = {
  instant: 'Swap',
  smart: 'Swap',
}

/** Canonical public experience — Instant mode removed from UX. */
export const CANONICAL_SWAP_EXPERIENCE: SwapExperienceMode = 'smart'

export function parseSwapExperience(value: string | null | undefined): SwapExperienceMode {
  // Legacy ?experience=instant maps to Smart — Instant is no longer a selectable mode.
  if (value === 'instant' || value === 'smart' || value == null || value === '') {
    return 'smart'
  }
  return 'smart'
}
