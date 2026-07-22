/**
 * LB-ACT-003 — Treasury ingestion must not block activation or autonomous execution.
 */

import { describe, expect, it } from 'vitest'
import { consumeActivationGates } from '../activationGateConsumer'
import {
  LB_EXECUTION_CRITICAL_GATE_IDS,
  LIQUIDITY_BUILDING_GATE_REGISTRY,
  getGateClassification,
  gateBlocksActivation,
} from '../gateClassification'
import { healthFromDependencies } from '../state-machine'
import { assessLiquidityBuildingRuntimeHealth } from '../readiness'
import { LocalValidationTreasuryIngestor } from '../treasury-integration'
import { buildExecutionIntent } from '../intent-builder'
import { decideLiquidityBuilding } from '../decision-engine'
import { buildObservation, finalizeObservation, assessFinality } from '../eligible-flow'
import { LB_SUCCESS_FEE_BPS } from '../types'
import { AutonomousLoopStateMachine } from '../state-machine'

const ADDR = {
  lbFactory: '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c',
  lbAuthorizer: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  lbFeeSink: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  treasuryFeeReceiver: '0xcccccccccccccccccccccccccccccccccccccccc',
}

function passGates(ids: readonly string[], status = 'PASS') {
  return ids.map((id) => ({ gate: id, status, blocker: id, evidence: 'verified' }))
}

