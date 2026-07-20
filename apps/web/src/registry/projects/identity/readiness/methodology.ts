import {
  CIVILIZATION_READINESS_CALCULATION_REVISION,
  CIVILIZATION_READINESS_MAX,
  CIVILIZATION_READINESS_POINT_CAPS,
  CIVILIZATION_READINESS_WEIGHTS,
} from '../../discovery'
import {
  READINESS_COMPONENT_IDS,
  READINESS_COMPONENT_LABELS,
  READINESS_COMPONENT_TO_WEIGHT_KEY,
  READINESS_LIMITATIONS,
  READINESS_SNAPSHOT_REVISION,
  READINESS_STATE_THRESHOLDS,
} from './schema'
import type { ReadinessMethodology } from './types'

/** Generated from the same central config as the calculator — do not hand-edit prose lists. */
export function buildReadinessMethodology(): ReadinessMethodology {
  return {
    scoreMaximum: CIVILIZATION_READINESS_MAX,
    calculationRevision: CIVILIZATION_READINESS_CALCULATION_REVISION,
    snapshotRevision: READINESS_SNAPSHOT_REVISION,
    components: READINESS_COMPONENT_IDS.map((componentId) => {
      const weightKey = READINESS_COMPONENT_TO_WEIGHT_KEY[componentId]
      return {
        componentId,
        label: READINESS_COMPONENT_LABELS[componentId],
        maxPoints: CIVILIZATION_READINESS_POINT_CAPS[weightKey],
        weightFraction: CIVILIZATION_READINESS_WEIGHTS[weightKey],
      }
    }),
    checkEvaluation:
      'Each component lists deterministic checks over registry fields. SATISFIED requires real field presence or live capability status. Partial capability status yields PARTIALLY_SATISFIED at half credit. Visual UI presence alone never satisfies a check.',
    missingDataTreatment:
      'Missing optional fields yield UNSATISFIED with zero contribution. Missing data is never converted into zero-value facts on the project document.',
    notApplicableTreatment:
      'Capability status none and contextual trust dimensions without declared assets/deployments are NOT_APPLICABLE and do not invent penalties (e.g. tokenless projects are not penalized for missing token-contract evidence).',
    staleEvidenceTreatment:
      'Stale evidence affects Trust Snapshot dimensions and warnings when freshness is material. Organ 01 Civilization Readiness registry-field scoring does not use wall-clock drift.',
    conflictTreatment:
      'Conflicted evidence never receives independent-verification credit in the Trust Snapshot. Active conflicts surface as CONFLICTED dimensions and ATTENTION warnings.',
    privateEvidenceTreatment:
      'Private evidence is excluded from public readiness and trust APIs and cannot elevate public scores.',
    sourceDistinctions:
      'PROJECT_ATTESTED evidence cannot receive INDEPENDENTLY_VERIFIED or MELEGA_VERIFIED credit. Derived readiness evidence cites discovery.computeCivilizationReadiness.',
    limitations: READINESS_LIMITATIONS,
    thresholds: READINESS_STATE_THRESHOLDS.map((t) => ({
      state: t.state,
      minInclusive: t.minInclusive,
      maxInclusive: t.maxInclusive,
    })),
  }
}
