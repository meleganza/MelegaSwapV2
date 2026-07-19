import { describe, expect, it } from 'vitest'
import {
  assessFinality,
  buildObservation,
  classifyDirection,
  classifySwap,
  type ObservedSwapEvent,
} from '../index'

const base = (over: Partial<ObservedSwapEvent> = {}): ObservedSwapEvent => ({
  chainId: 56,
  pair: '0xPair',
  projectToken: '0xProject',
  quoteAsset: '0xQuote',
  projectIsToken0: true,
  blockNumber: 100,
  blockHash: '0xblock',
  transactionHash: '0xtx1',
  logIndex: 0,
  amount0In: '0',
  amount1In: '0',
  amount0Out: '0',
  amount1Out: '0',
  txStatus: 'SUCCESS',
  isCanonicalPair: true,
  ...over,
})

describe('LB009 eligible flow / observer', () => {
  it('1. valid buy classification (project token0)', () => {
    const e = base({ amount1In: '1000', amount0Out: '500' })
    expect(classifyDirection(e)).toEqual({ direction: 'BUY', quoteAmount: 1000n })
  })

  it('2. valid sell classification (project token0)', () => {
    const e = base({ amount0In: '500', amount1Out: '900' })
    expect(classifyDirection(e)).toEqual({ direction: 'SELL', quoteAmount: 900n })
  })

  it('3. token0/project orientation buy', () => {
    const e = base({ projectIsToken0: true, amount1In: '10', amount0Out: '1' })
    expect(classifyDirection(e).direction).toBe('BUY')
  })

  it('4. token1/project orientation buy', () => {
    const e = base({ projectIsToken0: false, amount0In: '10', amount1Out: '1' })
    expect(classifyDirection(e).direction).toBe('BUY')
  })

  it('5. excluded LB swap increases excluded not eligible', () => {
    const obs = buildObservation({
      program: '0xProg',
      pair: '0xPair',
      projectToken: '0xProject',
      quoteAsset: '0xQuote',
      observationStartBlock: 1,
      observationEndBlock: 10,
      events: [
        base({
          amount1In: '1000',
          amount0Out: '1',
          isLiquidityBuildingExecution: true,
          transactionHash: '0xlb',
        }),
        base({
          amount1In: '500',
          amount0Out: '1',
          transactionHash: '0xuser',
          logIndex: 1,
        }),
      ],
    })
    expect(obs.excluded.buyQuote).toBe('1000')
    expect(obs.eligible.buyQuote).toBe('500')
    expect(obs.eligibleNetBuyFlow).toBe('500')
    expect(obs.excluded.reasons.LB_OWN_SWAP).toBe(1)
  })

  it('6. excluded add liquidity', () => {
    const seen = new Set<string>()
    const c = classifySwap(base({ isAddLiquidity: true, amount1In: '1', amount0Out: '1' }), seen)
    expect(c.excluded).toBe(true)
    expect(c.exclusionReason).toBe('ADD_LIQUIDITY')
  })

  it('7. duplicate log', () => {
    const seen = new Set<string>()
    const e = base({ amount1In: '10', amount0Out: '1' })
    classifySwap(e, seen)
    const dup = classifySwap(e, seen)
    expect(dup.exclusionReason).toBe('DUPLICATE_EVENT')
  })

  it('8. reverted transaction', () => {
    const seen = new Set<string>()
    const c = classifySwap(base({ txStatus: 'REVERTED', amount1In: '10', amount0Out: '1' }), seen)
    expect(c.exclusionReason).toBe('REVERTED')
  })

  it('9. reorg handling', () => {
    const a = assessFinality({
      observationEndBlock: 100,
      chainHead: 200,
      recordedEndBlockHash: '0xaaa',
      currentEndBlockHash: '0xbbb',
    })
    expect(a.status).toBe('REORGED')
  })

  it('10. finality handling', () => {
    const waiting = assessFinality({ observationEndBlock: 100, chainHead: 110 })
    expect(waiting.status).toBe('AWAITING_FINALITY')
    const ok = assessFinality({ observationEndBlock: 100, chainHead: 120 })
    expect(ok.status).toBe('FINALIZED')
    expect(ok.confirmations).toBe(20)
  })
})
