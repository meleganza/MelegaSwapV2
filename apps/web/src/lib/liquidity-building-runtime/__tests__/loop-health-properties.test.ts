import { describe, expect, it } from 'vitest'
import {
  assessLiquidityBuildingRuntimeHealth,
  AutonomousLoopStateMachine,
  buildObservation,
  decideLiquidityBuilding,
  isEconomicallySuccessful,
  runAutonomousLoopStep,
  type ObservedSwapEvent,
} from '../index'

describe('LB009 properties / loop / health', () => {
  it('property: excluded flow never enters eligible', () => {
    for (let i = 0; i < 64; i++) {
      const buy = BigInt(i + 1) * 10n ** 15n
      const events: ObservedSwapEvent[] = [
        {
          chainId: 56,
          pair: '0xPair',
          projectToken: '0xP',
          quoteAsset: '0xQ',
          projectIsToken0: true,
          blockNumber: 1,
          blockHash: '0xh',
          transactionHash: `0x${i.toString(16).padStart(64, '0')}`,
          logIndex: 0,
          amount0In: '0',
          amount1In: buy.toString(),
          amount0Out: '1',
          amount1Out: '0',
          txStatus: 'SUCCESS',
          isCanonicalPair: true,
          isLiquidityBuildingExecution: i % 2 === 0,
        },
      ]
      const obs = buildObservation({
        program: '0xProg',
        pair: '0xPair',
        projectToken: '0xP',
        quoteAsset: '0xQ',
        observationStartBlock: 1,
        observationEndBlock: 1,
        events,
      })
      if (i % 2 === 0) {
        expect(obs.eligible.buyQuote).toBe('0')
        expect(BigInt(obs.excluded.buyQuote)).toBe(buy)
      } else {
        expect(obs.eligible.buyQuote).toBe(buy.toString())
      }
      expect(BigInt(obs.eligible.buyQuote) + BigInt(obs.excluded.buyQuote)).toBe(
        BigInt(obs.observed.buyQuote),
      )
    }
  })

  it('property: decision rate never exceeds ceiling', () => {
    for (let rate = 0; rate <= 10000; rate += 250) {
      const d = decideLiquidityBuilding({
        program: '0xProg',
        epochId: '1',
        observationReference: '0x',
        eligibleNetBuyFlow: '1000000000000000000',
        strategyMode: 'FullAi',
        selectedRateBps: rate,
        anchorProjectReserve: '1' + '0'.repeat(21),
        anchorQuoteReserve: '1' + '0'.repeat(21),
        remainingBudget: '1' + '0'.repeat(21),
        epochAlreadyExecuted: false,
      })
      expect(d.selectedRateBps).toBeLessThanOrEqual(5000)
    }
  })

  it('state machine bounded transitions', () => {
    const m = new AutonomousLoopStateMachine(3)
    m.transition('OBSERVE', 'go')
    m.transition('FINALIZE', 'fin')
    m.transition('DECIDE', 'dec')
    m.transition('SIGN', 'sign')
    m.transition('SIGNING_UNAVAILABLE', 'kms')
    expect(m.state).toBe('SIGNING_UNAVAILABLE')
    expect(() => m.transition('SUBMIT', 'bad')).toThrow(/INVALID_TRANSITION/)
  })

  it('health never READY while blockers present', () => {
    const h = assessLiquidityBuildingRuntimeHealth()
    expect(h.status).not.toBe('READY')
    expect(h.status).toBe('BLOCKED')
    expect(h.components.kmsSigner).toBe('BLOCKED')
    expect(h.components.treasuryIngestion).toBe('BLOCKED')
    expect(h.components.relay).toBe('BLOCKED')
  })

  it('economic success requires full evidence chain', () => {
    expect(
      isEconomicallySuccessful({
        txStatus: 'CONFIRMED',
        executionCompleted: true,
        treasurySettled: true,
        lpDelivered: true,
      }),
    ).toBe(true)
    expect(
      isEconomicallySuccessful({
        txStatus: 'CONFIRMED',
        executionCompleted: true,
        treasurySettled: false,
        lpDelivered: true,
      }),
    ).toBe(false)
  })

  it('36-42. full loop stops at signing unavailable (no fabricated mainnet)', async () => {
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
    const result = await runAutonomousLoopStep({
      program: '0xProg',
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
      observationStartBlock: 90,
      observationEndBlock: 100,
      chainHead: 200,
      events,
      decisionInput: {
        epochId: '1',
        strategyMode: 'FullAi',
        selectedRateBps: 2000,
        remainingBudget: '1000000000000000000000',
        epochAlreadyExecuted: false,
        anchorProjectReserve: '1000000000000000000000',
        anchorQuoteReserve: '1000000000000000000000',
      },
      intentExtras: {
        factory: '0xFactory',
        factoryVersion: '0x' + '11'.repeat(32),
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
      },
    })
    expect(result.observation?.status).toBe('FINALIZED')
    expect(result.decision?.decision).toBe('EXECUTE')
    expect(result.state).toBe('SIGNING_UNAVAILABLE')
    expect(result.artifact?.signingStatus).toBe('DISABLED')
    expect(result.health.status).toBe('BLOCKED')
  })
})
