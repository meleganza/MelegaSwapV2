import type { ExecutionError } from '../execution-contract/types'
import { TESTNET_CHAIN_IDS } from '../execution-modes/constants'
import {
  COMPATIBILITY_OUTCOME_COMPATIBLE,
  KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED,
} from './certification'
import { HANDOFF_PACKAGE_VERSION } from './constants'
import {
  HANDOFF_MODE_TESTNET_EXECUTION,
  TESTNET_EXECUTION_MANIFEST_MODE,
  TESTNET_HANDOFF_ERROR_CODES,
} from './testnet-constants'

export interface TestnetExecutionHandoffPackage {
  packageVersion: string
  packageId: string
  correlationId: string
  handoffMode: typeof HANDOFF_MODE_TESTNET_EXECUTION
  createdAt: string
  handoffTimestamp: string
  dexCompatibilityVersion: string
  executionInstructionContractVersion: string
  routingDecisionSnapshotRef: string
  routingMetadataSummary: {
    domain: 'swap' | 'bridge'
    adapter: string
    chainId: number
    routeLabel: string
    instructionType: string
  }
  instructionIdentity: {
    id: string
    correlationId: string
    version: string
    source: string
  }
  correlationIdentity: {
    handoffCorrelationId: string
    swarmSessionRef: string
  }
  evidenceSummary: {
    evidenceClass: 'testnet_execution_proposal'
    proposalStatus: 'eligible'
    networkSourced: boolean
  }
  proposalEligibility: {
    eligible: true
    dexDryRunOnly: false
    executionPermitted: true
    testnetOnly: true
    notes: string
  }
  testnetExecutionManifest: {
    executionMode: typeof TESTNET_EXECUTION_MANIFEST_MODE
    executionPerformed: false
    walletInteraction: 'submit'
    networkCommunication: true
    transmitted: 'internal-test'
    transactionHash: null
    receipt: null
    settlement: null
    treasurySubmission: null
  }
  proposedInstruction: Record<string, unknown>
  kerlReference: {
    swarmVerdict: string
    rcVersion: string
  }
  compatibilityCertification: {
    certificationVerdict: typeof KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED
    outcome: typeof COMPATIBILITY_OUTCOME_COMPATIBLE
    executionContractVersion: string
    dexCompatibilityVersion: string
    certifiedAt: string
  }
}

export type TestnetHandoffValidateResult = { ok: true; package: TestnetExecutionHandoffPackage } | { ok: false; error: ExecutionError }

function testnetError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateTestnetExecutionHandoff(pkg: unknown): TestnetHandoffValidateResult {
  if (!isRecord(pkg)) {
    return { ok: false, error: testnetError(TESTNET_HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'package must be an object') }
  }

  if (pkg.handoffMode !== HANDOFF_MODE_TESTNET_EXECUTION) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.NOT_TESTNET_MODE, 'handoffMode must be testnet_execution'),
    }
  }

  if (pkg.packageVersion !== HANDOFF_PACKAGE_VERSION) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.INVALID_PACKAGE, `packageVersion must be ${HANDOFF_PACKAGE_VERSION}`),
    }
  }

  const eligibility = pkg.proposalEligibility
  if (!isRecord(eligibility) || eligibility.executionPermitted !== true || eligibility.testnetOnly !== true) {
    return {
      ok: false,
      error: testnetError(
        TESTNET_HANDOFF_ERROR_CODES.EXECUTION_NOT_PERMITTED,
        'proposalEligibility must permit testnet-only execution',
      ),
    }
  }

  const meta = pkg.routingMetadataSummary
  if (!isRecord(meta) || !(TESTNET_CHAIN_IDS as readonly number[]).includes(meta.chainId as number)) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.WRONG_CHAIN, 'routingMetadataSummary.chainId must be BNB Testnet (97)'),
    }
  }

  const instruction = pkg.proposedInstruction
  const identity = pkg.instructionIdentity
  if (!isRecord(instruction) || !isRecord(identity)) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.MISSING_INSTRUCTION, 'proposedInstruction and instructionIdentity required'),
    }
  }

  if (identity.id !== instruction.id || identity.correlationId !== instruction.correlationId) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.IDENTITY_MISMATCH, 'instruction identity must match proposedInstruction'),
    }
  }

  const certification = pkg.compatibilityCertification
  if (
    !isRecord(certification) ||
    certification.certificationVerdict !== KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED ||
    certification.outcome !== COMPATIBILITY_OUTCOME_COMPATIBLE
  ) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'compatibilityCertification must be certified compatible'),
    }
  }

  const manifest = pkg.testnetExecutionManifest
  if (!isRecord(manifest) || manifest.executionMode !== TESTNET_EXECUTION_MANIFEST_MODE) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'testnetExecutionManifest required'),
    }
  }

  if (manifest.executionPerformed !== false || manifest.transactionHash !== null || manifest.receipt !== null) {
    return {
      ok: false,
      error: testnetError(TESTNET_HANDOFF_ERROR_CODES.INVALID_PACKAGE, 'handoff must not contain prior execution artifacts'),
    }
  }

  return { ok: true, package: pkg as unknown as TestnetExecutionHandoffPackage }
}
