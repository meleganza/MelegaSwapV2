import type { EvidenceVerificationLevel } from './schema'
import type { ProjectEvidenceRecord } from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

export function minVerificationLevel(levels: EvidenceVerificationLevel[]): EvidenceVerificationLevel {
  if (!levels.length) return 'NONE'
  return levels.reduce((min, level) => (LEVEL_RANK[level] < LEVEL_RANK[min] ? level : min), levels[0])
}

export type DeriveEvidenceError =
  | 'EMPTY_INPUTS'
  | 'MISSING_INPUT'
  | 'CIRCULAR_DERIVATION'
  | 'REJECTED_INPUT'
  | 'NOT_DERIVED_SOURCE'

/**
 * Validate derived evidence invariants.
 * derivedFromEvidenceIds must be non-empty; circular graphs rejected; missing inputs fail.
 */
export function validateDerivedEvidence(
  record: Pick<
    ProjectEvidenceRecord,
    'evidenceId' | 'sourceType' | 'derivedFromEvidenceIds' | 'verificationLevel' | 'status'
  >,
  catalog: Map<string, ProjectEvidenceRecord>,
): { ok: true; verificationLevel: EvidenceVerificationLevel } | { ok: false; error: DeriveEvidenceError } {
  if (record.sourceType !== 'DERIVED') {
    return { ok: false, error: 'NOT_DERIVED_SOURCE' }
  }
  if (!record.derivedFromEvidenceIds.length) {
    return { ok: false, error: 'EMPTY_INPUTS' }
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()

  const walk = (id: string): DeriveEvidenceError | null => {
    if (visiting.has(id)) return 'CIRCULAR_DERIVATION'
    if (visited.has(id)) return null
    const node = catalog.get(id)
    if (!node) return 'MISSING_INPUT'
    if (node.status === 'REJECTED') return 'REJECTED_INPUT'
    visiting.add(id)
    for (const parent of node.derivedFromEvidenceIds) {
      const err = walk(parent)
      if (err) return err
    }
    visiting.delete(id)
    visited.add(id)
    return null
  }

  // Include self in cycle detection against its inputs
  visiting.add(record.evidenceId)
  for (const inputId of record.derivedFromEvidenceIds) {
    if (inputId === record.evidenceId) return { ok: false, error: 'CIRCULAR_DERIVATION' }
    const err = walk(inputId)
    if (err) return { ok: false, error: err }
  }
  visiting.delete(record.evidenceId)

  const inputLevels = record.derivedFromEvidenceIds.map((id) => catalog.get(id)!.verificationLevel)
  const capped = minVerificationLevel(inputLevels)
  const proposedRank = LEVEL_RANK[record.verificationLevel]
  const allowedRank = LEVEL_RANK[capped]
  const verificationLevel = proposedRank <= allowedRank ? record.verificationLevel : capped

  return { ok: true, verificationLevel }
}
