/**
 * Validates RC1 offline fixture envelope shape (test-only).
 * Ensures required Swarm RC1 fields are present without live network data.
 */
import type { ExecutionError } from '../execution-contract/types'
import { HANDOFF_ERROR_CODES } from './constants'
import type { DryRunHandoffPackage, KerlRc1HandoffEnvelope } from './types'
import type { HandoffValidateResult } from './validate-handoff'
import { validateDryRunHandoffPackage } from './validate-handoff'

const RC1_REQUIRED_ENVELOPE_KEYS: (keyof KerlRc1HandoffEnvelope)[] = [
  'routingDecisionSnapshotRef',
  'routingMetadataSummary',
  'executionInstructionContractVersion',
  'instructionIdentity',
  'correlationIdentity',
  'evidenceSummary',
  'proposalEligibility',
  'dexCompatibilityVersion',
  'handoffTimestamp',
]

const FIXTURE_FORBIDDEN_LIVE_KEYS = [
  'walletAddress',
  'walletBalance',
  'liveBalance',
  'liveQuote',
  'quote',
  'liquidity',
  'poolReserve',
  'transactionHash',
  'txHash',
  'receipt',
  'settlement',
  'treasurySubmission',
] as const

function fixtureError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function scanForbiddenLiveKeys(value: unknown, path = 'fixture', violations: string[] = []): string[] {
  if (!isRecord(value)) return violations

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`
    if ((FIXTURE_FORBIDDEN_LIVE_KEYS as readonly string[]).includes(key)) {
      if (child !== null && child !== undefined) {
        violations.push(`${childPath} contains live network data`)
      }
    }
    if (isRecord(child) || Array.isArray(child)) {
      scanForbiddenLiveKeys(child, childPath, violations)
    }
  }
  return violations
}

export type Rc1FixtureValidateResult = HandoffValidateResult

/**
 * Validates that a package matches the offline RC1 fixture envelope shape
 * and satisfies DEX consumer handoff rules.
 */
export function validateRc1OfflineHandoffFixture(pkg: unknown): Rc1FixtureValidateResult {
  const base = validateDryRunHandoffPackage(pkg)
  if (!base.ok) {
    return base
  }

  if (!isRecord(pkg)) {
    return { ok: false, error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'fixture must be an object') }
  }

  const handoff = pkg as Partial<DryRunHandoffPackage>

  for (const key of RC1_REQUIRED_ENVELOPE_KEYS) {
    if (handoff[key] === undefined || handoff[key] === null) {
      return {
        ok: false,
        error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, `missing RC1 envelope field: ${key}`),
      }
    }
  }

  if (handoff.evidenceSummary && isRecord(handoff.evidenceSummary)) {
    if (handoff.evidenceSummary.networkSourced !== false) {
      return {
        ok: false,
        error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'evidenceSummary.networkSourced must be false'),
      }
    }
  }

  if (handoff.proposalEligibility && isRecord(handoff.proposalEligibility)) {
    if (handoff.proposalEligibility.executionPermitted !== false) {
      return {
        ok: false,
        error: fixtureError(HANDOFF_ERROR_CODES.EXECUTION_IMPLIED, 'proposalEligibility.executionPermitted must be false'),
      }
    }
    if (handoff.proposalEligibility.dexDryRunOnly !== true) {
      return {
        ok: false,
        error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'proposalEligibility.dexDryRunOnly must be true'),
      }
    }
  }

  const instruction = handoff.proposedInstruction
  const identity = handoff.instructionIdentity
  if (instruction && identity) {
    if (identity.id !== instruction.id) {
      return {
        ok: false,
        error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'instructionIdentity.id must match proposedInstruction.id'),
      }
    }
    if (identity.correlationId !== instruction.correlationId) {
      return {
        ok: false,
        error: fixtureError(
          HANDOFF_ERROR_CODES.INVALID_PACKAGE,
          'instructionIdentity.correlationId must match proposedInstruction.correlationId',
        ),
      }
    }
  }

  const liveViolations = scanForbiddenLiveKeys(pkg)
  if (liveViolations.length > 0) {
    return {
      ok: false,
      error: fixtureError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, liveViolations[0]),
    }
  }

  return { ok: true }
}
