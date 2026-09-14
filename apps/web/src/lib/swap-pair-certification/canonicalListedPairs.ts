/**
 * Canonical Melega DEX listed pairs — farms LP inventory only.
 * Do not invent pairs. pid 0 single-stake MARCO is excluded (not an AMM pair).
 */
import { readFileSync } from 'fs'
import path from 'path'

export const FOUNDER_MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
export const FOUNDER_RAKY_BSC = '0x5f7cc946aBF0c853a2367ac436755dE6AA8D48Bd'
export const FOUNDER_MARCO_RAKY_LP = '0xF62A5c4A5eb810493261D14A971403D78403c5Ee'
export const FOUNDER_WBNB_BSC = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

export const FOUNDER_MARCO_RAKY_QUERY =
  'inputCurrency=0x963556de0eb8138E97A85F0A86eE0acD159D210b&outputCurrency=0x5f7cc946aBF0c853a2367ac436755dE6AA8D48Bd'

export type CanonicalTokenSide = {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name?: string
}

export type CanonicalListedPair = {
  pid: number
  lpSymbol: string
  lpAddress: string
  token: CanonicalTokenSide
  quoteToken: CanonicalTokenSide
  inputCurrencyId: string
  outputCurrencyId: string
  nativeInputCurrencyId: string | null
}

type FarmJsonRow = {
  pid: number
  lpSymbol: string
  lpAddress: string
  token: CanonicalTokenSide
  quoteToken: CanonicalTokenSide
}

const FARMS_56 = path.resolve(__dirname, '../../../../../packages/farms/lists/56.json')

function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

export function loadCanonicalListedPairs(farmsPath = FARMS_56): CanonicalListedPair[] {
  const rows = JSON.parse(readFileSync(farmsPath, 'utf8')) as FarmJsonRow[]
  return rows
    .filter((row) => typeof row.lpSymbol === 'string' && row.lpSymbol.includes(' LP'))
    .filter((row) => row.token?.address && row.quoteToken?.address && row.lpAddress)
    .map((row) => {
      const quoteIsWbnb = normalizeAddress(row.quoteToken.address) === normalizeAddress(FOUNDER_WBNB_BSC)
      const tokenIsWbnb = normalizeAddress(row.token.address) === normalizeAddress(FOUNDER_WBNB_BSC)
      return {
        pid: row.pid,
        lpSymbol: row.lpSymbol,
        lpAddress: row.lpAddress,
        token: row.token,
        quoteToken: row.quoteToken,
        inputCurrencyId: row.quoteToken.address,
        outputCurrencyId: row.token.address,
        nativeInputCurrencyId: quoteIsWbnb ? 'BNB' : tokenIsWbnb ? 'BNB' : null,
      }
    })
}

export function findListedPair(tokenA: string, tokenB: string, pairs = loadCanonicalListedPairs()): CanonicalListedPair | undefined {
  const a = normalizeAddress(tokenA)
  const b = normalizeAddress(tokenB)
  return pairs.find((pair) => {
    const sides = [normalizeAddress(pair.token.address), normalizeAddress(pair.quoteToken.address)]
    return sides.includes(a) && sides.includes(b)
  })
}

export function founderMarcoRakyPair(pairs = loadCanonicalListedPairs()): CanonicalListedPair {
  const found = findListedPair(FOUNDER_MARCO_BSC, FOUNDER_RAKY_BSC, pairs)
  if (!found) {
    throw new Error('Canonical MARCO/RAKY farm pair missing from packages/farms/lists/56.json')
  }
  return found
}
