import { ChainId, ERC20Token, Native } from '@pancakeswap/sdk'
import { Interface } from '@ethersproject/abi'
import IPancakePairABI from 'config/abi/IPancakePair.json'
import { buildCanonicalMarcoPair, isCanonicalMarcoPair } from '../useCanonicalMarcoPair'

const MARCO = new ERC20Token(
  ChainId.BSC,
  '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  18,
  'MARCO',
)
const WBNB = Native.onChain(ChainId.BSC).wrapped

describe('canonical MARCO/WBNB pair fallback', () => {
  it('recognizes only the canonical BSC token pair', () => {
    expect(isCanonicalMarcoPair(MARCO, WBNB)).toBe(true)
    expect(isCanonicalMarcoPair(WBNB, MARCO)).toBe(true)
  })

  it('decodes factual non-zero reserves into the canonical SDK pair', () => {
    const encoded = new Interface(IPancakePairABI).encodeFunctionResult('getReserves', [
      '5614585003390050901146488',
      '2945959282143129406',
      1786636366,
    ])
    const pair = buildCanonicalMarcoPair(MARCO, WBNB, encoded)
    expect(pair.reserveOf(MARCO).quotient.toString()).toBe('5614585003390050901146488')
    expect(pair.reserveOf(WBNB).quotient.toString()).toBe('2945959282143129406')
  })
})
