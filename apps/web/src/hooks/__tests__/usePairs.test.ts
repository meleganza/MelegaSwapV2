import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ChainId, CurrencyAmount, ERC20Token, Native, Pair } from '@pancakeswap/sdk'
import { describe, expect, it, vi } from 'vitest'
import { isCurrentDirectPair, safePairPriceOf } from '../usePairs'

const WBNB = Native.onChain(ChainId.BSC).wrapped
const BNB = Native.onChain(ChainId.BSC)
const MARCO = new ERC20Token(ChainId.BSC, '0x963556de0eb8138E97A85F0A86eE0acD159D210b', 18, 'MARCO')
const LUCK = new ERC20Token(ChainId.BSC, '0xeE86B71B787f6DCF83a9856D181dda2b7b8398B0', 18, 'LUCK')

function pairOf(tokenA: ERC20Token, tokenB: ERC20Token, reserveA = '1000000000000000000', reserveB = '2000000000000000000') {
  return new Pair(CurrencyAmount.fromRawAmount(tokenA, reserveA), CurrencyAmount.fromRawAmount(tokenB, reserveB))
}

describe('stale directPair after token change (BNB→LUCK)', () => {
  const staleWbnbMarco = pairOf(WBNB, MARCO)
  const currentLuckMarco = pairOf(LUCK, MARCO)

  it('rejects stale WBNB/MARCO directPair when current tokens are LUCK/MARCO', () => {
    expect(isCurrentDirectPair(staleWbnbMarco, LUCK, MARCO)).toBe(false)
    expect(isCurrentDirectPair(staleWbnbMarco, MARCO, LUCK)).toBe(false)
  })

  it('does not throw and yields no quote when pricing LUCK against stale WBNB/MARCO', () => {
    const priceOf = vi.spyOn(staleWbnbMarco, 'priceOf')
    expect(() => safePairPriceOf(staleWbnbMarco, LUCK)).not.toThrow()
    expect(safePairPriceOf(staleWbnbMarco, LUCK)).toBeUndefined()
    expect(priceOf).not.toHaveBeenCalled()
    priceOf.mockRestore()
  })

  it('accepts a matching current pair and keeps the valid priceOf path unchanged', () => {
    expect(isCurrentDirectPair(staleWbnbMarco, BNB, MARCO)).toBe(true)
    expect(isCurrentDirectPair(staleWbnbMarco, WBNB, MARCO)).toBe(true)
    expect(isCurrentDirectPair(currentLuckMarco, LUCK, MARCO)).toBe(true)

    expect(safePairPriceOf(currentLuckMarco, LUCK)).toEqual(currentLuckMarco.priceOf(LUCK))
    expect(safePairPriceOf(staleWbnbMarco, WBNB)).toEqual(staleWbnbMarco.priceOf(WBNB))

    const luckAmount = CurrencyAmount.fromRawAmount(LUCK, '1000000000000000000')
    expect(safePairPriceOf(currentLuckMarco, LUCK)?.quote(luckAmount).quotient.toString()).toBe(
      currentLuckMarco.priceOf(LUCK).quote(luckAmount).quotient.toString(),
    )
  })

  it('guards usePair and useDerivedMintInfo without changing keepPreviousData', () => {
    const pairsSrc = readFileSync(path.resolve(__dirname, '../usePairs.ts'), 'utf8')
    const mintSrc = readFileSync(path.resolve(__dirname, '../../state/mint/hooks.ts'), 'utf8')
    const canonicalSrc = readFileSync(path.resolve(__dirname, '../useCanonicalMarcoPair.ts'), 'utf8')

    const derivedMintInfo = mintSrc.slice(mintSrc.indexOf('export function useDerivedMintInfo'), mintSrc.indexOf('const MAX_ZAP_REVERSE_RATIO'))

    expect(pairsSrc).toContain('isCurrentDirectPair(directPair, tokenA, tokenB)')
    expect(pairsSrc).toContain('directPair.involvesToken(wrappedA) && directPair.involvesToken(wrappedB)')
    expect(derivedMintInfo).toContain('safePairPriceOf(pair, pricedToken)')
    expect(derivedMintInfo).toContain('safePairPriceOf(pair, wrappedCurrencyA)')
    expect(derivedMintInfo).not.toMatch(/pair\.priceOf\(/)
    expect(canonicalSrc).toContain('keepPreviousData: true')
  })
})
