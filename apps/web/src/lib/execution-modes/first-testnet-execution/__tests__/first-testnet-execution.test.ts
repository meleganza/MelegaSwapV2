import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { ExecutionTracker } from 'lib/execution-tracker'
import {
  enableKerlTestnetExecutionActivation,
  resetGenesisExecutionAttemptFlag,
  resetKerlExecutionHarness,
  runFirstTestnetExecution,
  evaluateTestnetExecutionPreconditions,
  buildSettlementEventCandidate,
} from 'lib/execution-modes'
import { createSmartSwapExecutionInstruction } from 'lib/routing-layer'

const HANDOFF_PATH = resolve(
  __dirname,
  '../../../../../public/registry/kerl/handoffs/genesis-testnet-execution-handoff.json',
)

function loadHandoff() {
  return JSON.parse(readFileSync(HANDOFF_PATH, 'utf8'))
}

describe('first-testnet-execution T2', () => {
  beforeEach(() => {
    resetKerlExecutionHarness()
    resetGenesisExecutionAttemptFlag()
    ExecutionTracker.resetForTests()
  })

  afterEach(() => {
    resetKerlExecutionHarness()
    resetGenesisExecutionAttemptFlag()
    ExecutionTracker.resetForTests()
  })

  it('aborts when wallet is not funded', async () => {
    enableKerlTestnetExecutionActivation()
    const result = await runFirstTestnetExecution({
      handoffJson: loadHandoff(),
      account: '0x00000000000000000000000000000000000000aa',
      walletFunded: false,
    })
    expect(result.verdict).toBe('KERL_FIRST_TESTNET_EXECUTION_ABORTED')
    expect(result.transactionHash).toBeNull()
    expect(result.settlementCandidate).toBeNull()
    expect(result.missionDirector.missionActionsCreated).toBe(0)
  })

  it('aborts when activation is not engaged', async () => {
    const pre = evaluateTestnetExecutionPreconditions(loadHandoff(), {
      account: '0xaa',
      walletFunded: true,
    })
    expect(pre.passed).toBe(false)
    expect(pre.blocking.some((b) => b.startsWith('execution_mode'))).toBe(true)
  })

  it('succeeds with mocked adapter — exactly one tx hash', async () => {
    enableKerlTestnetExecutionActivation()
    const result = await runFirstTestnetExecution({
      handoffJson: loadHandoff(),
      account: '0x00000000000000000000000000000000000000aa',
      walletFunded: true,
      adapters: {
        smartSwap: async () => ({ hash: '0xgenesis_testnet_hash' }),
        v2Swap: async () => {
          throw new Error('not used')
        },
        bridgeBurn: async () => {
          throw new Error('not used')
        },
      },
      onReceipt: {
        hash: '0xgenesis_testnet_hash',
        blockNumber: 12345,
        gasUsed: '21000',
        receiptTimestamp: '2026-07-03T20:30:00.000Z',
      },
    })

    expect(result.verdict).toBe('KERL_FIRST_TESTNET_EXECUTION_SUCCESS')
    expect(result.transactionHash).toBe('0xgenesis_testnet_hash')
    expect(result.settlementCandidate?.treasuryMutation).toBe(false)
    expect(result.settlementCandidate?.treasuryIngestion).toBe(false)
    expect(result.missionDirector.autoExecution).toBe(false)
    expect(result.kcis.reacted).toBe(false)
    expect(result.economicMemory.reacted).toBe(false)
  })

  it('blocks second execution attempt in same process', async () => {
    enableKerlTestnetExecutionActivation()
    await runFirstTestnetExecution({
      handoffJson: loadHandoff(),
      account: '0xaa',
      walletFunded: true,
      adapters: {
        smartSwap: async () => ({ hash: '0xfirst' }),
        v2Swap: async () => {
          throw new Error('not used')
        },
        bridgeBurn: async () => {
          throw new Error('not used')
        },
      },
    })
    const second = await runFirstTestnetExecution({
      handoffJson: loadHandoff(),
      account: '0xaa',
      walletFunded: true,
      adapters: {
        smartSwap: async () => ({ hash: '0xsecond' }),
        v2Swap: async () => {
          throw new Error('not used')
        },
        bridgeBurn: async () => {
          throw new Error('not used')
        },
      },
    })
    expect(second.verdict).toBe('KERL_FIRST_TESTNET_EXECUTION_ABORTED')
  })

  it('builds settlement candidate without treasury mutation', () => {
    const instruction = createSmartSwapExecutionInstruction({
      trade: {
        inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1' } },
        outputAmount: { currency: { symbol: 'BUSD' }, quotient: { toString: () => '0' } },
        route: { routeType: 'V2' },
        tradeType: 0,
      } as any,
      allowedSlippage: 50,
      recipient: null,
      chainId: 97,
    })
    const candidate = buildSettlementEventCandidate({
      instruction,
      executionId: 'exec-genesis-001',
      txHash: '0xabc',
      blockNumber: 99,
      gasUsed: '21000',
      receiptTimestamp: '2026-07-03T20:30:00.000Z',
    })
    expect(candidate.status).toBe('candidate_only')
    expect(candidate.treasuryMutation).toBe(false)
    expect(candidate.chainId).toBe(97)
  })
})
