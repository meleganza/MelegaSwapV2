import { describe, expect, it } from 'vitest'
import {
  buildProtocolHistoryRows,
  buildWalletHistoryRows,
  mergeTradeHistoryRows,
} from '../formatTradeHistory'
import type { TransactionDetails } from 'state/transactions/reducer'

describe('trade history runtime', () => {
  it('builds wallet rows from confirmed swaps without fabrication', () => {
    const txs: TransactionDetails[] = [
      {
        hash: '0xabc123',
        from: '0xuser',
        addedTime: Date.now() - 60_000,
        confirmedTime: Date.now() - 30_000,
        type: 'swap',
        summary: 'Swap 1 BNB for 100 MARCO',
        receipt: { status: 1, transactionHash: '0xabc123', blockNumber: 1, gasUsed: '1', effectiveGasPrice: '1' },
        settlementHandoffContext: {
          schema: 'melega.dex-swap-handoff-context.v1',
          asset: { symbol: 'BNB', address: '0xbb4' },
          amount: '1',
          fee: '0.01',
        },
      },
    ]
    const rows = buildWalletHistoryRows(txs, {})
    expect(rows).toHaveLength(1)
    expect(rows[0].pair).toContain('BNB')
    expect(rows[0].txHash).toBe('0xabc123')
    expect(rows[0].source).toBe('wallet')
    expect(rows[0].status).toBe('confirmed')
  })

  it('shows protocol rows when wallet disconnected', () => {
    const rows = buildProtocolHistoryRows(
      [
        {
          hash: '0xproto1',
          type: 0,
          timestamp: String(Math.floor(Date.now() / 1000) - 120),
          sender: '0xabc',
          token0Symbol: 'BNB',
          token1Symbol: 'MARCO',
          amountToken0: 1,
          amountToken1: 100,
          amountUSD: 250,
        } as never,
      ],
      'BNB',
      'MARCO',
    )
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].source).toBe('protocol')
    expect(rows[0].settlementStatus).toBe('No settlement data')
  })

  it('merge does not duplicate tx hashes', () => {
    const wallet = buildWalletHistoryRows(
      [
        {
          hash: '0xdup',
          from: '0x1',
          addedTime: 1,
          type: 'swap',
          receipt: { status: 1, transactionHash: '0xdup', blockNumber: 1, gasUsed: '1', effectiveGasPrice: '1' },
        },
      ],
      {},
    )
    const protocol = buildProtocolHistoryRows(
      [{ hash: '0xdup', type: 0, timestamp: '1', sender: '0x', token0Symbol: 'A', token1Symbol: 'B', amountToken0: 1, amountToken1: 1, amountUSD: 1 } as never],
      'A',
      'B',
    )
    const merged = mergeTradeHistoryRows(wallet, protocol)
    expect(merged.filter((r) => r.txHash === '0xdup')).toHaveLength(1)
  })

  it('returns empty when no transactions', () => {
    expect(buildProtocolHistoryRows(undefined)).toEqual([])
    expect(buildWalletHistoryRows([], {})).toEqual([])
  })
})
