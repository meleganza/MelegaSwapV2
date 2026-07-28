/**
 * POOLS_MODULE_008 — Final Visual Polish.
 * Injects style layer only. No geometry, runtime, or business logic.
 * Modules 001–007 remain byte-identical.
 */

import React from 'react'
import { PoolsVisualPolishStyle } from './PoolsVisualPolishStyle'

export const PoolsVisualPolishModule: React.FC = () => (
  <>
    <PoolsVisualPolishStyle />
    <span
      data-testid="pools-visual-polish-module"
      data-pools-module="008"
      data-pools-module-008="mounted"
      data-pools-polish="style-layer"
      hidden
      aria-hidden="true"
    />
  </>
)

export default PoolsVisualPolishModule
