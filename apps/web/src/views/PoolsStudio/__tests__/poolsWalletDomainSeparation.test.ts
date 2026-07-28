/**
 * Regression: Liquidity / Farms / Pools position domains must not be substituted.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../../../')
const FIXTURE = path.join(
  WEB,
  'docs/runtime/melega-dex-v1-pools-wallet-fixture-discovery/wallet-domain-separation.json',
)
const WALLET_FIXTURE = path.join(
  WEB,
  'docs/runtime/melega-dex-v1-pools-wallet-fixture-discovery/pools-wallet-fixture.json',
)

describe('Pools wallet domain separation', () => {
  it('documents three distinct position domains and forbids AMM LP as Pools proof', () => {
    const domains = JSON.parse(readFileSync(FIXTURE, 'utf8'))
    const ids = domains.domains.map((d: { id: string }) => d.id)
    expect(ids).toEqual(['LIQUIDITY_POSITION', 'FARM_POSITION', 'POOL_POSITION'])
    expect(domains.regressionAssertion).toMatch(/AMM LP ownership/i)
    expect(domains.regressionAssertion).toMatch(/never be treated as a positive Pools fixture/i)
    expect(domains.domains[1].canonicalContract).toBe(
      '0x41D5487836452d23f2c467070244E5842B412794',
    )
  })

  it('binds positive Pools fixture to SmartChef userInfo, not founder AMM wallet', () => {
    const fix = JSON.parse(readFileSync(WALLET_FIXTURE, 'utf8'))
    expect(fix.positiveFixture.wallet.toLowerCase()).not.toBe(
      '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
    )
    expect(fix.positiveFixture.smartChef.toLowerCase()).not.toBe(
      '0x41d5487836452d23f2c467070244e5842b412794',
    )
    expect(Number(fix.positiveFixture.onChainPrincipal)).toBeGreaterThan(0)
    expect(fix.emptyFixtureWallet.toLowerCase()).toBe(
      '0xa08f3d3ea8b268aab9a5b4854d7800dafa6f4513',
    )
  })
})
