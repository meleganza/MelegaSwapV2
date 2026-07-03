import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import { assertReportDoesNotImplySettlement } from 'lib/execution-contract'
import {
  HANDSHAKE_ERROR_CODES,
  performCertifiedDryRunHandshake,
  validateCertifiedDryRunHandshake,
} from 'lib/execution-handoff-consumer'
import {
  CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
  buildCertifiedFixtureContractVersionMismatch,
  buildCertifiedFixtureIdentityMismatch,
  buildCertifiedFixtureIncompatibleOutcome,
  buildCertifiedFixtureIneligible,
  buildCertifiedFixtureInvalidManifest,
  buildCertifiedFixtureInvalidVerdict,
  buildCertifiedFixtureMissingCertification,
  buildCertifiedFixtureUnknownOutcome,
  buildCertifiedFixtureVersionMismatch,
} from 'lib/execution-handoff-consumer/__fixtures__/certified-dry-run-handoff.fixture'
import { RC1_OFFLINE_FIXTURE_ID } from 'lib/execution-handoff-consumer/__fixtures__/rc1-offline-dry-run-handoff.fixture'
import {
  setExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
} from 'lib/execution-gateway'
import * as kerlGatewayModule from 'lib/execution-ingress/kerl-gateway'
import { resetInternalIngressActivation } from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import * as trackExecutionModule from 'lib/execution-tracker/trackExecution'

const UI_COMMIT_BUTTONS = [
  path.resolve(__dirname, '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Swap/components/SwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Bridge/BridgeForm/components/SmartSwapCommitButton.tsx'),
]

describe('KERL certified dry-run handshake — validation', () => {
  it('accepts certified package with compatible certification', () => {
    const result = validateCertifiedDryRunHandshake(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE)
    expect(result.ok).toBe(true)
  })

  it('rejects missing certification', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureMissingCertification())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.MISSING_CERTIFICATION)
    }
  })

  it('rejects unknown certification outcome', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureUnknownOutcome())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.CERTIFICATION_UNKNOWN)
    }
  })

  it('rejects incompatible certification outcome', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureIncompatibleOutcome())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.CERTIFICATION_INCOMPATIBLE)
    }
  })

  it('rejects version mismatch', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureVersionMismatch())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.VERSION_MISMATCH)
    }
  })

  it('rejects execution contract version mismatch in certification', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureContractVersionMismatch())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.VERSION_MISMATCH)
    }
  })

  it('rejects identity mismatch', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureIdentityMismatch())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.IDENTITY_MISMATCH)
    }
  })

  it('rejects proposal ineligible', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureIneligible())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.PROPOSAL_INELIGIBLE)
    }
  })

  it('rejects invalid dry-run manifest', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureInvalidManifest())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.INVALID_MANIFEST)
    }
  })

  it('rejects invalid certification verdict', () => {
    const result = validateCertifiedDryRunHandshake(buildCertifiedFixtureInvalidVerdict())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.INVALID_CERTIFICATION_VERDICT)
    }
  })
})

describe('KERL certified dry-run handshake — pipeline integration', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    resetInternalIngressActivation()
    ExecutionTracker.resetForTests()
    vi.restoreAllMocks()
  })

  it('accepts certified package through handshake into dry-run consumer', () => {
    const result = performCertifiedDryRunHandshake(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xcertified-handshake',
      chainId: 56,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.handshake).toBe('certified')
      expect(result.packageId).toBe(RC1_OFFLINE_FIXTURE_ID)
      expect(result.report.status).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
      expect(result.dryRun.executionSuppressed).toBe(true)
      assertReportDoesNotImplySettlement(result.report)
    }
  })

  it('rejects uncertified package before consumer invocation', () => {
    const acceptSpy = vi.spyOn(kerlGatewayModule, 'acceptKerlExecutionInstruction')
    const result = performCertifiedDryRunHandshake(buildCertifiedFixtureMissingCertification())

    expect(result.ok).toBe(false)
    expect(acceptSpy).not.toHaveBeenCalled()
  })

  it('preserves dry-run suppression through certified handshake', () => {
    const result = performCertifiedDryRunHandshake(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xsuppression',
      chainId: 56,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dryRun.walletInteraction).toBe('none')
      expect(result.dryRun.transactionHash).toBeNull()
      expect(result.dryRun.receipt).toBeNull()
      expect(result.dryRun.settlement).toBeNull()
      expect(result.report.txHash).toBeUndefined()
      expect(result.report.receiptReference).toBeUndefined()
    }
  })

  it('never dispatches adapters or performs wallet submission', async () => {
    const dispatchModule = await import('lib/execution-ingress/dispatch')
    const dispatchSpy = vi.spyOn(dispatchModule, 'dispatchExecutionInstruction')
    const trackSpy = vi.spyOn(trackExecutionModule, 'trackExecutionSubmission')

    const result = performCertifiedDryRunHandshake(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xno-dispatch',
      chainId: 56,
    })

    expect(result.ok).toBe(true)
    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(trackSpy).not.toHaveBeenCalled()

    const tracker = ExecutionTracker.forScope('0xno-dispatch', 56)
    const record = tracker.getByInstructionId(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.proposedInstruction.id)
    expect(record?.events.map((e) => e.type)).toContain('execution_suppressed')
    expect(record?.events.map((e) => e.type)).not.toContain('transaction_submitted')
  })

  it('gateway remains dry-run only for certified handshake', () => {
    const result = performCertifiedDryRunHandshake(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dryRun.executionMode).toBe('DRY_RUN_ONLY')
      expect(result.dryRun.executionStatus).toBe('dry_run_completed')
    }
  })
})

describe('KERL certified dry-run handshake — surface isolation', () => {
  it('handshake module is not imported by UI commit buttons', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('performCertifiedDryRunHandshake')
      expect(content).not.toContain('certified-dry-run-handoff.fixture')
    }
  })
})
