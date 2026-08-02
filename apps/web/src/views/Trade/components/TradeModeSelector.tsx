import React from 'react'
import type { SwapExperienceMode } from '../swapExperience'

export interface TradeModeSelectorProps {
  mode: SwapExperienceMode
  onChange: (mode: SwapExperienceMode) => void
}

/**
 * @deprecated ARCHIVE — Instant | Smart tabs removed.
 * Smart Swap is the sole public swap experience. Component kept as a no-op
 * so historical imports do not crash; do not remount in public UI.
 */
export const TradeModeSelector: React.FC<TradeModeSelectorProps> = () => {
  return null
}

export default TradeModeSelector
