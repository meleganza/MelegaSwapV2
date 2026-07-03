/**
 * Validates certified dry-run handshake prerequisites.
 * No gateway invocation — validation only.
 */
import { EXECUTION_INSTRUCTION_SCHEMA_VERSION } from '../execution-contract/constants'
import type { ExecutionError } from '../execution-contract/types'
import {
  COMPATIBILITY_OUTCOME_COMPATIBLE,
  COMPATIBILITY_OUTCOME_INCOMPATIBLE,
  COMPATIBILITY_OUTCOME_UNKNOWN,
  HANDSHAKE_ERROR_CODES,
  KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED,
} from './certification'
import { HANDOFF_ERROR_CODES, HANDOFF_MODE_DRY_RUN, HANDOFF_PACKAGE_VERSION } from './constants'
import type { DryRunHandoffPackage, KerlRc1HandoffEnvelope } from './types'
import type { HandoffValidateResult } from './validate-handoff'
import { validateDryRunHandoffPackage } from './validate-handoff'
import { validateRc1OfflineHandoffFixture } from './validate-rc1-fixture'

function handshakeError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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

export type CertifiedHandshakeValidateResult = HandoffValidateResult

/**
 * Validates a DryRunHandoffPackage for certified handshake acceptance.
 * Rejects packages lacking certification or marked unknown/incompatible.
 */
