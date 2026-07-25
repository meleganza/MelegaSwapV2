/**
 * FARMS_MODULE_008 — Final Visual Polish.
 * Injects style layer only. No geometry, runtime, or business logic.
 * Modules 001–007 remain byte-identical.
 */

import React from 'react'
import { FarmsVisualPolishStyle } from './FarmsVisualPolishStyle'

export const FarmsVisualPolishModule: React.FC = () => (
  <>
    <FarmsVisualPolishStyle />
    <span
      data-testid="farms-visual-polish-module"
      data-farms-module="008"
      data-farms-module-008="mounted"
      data-farms-polish="style-layer"
      hidden
      aria-hidden="true"
    />
  </>
)

export default FarmsVisualPolishModule