describe('LB-ACT-003 activation simplification', () => {
  it('1. activationAuthorized true when execution-critical pass and Treasury ingestion unavailable', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
        { gate: 'LB-G04C/G12', status: 'FAIL', blocker: 'LB-G04C', evidence: 'ingestion down' },
      ],
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(true)
    expect(result.executionCriticalGatesReady).toBe(true)
    expect(result.accountingReadiness).toBe(false)
  })

  it('2. Treasury ingestion unavailable → accounting degraded, warning, no execution blocker', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
        { gate: 'LB-G04C/G12', status: 'FAIL', blocker: 'LB-G04C/G12' },
      ],
      addresses: ADDR,
    })
    expect(result.accountingReadiness).toBe(false)
    expect(result.accountingDegraded).toBe(true)
    expect(result.warnings).toContain('TREASURY_ACCOUNTING_DEGRADED')
    expect(result.secondaryWarning).toMatch(/synchronization delayed/i)
    expect(result.executionBlockers).not.toContain('LB-G04C/G12')
    expect(result.accountingBlockers).toContain('LB-G04C/G12')
  })

  it('3. Treasury fee receiver missing still blocks activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: { ...ADDR, treasuryFeeReceiver: null },
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.feeReceiverValid).toBe(false)
    expect(result.executionBlockers).toContain('TREASURY_FEE_RECEIVER_MISSING')
  })

  it('4. KMS missing still blocks activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS.filter((id) => id !== 'LB-G03B' && id !== 'LB-G11')),
        { gate: 'LB-G03B', status: 'FAIL', blocker: 'LB-G03B' },
        { gate: 'LB-G11', status: 'FAIL', blocker: 'LB-G11' },
        { gate: 'LB-G04C/G12', status: 'PASS', blocker: 'LB-G04C/G12' },
      ],
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionBlockers).toEqual(expect.arrayContaining(['LB-G03B', 'LB-G11']))
  })

  it('5. relay missing still blocks activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS.filter((id) => id !== 'LB-G03C')),
        { gate: 'LB-G03C', status: 'FAIL', blocker: 'LB-G03C' },
      ],
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionBlockers).toContain('LB-G03C')
  })

  it('6. quote policy missing still blocks activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS.filter((id) => id !== 'LB-G08')),
        { gate: 'LB-G08', status: 'FAIL', blocker: 'LB-G08' },
      ],
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionBlockers).toContain('LB-G08')
  })

  it('7. contracts not deployed still block activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
      addresses: {
        lbFactory: null,
        lbAuthorizer: null,
        lbFeeSink: null,
        treasuryFeeReceiver: ADDR.treasuryFeeReceiver,
      },
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.contractsDeployed).toBe(false)
    expect(result.executionBlockers).toContain('CONTRACTS_NOT_DEPLOYED')
    expect(result.productStatus).toBe('BLOCKED')
  })

  it('8. finality gate failure still blocks activation', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS.filter((id) => id !== 'LB-G10')),
        { gate: 'LB-G10', status: 'FAIL', blocker: 'LB-G10' },
      ],
      addresses: ADDR,
    })
    expect(result.activationAuthorized).toBe(false)
    expect(result.executionBlockers).toContain('LB-G10')
  })

  it('9. autonomous loop does not treat Treasury ingestion as execution blocker state', () => {
    const m = new AutonomousLoopStateMachine()
    m.transition('OBSERVE', 's')
    m.transition('FINALIZE', 'f')
    m.transition('DECIDE', 'd')
    m.transition('SIGN', 'si')
    m.transition('SUBMIT', 'su')
    m.transition('MONITOR', 'mo')
    m.transition('RECONCILE', 're')
    // Preferred LB-ACT-003 path: COMPLETE with accounting warning — not TREASURY_UNAVAILABLE.
    m.transition('COMPLETE', 'accounting_degraded_async_pending')
    expect(m.state).toBe('COMPLETE')
    expect(m.history.some((h) => h.to === 'TREASURY_UNAVAILABLE')).toBe(false)
  })

  it('10-11. reconciliation retry is idempotent and does not duplicate accounting', async () => {
    const ingestor = new LocalValidationTreasuryIngestor()
    const event = {
      chainId: 56,
      sink: '0xSink',
      treasuryReceiver: '0xRecv',
      factory: '0xFactory',
      program: '0xProg',
      programId: '0xpid',
      executionId: '0xeid',
      quoteAsset: '0xQuote',
      feeAmount: '1000',
      grossQuoteAmount: '20000',
      netQuoteAmount: '19000',
      lpAmount: '50',
      settlementKey: '0xsk-act003',
      settlementReceipt: '0xsr',
      transactionHash: '0xtxact003',
      logIndex: 3,
      blockNumber: 42,
      finalized: true,
      programRegistered: true,
      sinkMatchesFactory: true,
      receiverMatchesCanonical: true,
    }

    const pending = await ingestor.ingest(event)
    expect(pending.ok).toBe(false)
    if (!pending.ok) {
      expect(pending.reason).toBe('TREASURY_ACCOUNTING_DEGRADED')
      expect(pending.pendingEvidence?.notes.join(' ')).toMatch(/RECONCILIATION_PENDING/)
    }
    expect(ingestor.getBySettlementKey('0xsk-act003')?.treasuryStatus).toBe('OBSERVED')

    // Retry while still not ready — no on-chain resubmit, still pending.
    const r1 = await ingestor.retryPending!()
    expect(r1.stillPending).toBe(1)
    expect(r1.accounted).toBe(0)

    ingestor.setReadyForTests(true)
    const r2 = await ingestor.retryPending!()
    expect(r2.accounted).toBe(1)
    expect(ingestor.getBySettlementKey('0xsk-act003')?.treasuryStatus).toBe('ACCOUNTED')

    const r3 = await ingestor.retryPending!()
    expect(r3.accounted).toBe(0)
    const again = await ingestor.ingest(event)
    expect(again.ok).toBe(true)
    if (again.ok) {
      expect(again.record.treasuryStatus).toBe('ACCOUNTED')
    }
  })

  it('13. success fee remains 500 bps', () => {
    expect(LB_SUCCESS_FEE_BPS).toBe(500)
  })

  it('15. treasuryAuthorizationReference is provenance only (format/nonzero), not a live ticket', () => {
    const events = [
      {
        chainId: 56,
        pair: '0xPair',
        projectToken: '0xP',
        quoteAsset: '0xQ',
        projectIsToken0: true,
        blockNumber: 100,
        blockHash: '0xb',
        transactionHash: '0xtx',
        logIndex: 0,
        amount0In: '0',
        amount1In: '1000000000000000000',
        amount0Out: '1',
        amount1Out: '0',
        txStatus: 'SUCCESS' as const,
        isCanonicalPair: true,
      },
    ]
    let observation = buildObservation({
      program: '0xProg',
      pair: '0xPair',
      projectToken: '0xP',
      quoteAsset: '0xQ',
      observationStartBlock: 90,
      observationEndBlock: 100,
      events,
    })
    observation = finalizeObservation(
      observation,
      assessFinality({ observationEndBlock: 100, chainHead: 200, pairStillCanonical: true }),
    )
    const decision = decideLiquidityBuilding({
      program: '0xProg',
      epochId: '1',
      observationReference: observation.observationRoot,
      eligibleNetBuyFlow: observation.eligibleNetBuyFlow,
      strategyMode: 'FullAi',
      selectedRateBps: 2000,
      anchorProjectReserve: '1000000000000000000000',
      anchorQuoteReserve: '1000000000000000000000',
      remainingBudget: '1000000000000000000000',
      epochAlreadyExecuted: false,
    })
    expect(decision.decision).toBe('EXECUTE')

    const zero = buildExecutionIntent({
      observation,
      decision,
      factory: '0xFactory',
      factoryVersion: '0x' + '11'.repeat(32),
      pair: '0xPair',
      projectToken: '0xP',
      quoteAsset: '0xQ',
      epochStartTimestamp: 1,
      epochEndTimestamp: 301,
      anchorBlock: 100,
      anchorProjectReserve: '1000000000000000000000',
      anchorQuoteReserve: '1000000000000000000000',
      strategyMode: 0,
      configNonce: '1',
      executionNonce: '1',
      maximumProjectTokenIn: '1000',
      maximumGasPrice: '3000000000',
      treasuryAuthorizationReference: '0x' + '00'.repeat(32),
    })
    expect(zero.ok).toBe(false)
    if (!zero.ok) expect(zero.reason).toMatch(/PROVENANCE/)

    const ok = buildExecutionIntent({
      observation,
      decision,
      factory: '0xFactory',
      factoryVersion: '0x' + '11'.repeat(32),
      pair: '0xPair',
      projectToken: '0xP',
      quoteAsset: '0xQ',
      epochStartTimestamp: 1,
      epochEndTimestamp: 301,
      anchorBlock: 100,
      anchorProjectReserve: '1000000000000000000000',
      anchorQuoteReserve: '1000000000000000000000',
      strategyMode: 0,
      configNonce: '1',
      executionNonce: '1',
      maximumProjectTokenIn: '1000',
      maximumGasPrice: '3000000000',
      treasuryAuthorizationReference: '0x' + '22'.repeat(32),
    })
    expect(ok.ok).toBe(true)
  })

  it('16. activation API fields separate executionBlockers / accountingBlockers / warnings', () => {
    const result = consumeActivationGates({
      activationAuthorized: true,
      validatorResult: 'VALID',
      deploymentReadinessState: 'DEPLOYED',
      gates: [
        ...passGates(LB_EXECUTION_CRITICAL_GATE_IDS),
        { gate: 'LB-G04C/G12', status: 'FAIL', blocker: 'LB-G04C/G12' },
      ],
      addresses: ADDR,
    })
    expect(Array.isArray(result.executionBlockers)).toBe(true)
    expect(Array.isArray(result.accountingBlockers)).toBe(true)
    expect(Array.isArray(result.warnings)).toBe(true)
    expect(Array.isArray(result.gateClassifications)).toBe(true)
    expect(result.blockers).toEqual(result.executionBlockers)
    expect(result.accountingBlockers).toEqual(expect.arrayContaining(['LB-G04C', 'LB-G12']))
    expect(LB_EXECUTION_CRITICAL_GATE_IDS).not.toContain('LB-G04C/G12')
    expect(LB_EXECUTION_CRITICAL_GATE_IDS).not.toContain('LB-G04C')
    expect(LB_EXECUTION_CRITICAL_GATE_IDS).not.toContain('LB-G12')
  })

  it('12. accounting degradation does not map to ERROR or SAFETY_PAUSED loop states', () => {
    const m = new AutonomousLoopStateMachine()
    m.transition('OBSERVE', 's')
    m.transition('FINALIZE', 'f')
    m.transition('DECIDE', 'd')
    m.transition('SIGN', 'si')
    m.transition('SUBMIT', 'su')
    m.transition('MONITOR', 'mo')
    m.transition('RECONCILE', 're')
    m.transition('COMPLETE', 'accounting_degraded_async_pending')
    expect(m.state).toBe('COMPLETE')
    expect(m.state).not.toBe('EXECUTION_FAILED')
    expect(String(m.state)).not.toMatch(/SAFETY|ERROR/)
  })

  it('gate registry classifies G04C/G12 as ACCOUNTING_ASYNC and non-blocking', () => {
    expect(getGateClassification('LB-G04C')).toBe('ACCOUNTING_ASYNC')
    expect(getGateClassification('LB-G12')).toBe('ACCOUNTING_ASYNC')
    expect(gateBlocksActivation('LB-G04C')).toBe(false)
    expect(gateBlocksActivation('LB-G12')).toBe(false)
    expect(getGateClassification('LB-G03B')).toBe('EXECUTION_CRITICAL')
    expect(getGateClassification('LB-G04B')).toBe('EXECUTION_CRITICAL')
    expect(LIQUIDITY_BUILDING_GATE_REGISTRY.every((g) => g.classification)).toBe(true)
  })

  it('healthFromDependencies: ingestion unavailable does not block when fee receiver valid', () => {
    const h = healthFromDependencies({
      kmsReady: true,
      relayReady: true,
      feeReceiverValid: true,
      treasuryIngestionReady: false,
      quotePolicyReady: true,
      contractsDeployed: true,
      observerOk: true,
    })
    expect(h.status).toBe('DEGRADED')
    expect(h.blockers).toHaveLength(0)
    expect(h.warnings).toContain('TREASURY_ACCOUNTING_DEGRADED')
    expect(h.accountingDegraded).toBe(true)
  })

  it('default production health remains BLOCKED on execution-critical gaps', () => {
    const h = assessLiquidityBuildingRuntimeHealth()
    expect(h.status).toBe('BLOCKED')
    expect(h.components.treasuryIngestion).toBe('DEGRADED')
    expect(h.blockers.join(' ')).not.toMatch(/LB-G04C/)
  })
})
