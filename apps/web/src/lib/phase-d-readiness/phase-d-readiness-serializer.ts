import { PhaseDConsolidationGate } from './phase-d-readiness-types'
import {
  PHASE_D_CONSOLIDATION_VERSION,
  resolvePhaseDConsolidationGate,
} from './phase-d-readiness-data'

export const serializePhaseDConsolidationManifest = (
  validation: PhaseDConsolidationGate['validation'],
): PhaseDConsolidationGate => resolvePhaseDConsolidationGate(validation)

export const PHASE_D_CONSOLIDATION_MANIFEST_ID =
  'manifest://melega/platform/phase-d-consolidation@0.1.0'

export { PHASE_D_CONSOLIDATION_VERSION }
