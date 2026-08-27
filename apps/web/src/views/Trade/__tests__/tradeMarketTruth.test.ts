import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const tradeRoot = path.resolve(__dirname, '..')
const chartSource = fs.readFileSync(path.join(tradeRoot, 'components/TradePriceChart.tsx'), 'utf8')
const terminalDataSource = fs.readFileSync(path.join(tradeRoot, 'useTradeTerminalData.ts'), 'utf8')
const indexerHookSource = fs.readFileSync(
  path.resolve(tradeRoot, '../../lib/bsc-indexer/client/useIndexerCandles.ts'),
  'utf8',
)

describe('Swap market data truth', () => {
  it('requests public OHLCV for the selected token orientation', () => {
    expect(chartSource).toContain('usePairOhlcv(activeChainId, pairAddress, token0Address, timeframe)')
  })

  it('does not silently replace an unknown chart pair with MARCO/WBNB', () => {
    expect(indexerHookSource).toContain('const pair = pairAddress?.toLowerCase()')
    expect(indexerHookSource).not.toContain('pairAddress?.toLowerCase() ?? MARCO_WBNB_PAIR_BSC')
    expect(chartSource).toContain('Boolean(pairAddress && indexerSupportsTimeframe)')
    expect(chartSource).toContain("timeframe === '1h' || timeframe === '4h' || timeframe === '1d'")
  })

  it('fails closed instead of showing unrelated recent swaps', () => {
    expect(terminalDataSource).toContain('Boolean(selectedPairAddress)')
    expect(terminalDataSource).toContain('transactionMatchesPair(')
    expect(terminalDataSource).toContain('publicTradeMatchesPair(')
    expect(terminalDataSource).toContain('const indexedRows = [...pairFiltered]')
    expect(terminalDataSource).not.toContain('pairFiltered.length > 0 ? pairFiltered : swapTxs')
  })

  it('uses the exact on-chain pair instead of a token-wide primary market', () => {
    expect(terminalDataSource).toContain('selectedPair?.liquidityToken.address')
    expect(terminalDataSource).toContain('Pair.getAddress(tokenA, tokenB)')
    expect(terminalDataSource).toContain('findExactProjectDexPair(externalDex, selectedPairAddress)')
    expect(terminalDataSource).not.toContain('externalDex?.primaryPairAddress')
  })
})
