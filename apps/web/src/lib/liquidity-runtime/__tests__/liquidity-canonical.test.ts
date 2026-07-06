import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

import { buildLiquidityCanonicalOwnership, LIQUIDITY_ALIAS_ROUTES } from 'lib/liquidity-runtime/canonicalOwnership'
import { routeLiquidityInstruction } from 'lib/routing-layer/facade'
import { LP_SUBMIT_DEFERRAL, assertLpSubmitDeferralDocumented } from 'lib/liquidity-runtime/lpSubmitDeferral'

describe('KAP-006C liquidity runtime canonicalization', () => {
  it('add/remove alias pages declare liquidityRuntime ownership', () => {
    const addPage = path.resolve(__dirname, '../../../pages/add/[[...currency]].tsx')
    const removePage = path.resolve(__dirname, '../../../pages/remove/[[...currency]].tsx')

    expect(fs.readFileSync(addPage, 'utf8')).toContain('liquidityRuntimeAlias')
    expect(fs.readFileSync(removePage, 'utf8')).toContain('liquidityRuntimeAlias')
  })

  it('add/remove still build valid mint/burn routing instructions', () => {
    const mint = routeLiquidityInstruction({
      operation: 'mint',
      currencyA: 'BNB',
      currencyB: 'USDT',
      chainId: 56,
    })
    const burn = routeLiquidityInstruction({
      operation: 'burn',
      currencyA: 'BNB',
      currencyB: 'USDT',
      chainId: 56,
    })

    expect(mint.operation).toBe('mint')
    expect(burn.operation).toBe('burn')
    expect(mint.submitsExecution).toBe(false)
    expect(burn.submitsExecution).toBe(false)
  })

  it('canonical payload indicates liquidityRuntime ownership', () => {
    const addOwnership = buildLiquidityCanonicalOwnership(LIQUIDITY_ALIAS_ROUTES.add)
    const removeOwnership = buildLiquidityCanonicalOwnership(LIQUIDITY_ALIAS_ROUTES.remove)

    expect(addOwnership.owner).toBe('liquidityRuntime')
    expect(removeOwnership.aliasRoute).toBe('/remove')
    expect(addOwnership.mintBurnPrimitives).toContain('state/mint')
    expect(addOwnership.mintBurnPrimitives).toContain('state/burn')
  })

  it('documents accepted LP direct submit deferral (KAP-006E)', () => {
    expect(assertLpSubmitDeferralDocumented()).toBe(true)
    expect(LP_SUBMIT_DEFERRAL.canonicalOwner).toBe('liquidityRuntime')
    expect(LP_SUBMIT_DEFERRAL.ingressSupported).toBe(false)
    expect(LP_SUBMIT_DEFERRAL.forbiddenAuthorities).toContain('settlement')
    expect(LP_SUBMIT_DEFERRAL.forbiddenAuthorities).toContain('reward-computation')
  })
})
