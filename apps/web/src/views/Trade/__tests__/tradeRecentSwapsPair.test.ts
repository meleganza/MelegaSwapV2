import fs from 'fs'
import path from 'path'

describe('trade recent swaps pair reconciliation', () => {
  it('uses the canonical MARCO/WBNB pair before an external aggregator pair', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../useTradeTerminalData.ts'), 'utf8')

    expect(source).toContain(
      'const indexedPairAddress = isMarcoRoute ? MARCO_WBNB_PAIR_BSC : externalDex?.primaryPairAddress',
    )
    expect(source).not.toContain('externalDex?.primaryPairAddress ?? (isMarcoRoute ? MARCO_WBNB_PAIR_BSC : undefined)')
  })
})
