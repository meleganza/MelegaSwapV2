/**
 * MELEGASWAP_V2_RUNTIME_DEPLOYMENT_FATAL_CRASH_FIX
 *
 * Measured production stack (Playwright on ?chain=avalanche):
 * TypeError: Cannot read properties of undefined (reading 'isToken')
 *   at Token.equals (swap-sdk)
 *   at useBUSDPrice useMemo (hooks/useBUSDPrice.ts)
 *
 * Trigger: activeChainId=43114 → USDT[43114] undefined → wrapped.equals(stable)
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ChainId, Token, WNATIVE } from '@pancakeswap/sdk'
import { USDT } from '@pancakeswap/tokens'

const WEB = path.resolve(__dirname, '../..')
const BUSDprice = path.resolve(WEB, 'hooks/useBUSDPrice.ts')

describe('runtime/deployment fatal crash — useBUSDPrice stable guard', () => {
  it('reproduces exact Token.equals(undefined) exception', () => {
    const wavax = WNATIVE[ChainId.AVAX]
    expect(USDT[ChainId.AVAX]).toBeUndefined()
    expect(() => wavax.equals(undefined as unknown as Token)).toThrowError(
      /Cannot read properties of undefined \(reading 'isToken'\)/,
    )
  })

  it('useBUSDPrice early-returns when stable is missing (no equals(undefined))', () => {
    const src = readFileSync(BUSDprice, 'utf8')
    expect(src).toMatch(/!wnative\s*\|\|\s*!stable/)
    expect(src).toContain("reading 'isToken'")
  })
})
