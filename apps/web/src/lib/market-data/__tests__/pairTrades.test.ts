import { describe, expect, it } from 'vitest'
import { normalizeGeckoPairTrades } from '../pairTrades'

const marco = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const luck = '0xee86b71b787f6dcf83a9856d181dda2b7b8398b0'

const row = {
  id: 'trade-1',
  attributes: {
    tx_hash: `0x${'1'.repeat(64)}`,
    tx_from_address: `0x${'2'.repeat(40)}`,
    from_token_amount: '6599.27993049973',
    to_token_amount: '3096377.62040876',
    block_timestamp: '2026-08-26T21:08:33Z',
    volume_in_usd: '2.15722381077275',
    from_token_address: marco,
    to_token_address: luck,
  },
}

describe('normalizeGeckoPairTrades', () => {
  it('orients direction and selected amount to the selected project token', () => {
    const [trade] = normalizeGeckoPairTrades({
      rows: [row],
      selectedTokenAddress: luck,
      baseTokenAddress: marco,
      baseTokenSymbol: 'MARCO',
      quoteTokenAddress: luck,
      quoteTokenSymbol: 'LUCK',
    })
    expect(trade.direction).toBe('buy')
    expect(trade.selectedTokenAmount).toBe('3096377.62040876')
    expect(trade.selectedTokenSymbol).toBe('LUCK')
    expect(trade.baseTokenSymbol).toBe('MARCO')
    expect(trade.quoteTokenSymbol).toBe('LUCK')
  })

  it('fails closed when the selected project is not a member of the pool', () => {
    expect(
      normalizeGeckoPairTrades({
        rows: [row],
        selectedTokenAddress: `0x${'3'.repeat(40)}`,
        baseTokenAddress: marco,
        baseTokenSymbol: 'MARCO',
        quoteTokenAddress: luck,
        quoteTokenSymbol: 'LUCK',
      }),
    ).toEqual([])
  })

  it('rejects a trade whose token addresses do not match the certified pool', () => {
    const malformed = {
      ...row,
      attributes: { ...row.attributes, from_token_address: `0x${'4'.repeat(40)}` },
    }
    expect(
      normalizeGeckoPairTrades({
        rows: [malformed],
        selectedTokenAddress: luck,
        baseTokenAddress: marco,
        baseTokenSymbol: 'MARCO',
        quoteTokenAddress: luck,
        quoteTokenSymbol: 'LUCK',
      }),
    ).toEqual([])
  })
})
