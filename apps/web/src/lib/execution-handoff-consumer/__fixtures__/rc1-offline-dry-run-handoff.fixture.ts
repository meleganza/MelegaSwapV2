/**
 * TEST-ONLY — Offline KERL Swarm RC1 Dry-Run Handoff Package fixture.
 *
 * Static local data only. No live balances, quotes, liquidity, wallet data,
 * transaction hashes, receipts, or settlement artifacts.
 *
 * Swarm verdict reference: KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED
 */
import {
  EXECUTION_CONTRACT_VERSION,
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
} from 'lib/execution-contract'
import { HANDOFF_PACKAGE_VERSION } from '../constants'
import type { DryRunHandoffPackage, Rc1OfflineDryRunHandoffPackage } from '../types'
import { createBridgeExecutionInstruction } from '../../routing-layer/createSwapExecutionInstruction'

/** Fixed offline timestamp for deterministic fixtures. */
export const RC1_OFFLINE_HANDOFF_TIMESTAMP = '2026-07-03T08:00:00.000Z' as const

export const RC1_OFFLINE_FIXTURE_ID = 'kerl-rc1-offline-handoff-fixture-001' as const

export const RC1_OFFLINE_SNAPSHOT_REF = 'kerl-rc1-routing-snapshot-offline-fixture-001' as const

export const RC1_OFFLINE_SWARM_SESSION_REF = 'swarm-rc1-offline-session-fixture-001' as const

export const RC1_OFFLINE_SWARM_VERDICT = 'KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED' as const

function buildOfflineProposedInstruction() {
  const instruction = createBridgeExecutionInstruction({
    pid: 7,
    isNative: false,
    amount: '1000000000000000000',
    chainId: 56,
  })

  return {
    ...instruction,
    source: INSTRUCTION_SOURCE_KERL_PREVIEW,
    createdAt: RC1_OFFLINE_HANDOFF_TIMESTAMP,
  }
}

/**
 * Canonical offline RC1 dry-run handoff package for end-to-end fixture validation.
 */
export function buildRc1OfflineDryRunHandoffFixture(): Rc1OfflineDryRunHandoffPackage {
  const proposedInstruction = buildOfflineProposedInstruction()

  return {
    packageVersion: HANDOFF_PACKAGE_VERSION,
    packageId: RC1_OFFLINE_FIXTURE_ID,
    correlationId: proposedInstruction.correlationId,
    handoffMode: 'dry_run',
    createdAt: RC1_OFFLINE_HANDOFF_TIMESTAMP,
    handoffTimestamp: RC1_OFFLINE_HANDOFF_TIMESTAMP,
    dexCompatibilityVersion: HANDOFF_PACKAGE_VERSION,
    executionInstructionContractVersion: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
    routingDecisionSnapshotRef: RC1_OFFLINE_SNAPSHOT_REF,
    routingMetadataSummary: {
      domain: 'bridge',
      adapter: 'kronoswap-bridge',
      chainId: 56,
      routeLabel: 'MARCO-BNB bridge burn (offline RC1 fixture)',
      instructionType: 'BridgeBurn',
    },
    instructionIdentity: {
      id: proposedInstruction.id,
      correlationId: proposedInstruction.correlationId,
      version: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
      source: INSTRUCTION_SOURCE_KERL_PREVIEW,
    },
    correlationIdentity: {
      handoffCorrelationId: proposedInstruction.correlationId,
      swarmSessionRef: RC1_OFFLINE_SWARM_SESSION_REF,
    },
    evidenceSummary: {
      evidenceClass: 'dry_run_proposal',
      proposalStatus: 'eligible',
      networkSourced: false,
    },
    proposalEligibility: {
      eligible: true,
      dexDryRunOnly: true,
      executionPermitted: false,
      notes: 'Offline RC1 fixture — routing proposal only, no live network',
    },
    dryRunManifest: {
      executionMode: 'DRY_RUN_ONLY',
      executionPerformed: false,
      walletInteraction: 'none',
      networkCommunication: false,
      transmitted: 'internal-test',
      transactionHash: null,
      receipt: null,
      settlement: null,
      treasurySubmission: null,
    },
    proposedInstruction,
    kerlReference: {
      swarmVerdict: RC1_OFFLINE_SWARM_VERDICT,
      rcVersion: 'rc1',
    },
  }
}

/** Frozen singleton for tests requiring stable reference equality across imports. */
export const RC1_OFFLINE_DRY_RUN_HANDOFF_FIXTURE: Rc1OfflineDryRunHandoffPackage =
  buildRc1OfflineDryRunHandoffFixture()

/**
 * Invalid variant — includes live transaction hash (must be rejected).
 */
export function buildInvalidRc1FixtureWithTxHash(): DryRunHandoffPackage {
  const base = buildRc1OfflineDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-invalid-tx`,
    dryRunManifest: {
      ...base.dryRunManifest,
      transactionHash: '0xoffline-should-never-appear' as unknown as null,
    },
  }
}

/**
 * Invalid variant — live handoff mode (must be rejected).
 */
export function buildInvalidRc1FixtureLiveMode(): DryRunHandoffPackage {
  const base = buildRc1OfflineDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-invalid-live`,
    handoffMode: 'live',
  }
}

/**
 * Invalid variant — missing RC1 envelope field (must fail fixture shape validation).
 */
export function buildInvalidRc1FixtureMissingEnvelope(): Partial<DryRunHandoffPackage> {
  const base = buildRc1OfflineDryRunHandoffFixture()
  const { routingDecisionSnapshotRef: _removed, ...broken } = base
  return broken
}

/**
 * Invalid variant — live wallet data in envelope (must be rejected).
 */
export function buildInvalidRc1FixtureWithWalletData(): DryRunHandoffPackage {
  const base = buildRc1OfflineDryRunHandoffFixture()
  return {
    ...base,
    packageId: `${RC1_OFFLINE_FIXTURE_ID}-invalid-wallet`,
    routingMetadataSummary: {
      ...base.routingMetadataSummary,
      // @ts-expect-error test-only forbidden live field injection
      walletAddress: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    },
  }
}

/** Contract version constant exposed for fixture documentation parity. */
export const RC1_OFFLINE_EXECUTION_CONTRACT_VERSION = EXECUTION_CONTRACT_VERSION