export function validateCertifiedDryRunHandshake(pkg: unknown): CertifiedHandshakeValidateResult {
  const base = validateDryRunHandoffPackage(pkg)
  if (!base.ok) {
    const code = base.error.code
    if (
      code === HANDOFF_ERROR_CODES.MANIFEST_VIOLATION ||
      code === HANDOFF_ERROR_CODES.MISSING_MANIFEST ||
      code === HANDOFF_ERROR_CODES.EXECUTION_IMPLIED ||
      code === HANDOFF_ERROR_CODES.WALLET_IMPLIED ||
      code === HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED ||
      code === HANDOFF_ERROR_CODES.RECEIPT_IMPLIED ||
      code === HANDOFF_ERROR_CODES.SETTLEMENT_IMPLIED ||
      code === HANDOFF_ERROR_CODES.TREASURY_IMPLIED
    ) {
      return { ok: false, error: handshakeError(HANDSHAKE_ERROR_CODES.INVALID_MANIFEST, base.error.message) }
    }
    return base
  }

  const rc1 = validateRc1OfflineHandoffFixture(pkg)
  if (!rc1.ok) {
    const msg = rc1.error.message
    if (msg.includes('instructionIdentity') || msg.includes('correlationIdentity') || msg.includes('correlationId')) {
      return {
        ok: false,
        error: handshakeError(HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH, msg),
      }
    }
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.MISSING_RC1_ENVELOPE, msg),
    }
  }

  if (!isRecord(pkg)) {
    return {
      ok: false,
      error: handshakeError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'package must be an object'),
    }
  }

  const handoff = pkg as Partial<DryRunHandoffPackage>

  for (const key of RC1_REQUIRED_ENVELOPE_KEYS) {
    if (handoff[key] === undefined || handoff[key] === null) {
      return {
        ok: false,
        error: handshakeError(HANDSHAKE_ERROR_CODES.MISSING_RC1_ENVELOPE, `missing RC1 envelope field: ${key}`),
      }
    }
  }

  const certification = handoff.compatibilityCertification
  if (!certification || !isRecord(certification)) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.MISSING_CERTIFICATION, 'compatibilityCertification is required'),
    }
  }

  if (certification.certificationVerdict !== KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.INVALID_CERTIFICATION_VERDICT,
        `certificationVerdict must be ${KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED}`,
      ),
    }
  }

  if (certification.outcome === COMPATIBILITY_OUTCOME_UNKNOWN) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.CERTIFICATION_UNKNOWN, 'certification outcome is unknown'),
    }
  }

  if (certification.outcome === COMPATIBILITY_OUTCOME_INCOMPATIBLE) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.CERTIFICATION_INCOMPATIBLE, 'certification outcome is incompatible'),
    }
  }

  if (certification.outcome !== COMPATIBILITY_OUTCOME_COMPATIBLE) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.MISSING_CERTIFICATION,
        `unsupported certification outcome: ${String(certification.outcome)}`,
      ),
    }
  }

  if (handoff.packageVersion !== HANDOFF_PACKAGE_VERSION) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.VERSION_MISMATCH,
        `packageVersion must be ${HANDOFF_PACKAGE_VERSION}`,
      ),
    }
  }

  if (handoff.dexCompatibilityVersion !== HANDOFF_PACKAGE_VERSION) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.VERSION_MISMATCH,
        `dexCompatibilityVersion must be ${HANDOFF_PACKAGE_VERSION}`,
      ),
    }
  }

  if (certification.dexCompatibilityVersion !== handoff.dexCompatibilityVersion) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.VERSION_MISMATCH,
        'certification.dexCompatibilityVersion must match package dexCompatibilityVersion',
      ),
    }
  }

  if (handoff.executionInstructionContractVersion !== EXECUTION_INSTRUCTION_SCHEMA_VERSION) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.VERSION_MISMATCH,
        `executionInstructionContractVersion must be ${EXECUTION_INSTRUCTION_SCHEMA_VERSION}`,
      ),
    }
  }

  if (certification.executionContractVersion !== handoff.executionInstructionContractVersion) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.VERSION_MISMATCH,
        'certification.executionContractVersion must match package executionInstructionContractVersion',
      ),
    }
  }

  const instruction = handoff.proposedInstruction
  const identity = handoff.instructionIdentity
  if (!instruction || !identity) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH, 'instruction identity snapshot is required'),
    }
  }

  if (identity.id !== instruction.id) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH,
        'instructionIdentity.id must match proposedInstruction.id',
      ),
    }
  }

  if (identity.correlationId !== instruction.correlationId) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH,
        'instructionIdentity.correlationId must match proposedInstruction.correlationId',
      ),
    }
  }

  const correlation = handoff.correlationIdentity
  if (!correlation) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH, 'correlationIdentity is required'),
    }
  }

  if (correlation.handoffCorrelationId !== handoff.correlationId) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH,
        'correlationIdentity.handoffCorrelationId must match package correlationId',
      ),
    }
  }

  if (correlation.handoffCorrelationId !== instruction.correlationId) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH,
        'correlationIdentity.handoffCorrelationId must match proposedInstruction.correlationId',
      ),
    }
  }

  const eligibility = handoff.proposalEligibility
  if (!eligibility) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.MISSING_SUPPRESSION_FIELDS, 'proposalEligibility is required'),
    }
  }

  if (eligibility.eligible !== true) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.PROPOSAL_INELIGIBLE, 'proposalEligibility.eligible must be true'),
    }
  }

  if (eligibility.dexDryRunOnly !== true) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.MISSING_SUPPRESSION_FIELDS,
        'proposalEligibility.dexDryRunOnly must be true',
      ),
    }
  }

  if (eligibility.executionPermitted !== false) {
    return {
      ok: false,
      error: handshakeError(
        HANDSHAKE_ERROR_CODES.MISSING_SUPPRESSION_FIELDS,
        'proposalEligibility.executionPermitted must be false',
      ),
    }
  }

  const manifest = handoff.dryRunManifest
  if (!manifest) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.INVALID_MANIFEST, 'dryRunManifest is required'),
    }
  }

  if (
    manifest.executionMode !== 'DRY_RUN_ONLY' ||
    manifest.executionPerformed !== false ||
    manifest.walletInteraction !== 'none' ||
    manifest.networkCommunication !== false ||
    manifest.transactionHash !== null ||
    manifest.receipt !== null ||
    manifest.settlement !== null
  ) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.INVALID_MANIFEST, 'dryRunManifest suppression guarantees violated'),
    }
  }

  if (handoff.handoffMode !== HANDOFF_MODE_DRY_RUN) {
    return {
      ok: false,
      error: handshakeError(HANDSHAKE_ERROR_CODES.INVALID_MANIFEST, `handoffMode must be ${HANDOFF_MODE_DRY_RUN}`),
    }
  }

  return { ok: true }
}
