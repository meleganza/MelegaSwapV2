import { describe, expect, it } from 'vitest'
import { mapIndexerEventsToTransactions } from '../client/mapIndexerEvents'
import type { NormalizedIndexerEvent } from '../types'
import { TransactionType } from 'state/info/types'

describe('mapIndexerEventsToTransactions', () => {
  it('maps swap events and filters by pair', () => {
    const events: NormalizedIndexerEvent[] = [
      {
        chainId: 56,
        protocol: 'amm',
        eventType: 'Swap',
        contractAddress: '0xpair1',
        pairAddress: '0xpair1',
        token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        amount0: '1',
        amount1: '2',
        wallet: '0xwallet',
        txHash: '0xhash1',
        logIndex: 1,
        blockNumber: 100,
        blockTimestamp: 1700000000,
        explorerUrl: 'https://bscscan.com/tx/0xhash1',
        sourceStatus: 'indexed',
      },
      {
        chainId: 56,
        protocol: 'amm',
        eventType: 'Mint',
        contractAddress: '0xpair2',
        pairAddress: '0xpair2',
        token0: '0xt0',
        token1: '0xt1',
        amount0: '3',
        amount1: '4',
        wallet: '0xwallet',
        txHash: '0xhash2',
        logIndex: 2,
        blockNumber: 101,
        blockTimestamp: 1700000100,
        explorerUrl: 'https://bscscan.com/tx/0xhash2',
        sourceStatus: 'indexed',
      },
    ]
    const txs = mapIndexerEventsToTransactions(events)
    expect(txs).toHaveLength(2)
    expect(txs[0].type).toBe(TransactionType.SWAP)
    expect(txs[0].token0Symbol).toBe('MARCO')
    expect(txs[1].type).toBe(TransactionType.MINT)
  })

  it('estimates USD from WBNB leg when BNB price hint provided', () => {
    const events: NormalizedIndexerEvent[] = [
      {
        chainId: 56,
        protocol: 'amm',
        eventType: 'Swap',
        contractAddress: '0xpair1',
        pairAddress: '0xpair1',
        token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        amount0: '100',
        amount1: '0.5',
        wallet: '0xwallet',
        txHash: '0xhash1',
        logIndex: 1,
        blockNumber: 100,
        blockTimestamp: 1700000000,
        explorerUrl: 'https://bscscan.com/tx/0xhash1',
        sourceStatus: 'indexed',
      },
    ]
    const txs = mapIndexerEventsToTransactions(events, { bnbUsd: 600 })
    expect(txs[0].amountUSD).toBeCloseTo(300, 5)
  })
})
