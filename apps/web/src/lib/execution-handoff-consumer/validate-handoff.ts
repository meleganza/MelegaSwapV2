import type { ExecutionError } from '../execution-contract/types'
import {
  HANDOFF_ERROR_CODES,
  HANDOFF_FORBIDDEN_EXECUTION_FIELDS,
  HANDOFF_FORBIDDEN_WALLET_VALUES,
  HANDOFF_MODE_DRY_RUN,
  HANDOFF_PACKAGE_VERSION,
  HANDOFF_TRANSMITTED_INTERNAL_TEST,
} from './constants'
import type { DryRunHandoffManifest, DryRunHandoffPackage } from './types'

export type HandoffValidateResult = { ok: true } | { ok: false; error: ExecutionError }

function handoffError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectForbiddenViolations(
  value: unknown,
  path = 'package',
  violations: string[] = [],
): string[] {
  if (!isRecord(value)) {
    return violations
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`

    if ((HANDOFF_FORBIDDEN_EXECUTION_FIELDS as readonly string[]).includes(key)) {
      if (child !== null && child !== undefined && child !== false) {
        violations.push(`${childPath} implies execution artifact`)
      }
    }

    if (key === 'walletInteraction' && typeof child === 'string') {
      if (child !== 'none' && HANDOFF_FORBIDDEN_WALLET_VALUES.includes(child)) {
        violations.push(`${childPath} implies wallet interaction`)
      }
    }

    if (key === 'executionPerformed' && child === true) {
      violations.push(`${childPath} implies execution was performed`)
    }

    if (key === 'handoffMode' && child !== HANDOFF_MODE_DRY_RUN) {
      violations.push(`${childPath} is not dry_run`)
    }

    if (key === 'networkCommunication' && child !== false) {
      violations.push(`${childPath} must be false`)
    }

    if (isRecord(child) || Array.isArray(child)) {
      collectForbiddenViolations(child, childPath, violations)
    }
  }

  return violations
}

function validateManifest(manifest: DryRunHandoffManifest | undefined): ExecutionError | undefined {
  if (!manifest) {
    return handoffError(HANDOFF_ERROR_CODES.MISSING_MANIFEST, 'dryRunManifest is required')
  }

  if (manifest.executionMode !== 'DRY_RUN_ONLY') {
    return handoffError(HANDOFF_ERROR_CODES.MANIFEST_VIOLATION, 'executionMode must be DRY_RUN_ONLY')
  }

  if (manifest.executionPerformed !== false) {
    return handoffError(HANDOFF_ERROR_CODES.EXECUTION_IMPLIED, 'executionPerformed must be false')
  }

  if (manifest.walletInteraction !== 'none') {
    return handoffError(HANDOFF_ERROR_CODES.WALLET_IMPLIED, 'walletInteraction must be none')
  }

  if (manifest.networkCommunication !== false) {
    return handoffError(HANDOFF_ERROR_CODES.MANIFEST_VIOLATION, 'networkCommunication must be false')
  }

  if (manifest.transmitted !== false && manifest.transmitted !== HANDOFF_TRANSMITTED_INTERNAL_TEST) {
    return handoffError(
      HANDOFF_ERROR_CODES.MANIFEST_VIOLATION,
      'transmitted must be false or internal-test',
    )
  }

  if (manifest.transactionHash !== null) {
    return handoffError(HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED, 'transactionHash must be null')
  }

  if (manifest.receipt !== null) {
    return handoffError(HANDOFF_ERROR_CODES.RECEIPT_IMPLIED, 'receipt must be null')
  }

  if (manifest.settlement !== null) {
    return handoffError(HANDOFF_ERROR_CODES.SETTLEMENT_IMPLIED, 'settlement must be null')
  }

  if (manifest.treasurySubmission !== undefined && manifest.treasurySubmission !== null) {
    return handoffError(HANDOFF_ERROR_CODES.TREASURY_IMPLIED, 'treasurySubmission must be null when present')
  }

  return undefined
}

/**
 * Validates a KERL Dry-Run Handoff Package without invoking gateway or adapters.
 */
export function validateDryRunHandoffPackage(pkg: unknown): HandoffValidateResult {
  if (!isRecord(pkg)) {
    return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'package must be an object') }
  }

  const handoffPackage = pkg as Partial<DryRunHandoffPackage>

  if (!handoffPackage.packageId || typeof handoffPackage.packageId !== 'string') {
    return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'packageId is required') }
  }

  if (handoffPackage.packageVersion !== HANDOFF_PACKAGE_VERSION) {
    return {
      ok: false,
      error: handoffError(
        HANDOFF_ERROR_CODES.UNSUPPORTED_VERSION,
        `unsupported packageVersion: ${String(handoffPackage.packageVersion)}`,
      ),
    }
  }

  if (handoffPackage.handoffMode === 'live' || handoffPackage.handoffMode === 'LIVE') {
    return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.LIVE_MODE, 'live handoff mode is rejected') }
  }

  if (handoffPackage.handoffMode !== HANDOFF_MODE_DRY_RUN) {
    return {
      ok: false,
      error: handoffError(
        HANDOFF_ERROR_CODES.LIVE_MODE,
        `handoffMode must be ${HANDOFF_MODE_DRY_RUN}, received: ${String(handoffPackage.handoffMode)}`,
      ),
    }
  }

  const manifestError = validateManifest(handoffPackage.dryRunManifest as DryRunHandoffManifest | undefined)
  if (manifestError) {
    return { ok: false, error: manifestError }
  }

  if (!handoffPackage.proposedInstruction || !isRecord(handoffPackage.proposedInstruction)) {
    return {
      ok: false,
      error: handoffError(HANDOFF_ERROR_CODES.MISSING_INSTRUCTION, 'proposedInstruction is required'),
    }
  }

  const violations = collectForbiddenViolations(pkg)
  if (violations.length > 0) {
    const first = violations[0]
    if (first.includes('wallet')) {
      return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.WALLET_IMPLIED, first) }
    }
    if (first.includes('transactionHash') || first.includes('txHash')) {
      return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED, first) }
    }
    if (first.includes('receipt')) {
      return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.RECEIPT_IMPLIED, first) }
    }
    if (first.includes('settlement') || first.includes('treasury')) {
      return {
        ok: false,
        error: handoffError(
          first.includes('treasury') ? HANDOFF_ERROR_CODES.TREASURY_IMPLIED : HANDOFF_ERROR_CODES.SETTLEMENT_IMPLIED,
          first,
        ),
      }
    }
    return { ok: false, error: handoffError(HANDOFF_ERROR_CODES.EXECUTION_IMPLIED, first) }
  }

  return { ok: true }
}
