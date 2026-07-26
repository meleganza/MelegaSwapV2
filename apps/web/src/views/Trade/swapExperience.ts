/** Instant vs Smart — presentation modes over the same SmartSwapForm engine. */
export type SwapExperienceMode = 'instant' | 'smart'

export const SWAP_EXPERIENCE_LABEL: Record<SwapExperienceMode, string> = {
  instant: 'Instant Swap mode selected',
  smart: 'Smart Swap mode selected',
}

export function parseSwapExperience(value: string | null | undefined): SwapExperienceMode {
  if (value === 'smart') return 'smart'
  // Default Instant — selectable Smart mode is opt-in via tabs / ?experience=smart
  return 'instant'
}
