import { ChainId, ERC20Token, Native, Pair } from '@pancakeswap/sdk'
import { Interface } from '@ethersproject/abi'
import IPancakePairABI from 'config/abi/IPancakePair.json'
import { buildCanonicalMarcoPair, isCanonicalMarcoPair } from '../useCanonicalMarcoPair'

const MARCO = new ERC20Token(ChainId.BSC, '0x963556de0eb8138E97A85F0A86eE0acD159D210b', 18, 'MARCO')
const WBNB = Native.onChain(ChainId.BSC).wrapped
const MM72 = new ERC20Token(ChainId.BSC, '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E', 18, 'MM72')

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

  it('builds a direct non-MARCO Melega pair for the generic reserve fallback', () => {
    expect(Pair.getAddress(MM72, WBNB)).toBe('0x7825da4753eb52d918dAc368f59D1FB734daFB72')
    const encoded = new Interface(IPancakePairABI).encodeFunctionResult('getReserves', [
      '768225810329010812',
      '1277583630844617659880943735',
      1786732008,
    ])
    const pair = buildCanonicalMarcoPair(MM72, WBNB, encoded)
    expect(pair.reserveOf(MM72).quotient.toString()).toBe('1277583630844617659880943735')
    expect(pair.reserveOf(WBNB).quotient.toString()).toBe('768225810329010812')
  })
})
