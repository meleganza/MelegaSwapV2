import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import { assertReportDoesNotImplySettlement } from 'lib/execution-contract'
import {
  HANDOFF_ERROR_CODES,
  consumeKerlDryRunHandoffPackage,
  validateRc1OfflineHandoffFixture,
} from 'lib/execution-handoff-consumer'
import {
  RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE,
  RC1_OFFLINE_FIXTURE_ID,
  RC1_OFFLINE_HANDOFF_TIMESTAMP,
  RC1_OFFLINE_SNAPSHOT_REF,
  RC1_OFFLINE_SWARM_VERDICT,
  buildInvalidRc1FixtureLiveMode,
  buildInvalidRc1FixtureMissingEnvelope,
  buildInvalidRc1FixtureWithTxHash,
  buildInvalidRc1FixtureWithWalletData,
} from 'lib/execution-handoff-consumer/__fixtures__/rc1-offline-dry-run-handoff.fixture'
import {
  setExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
} from 'lib/execution-gateway'
import { resetInternalIngressActivation } from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import * as trackExecutionModule from 'lib/execution-tracker/trackExecution'

const UI_COMMIT_BUTTONS = [
  path.resolve(__dirname, '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Swap/components/SwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Bridge/BridgeForm/components/SmartSwapCommitButton.tsx'),
]

describe('KERL offline RC1 e2e dry-run fixture — shape', () => {
  it('fixture shape matches DEX consumer RC1 expectations', () => {
    const result = validateRc1OfflineHandoffFixture(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE)
    expect(result.ok).toBe(true)
  })

  it('contains required RC1 envelope fields with offline-only data', () => {
    const fixture = RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE

    expect(fixture.packageId).toBe(RC1_OFFLINE_FIXTURE_ID)
    expect(fixture.handoffTimestamp).toBe(RC1_OFFLINE_HANDOFF_TIMESTAMP)
    expect(fixture.routingDecisionSnapshotRef).toBe(RC1_OFFLINE_SNAPSHOT_REF)
    expect(fixture.kerlReference?.swarmVerdict).toBe(RC1_OFFLINE_SWARM_VERDICT)
    expect(fixture.routingMetadataSummary.instructionType).toBe('BridgeBurn')
    expect(fixture.instructionIdentity.id).toBe(fixture.proposedInstruction.id)
    expect(fixture.evidenceSummary.networkSourced).toBe(false)
    expect(fixture.proposalEligibility.executionPermitted).toBe(false)
    expect(fixture.dryRunManifest.transactionHash).toBeNull()
    expect(fixture.dryRunManifest.receipt).toBeNull()
    expect(fixture.dryRunManifest.settlement).toBeNull()
  })

  it('rejects invalid fixture missing RC1 envelope field', () => {
    const result = validateRc1OfflineHandoffFixture(buildInvalidRc1FixtureMissingEnvelope())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.INVALID_PACKAGE)
      expect(result.error.message).toContain('routingDecisionSnapshotRef')
    }
  })

  it('rejects invalid fixture with wallet data', () => {
    const result = validateRc1OfflineHandoffFixture(buildInvalidRc1FixtureWithWalletData())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.INVALID_PACKAGE)
      expect(result.error.message).toContain('walletAddress')
    }
  })
})

describe('KERL offline RC1 e2e dry-run fixture — consumer path', () => {
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

  it('accepts valid offline RC1 fixture through dry-run gateway', () => {
    const result = consumeKerlDryRunHandoffPackage(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xoffline-fixture',
      chainId: 56,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.packageId).toBe(RC1_OFFLINE_FIXTURE_ID)
      expect(result.instructionType).toBe('BridgeBurn')
    }
  })

  it('returns dry_run_completed with execution_performed false', () => {
    const result = consumeKerlDryRunHandoffPackage(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.report.status).toBe('dry_run_completed')
      expect(result.dryRun.executionStatus).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
      expect(result.evidence.status).toBe('dry_run_completed')
      assertReportDoesNotImplySettlement(result.report)
    }
  })

  it('never dispatches adapters or performs wallet interaction', async () => {
    const dispatchModule = await import('lib/execution-ingress/dispatch')
    const dispatchSpy = vi.spyOn(dispatchModule, 'dispatchExecutionInstruction')
    const trackSpy = vi.spyOn(trackExecutionModule, 'trackExecutionSubmission')

    const result = consumeKerlDryRunHandoffPackage(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xe2e-offline',
      chainId: 56,
    })

    expect(result.ok).toBe(true)
    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(trackSpy).not.toHaveBeenCalled()

    if (result.ok) {
      expect(result.dryRun.walletInteraction).toBe('none')
      expect(result.dryRun.transactionHash).toBeNull()
      expect(result.dryRun.receipt).toBeNull()
      expect(result.dryRun.settlement).toBeNull()
      expect(result.report.txHash).toBeUndefined()
      expect(result.report.receiptReference).toBeUndefined()
    }
  })

  it('records suppressed dry-run tracker lifecycle for offline fixture', () => {
    consumeKerlDryRunHandoffPackage(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE, {
      account: '0xtracker-offline',
      chainId: 56,
    })

    const tracker = ExecutionTracker.forScope('0xtracker-offline', 56)
    const record = tracker.getByInstructionId(RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE.proposedInstruction.id)

    expect(record?.status).toBe('dry_run_completed')
    expect(record?.events.map((e) => e.type)).toContain('execution_suppressed')
    expect(record?.events.map((e) => e.type)).not.toContain('transaction_submitted')
  })

  it('rejects invalid fixture variants before or during gateway', () => {
    expect(consumeKerlDryRunHandoffPackage(buildInvalidRc1FixtureLiveMode()).ok).toBe(false)
    expect(consumeKerlDryRunHandoffPackage(buildInvalidRc1FixtureWithTxHash()).ok).toBe(false)

    const liveResult = consumeKerlDryRunHandoffPackage(buildInvalidRc1FixtureLiveMode())
    if (!liveResult.ok) {
      expect(liveResult.error.code).toBe(HANDOFF_ERROR_CODES.LIVE_MODE)
    }

    const txResult = consumeKerlDryRunHandoffPackage(buildInvalidRc1FixtureWithTxHash())
    if (!txResult.ok) {
      expect(txResult.error.code).toBe(HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED)
    }
  })
})

describe('KERL offline RC1 e2e dry-run fixture — UI isolation', () => {
  it('fixture module is not imported by UI commit buttons', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('rc1-offline-dry-run-handoff.fixture')
      expect(content).not.toContain('RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE')
    }
  })

  it('fixture module is not imported by pages routes', () => {
    const pagesDir = path.resolve(__dirname, '../../../pages')
    const entries = fs.readdirSync(pagesDir, { recursive: true }) as string[]
    for (const entry of entries) {
      if (!entry.endsWith('.tsx') && !entry.endsWith('.ts')) continue
      const content = fs.readFileSync(path.join(pagesDir, entry), 'utf8')
      expect(content).not.toContain('rc1-offline-dry-run-handoff.fixture')
    }
  })
})
