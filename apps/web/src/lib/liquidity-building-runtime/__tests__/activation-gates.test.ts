import { describe, expect, it } from 'vitest'
import {
  authorizeExecutionIntent,
  buildActivationGates,
  buildExecutionIntent,
  buildObservation,
  decideLiquidityBuilding,
  DisabledLiquidityBuildingKmsSigner,
  type ObservedSwapEvent,
} from '../index'

describe('LB010 activation gates + authorize path', () => {
  it('activationAuthorized is false while blockers remain', () => {
    const g = buildActivationGates()
    expect(g.activationAuthorized).toBe(false)
    expect(g.gates.find((x) => x.id === 'NON_EXPORTABLE_AUTHORITY')?.status).toBe('FAIL')
    expect(g.gates.find((x) => x.id === 'STALE_ROUTER_CLOSED')?.status).toBe('PASS')
  })

  it('authorize path blocked without production KMS', async () => {
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
    const observation = buildObservation({
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
    const auth = await authorizeExecutionIntent({
      artifact: built.artifact,
      signer: new DisabledLiquidityBuildingKmsSigner(),
      intentSnapshot: built.intent,
    })
    expect(auth.ok).toBe(false)
    if (!auth.ok) expect(auth.code).toBe('AUTHORITY_NOT_READY')
  })
})
