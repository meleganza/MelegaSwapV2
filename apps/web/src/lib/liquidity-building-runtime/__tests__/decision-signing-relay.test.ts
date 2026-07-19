import { describe, expect, it } from 'vitest'
import {
  assertNoPrivateKeySignerConfig,
  buildExecutionIntent,
  buildObservation,
  decideLiquidityBuilding,
  DisabledLiquidityBuildingKmsSigner,
  DisabledLiquidityBuildingRelay,
  intentMatchesDecision,
  LocalValidationTreasuryIngestor,
  relayPreservesEconomics,
  signArtifact,
  type ObservedSwapEvent,
} from '../index'

function finalizedObs() {
  const events: ObservedSwapEvent[] = [
    {
      chainId: 56,
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
      projectIsToken0: true,
      blockNumber: 100,
      blockHash: '0xb',
      transactionHash: '0xtx',
      logIndex: 0,
      amount0In: '0',
      amount1In: '1000000000000000000',
      amount0Out: '1',
      amount1Out: '0',
      txStatus: 'SUCCESS',
      isCanonicalPair: true,
    },
  ]
  const obs = buildObservation({
    program: '0xProg',
    pair: '0xPair',
    projectToken: '0xProject',
    quoteAsset: '0xQuote',
    observationStartBlock: 90,
    observationEndBlock: 100,
    events,
    status: 'FINALIZED',
    finalizedAt: new Date().toISOString(),
  })
  return obs
}

describe('LB009 signing / relay / treasury', () => {
  it('21-25. intent build + disabled KMS + no private key', async () => {
    const observation = finalizedObs()
    const decision = decideLiquidityBuilding({
      program: '0xProg',
      epochId: '7',
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
    const built = buildExecutionIntent({
      observation,
      decision,
      factory: '0xFactory',
      factoryVersion: '0x' + '11'.repeat(32),
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
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
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(intentMatchesDecision(built.intent, decision)).toBe(true)

    const signer = new DisabledLiquidityBuildingKmsSigner()
    const signed = await signArtifact(built.artifact, signer)
    expect(signed.signingStatus).toBe('DISABLED')
    expect(signer.ready).toBe(false)

    const pk = assertNoPrivateKeySignerConfig({
      LB_EXECUTION_PRIVATE_KEY: '0xabc',
    } as NodeJS.ProcessEnv)
    expect(pk.ok).toBe(false)
  })

  it('rejects unfinalized observation for intent', () => {
    const observation = { ...finalizedObs(), status: 'AWAITING_FINALITY' as const, finalizedAt: null }
    const decision = decideLiquidityBuilding({
      program: '0xProg',
      epochId: '7',
      observationReference: observation.observationRoot,
      eligibleNetBuyFlow: observation.eligibleNetBuyFlow,
      strategyMode: 'FullAi',
      selectedRateBps: 2000,
      anchorProjectReserve: '1000000000000000000000',
      anchorQuoteReserve: '1000000000000000000000',
      remainingBudget: '1000000000000000000000',
      epochAlreadyExecuted: false,
    })
    const built = buildExecutionIntent({
      observation,
      decision,
      factory: '0xFactory',
      factoryVersion: '0x' + '11'.repeat(32),
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
      epochStartTimestamp: 1,
      epochEndTimestamp: 301,
      anchorBlock: 100,
      anchorProjectReserve: '1',
      anchorQuoteReserve: '1',
      strategyMode: 0,
      configNonce: '1',
      executionNonce: '1',
      maximumProjectTokenIn: '1',
      maximumGasPrice: '1',
      treasuryAuthorizationReference: '0x' + '22'.repeat(32),
    })
    expect(built.ok).toBe(false)
  })

  it('26-30. relay disabled, preserves economics, duplicate', async () => {
    const observation = finalizedObs()
    const decision = decideLiquidityBuilding({
      program: '0xProg',
      epochId: '7',
      observationReference: observation.observationRoot,
      eligibleNetBuyFlow: observation.eligibleNetBuyFlow,
      strategyMode: 'FullAi',
      selectedRateBps: 2000,
      anchorProjectReserve: '1000000000000000000000',
      anchorQuoteReserve: '1000000000000000000000',
      remainingBudget: '1000000000000000000000',
      epochAlreadyExecuted: false,
    })
    const built = buildExecutionIntent({
      observation,
      decision,
      factory: '0xFactory',
      factoryVersion: '0x' + '11'.repeat(32),
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
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
    if (!built.ok) throw new Error('build')
    const relay = new DisabledLiquidityBuildingRelay()
    const r1 = await relay.submit({
      program: '0xProg',
      intent: built.intent,
      signature: '0x' + 'ab'.repeat(65),
      calldata: '0xdead',
      to: '0xProg',
      idempotencyKey: 'k1',
    })
    expect(r1.ok).toBe(false)
    if (!r1.ok) expect(r1.code).toBe('DISABLED')

    const mutated = { ...built.intent, grossQuoteTarget: '1' }
    expect(relayPreservesEconomics(built.artifact, mutated)).toBe(false)
    expect(relayPreservesEconomics(built.artifact, built.intent)).toBe(true)

    const r2 = await relay.submit({
      program: '0xProg',
      intent: built.intent,
      signature: '0xsig',
      calldata: '0xdead',
      to: '0xProg',
      idempotencyKey: 'k1',
    })
    expect(r2.ok).toBe(false)
    if (!r2.ok) expect(r2.code).toBe('DUPLICATE')
  })

  it('31-35. treasury local validation + duplicate idempotency', () => {
    const ingestor = new LocalValidationTreasuryIngestor()
    expect(ingestor.ready).toBe(false)
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
      settlementKey: '0xsk',
      settlementReceipt: '0xsr',
      transactionHash: '0xtx',
      logIndex: 3,
      blockNumber: 1,
      finalized: true,
      programRegistered: true,
      sinkMatchesFactory: true,
      receiverMatchesCanonical: true,
    }
    const a = ingestor.validateAndStore(event)
    expect(a.ok).toBe(true)
    if (a.ok) {
      expect(a.record.treasuryStatus).toBe('ACCOUNTED')
      expect(a.record.runtimeAcknowledgementId).not.toBe(a.record.settlementReceipt)
      expect(a.record.executionId).toBe('0xeid')
    }
    const b = ingestor.validateAndStore(event)
    expect(b.ok).toBe(true)
    if (a.ok && b.ok) {
      expect(b.record.runtimeAcknowledgementId).toBe(a.record.runtimeAcknowledgementId)
    }
    const wrong = ingestor.validateAndStore({ ...event, settlementKey: '0xother', receiverMatchesCanonical: false })
    expect(wrong.ok).toBe(false)
    if (!wrong.ok) expect(wrong.reason).toBe('WRONG_TREASURY_RECEIVER')
  })
})
