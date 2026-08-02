/**
 * Canary configuration alignment — product model SSOT (no live tx).
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { LB_CANARY, LB_SUCCESS_FEE_BPS, resolveCanaryOrientation } from '../founderActivateFlow'
import { LB_UX } from '../uxCopy'

const DOCS = path.resolve(
  __dirname,
  '../../../../../docs/runtime/melega-dex-v1-liquidity-builder-canary-configuration-alignment',
)

function readJson(name: string) {
  return JSON.parse(readFileSync(path.join(DOCS, name), 'utf8'))
}

describe('Canary configuration alignment', () => {
  it('SSOT canary-config uses Token Reserve = MARCO, Quote = WBNB', () => {
    const config = readJson('canary-config.json')
    expect(config.verdict).toBe('MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_CONFIGURATION_ALIGNED')
    expect(config.transactionExecuted).toBe(false)
    expect(config.canonical.tokenToGrow.symbol).toBe('MARCO')
    expect(config.canonical.quoteAsset.symbol).toBe('WBNB')
    expect(config.canonical.tokenReserve.label).toBe('Token Reserve')
    expect(config.canonical.tokenReserve.asset).toBe('MARCO')
    expect(config.canonical.tokenReserve.human).toBe('1')
    expect(config.productModel.terminologyForbidden).toEqual(
      expect.arrayContaining(['Liquidity Budget', 'WBNB Budget']),
    )
    expect(config.whyReserveIsProjectToken).toMatch(/depositBudget/)
    expect(config.whyQuoteIsSeparate).toMatch(/Quote Asset|quote/i)
  })

  it('UX evidence forbids Liquidity Budget / WBNB Budget primary copy', () => {
    const ux = readJson('ux-evidence.json')
    expect(ux.labels.tokenReserve).toBe('Token Reserve')
    expect(ux.forbiddenPrimaryCopy).toEqual(expect.arrayContaining(['Liquidity Budget', 'WBNB Budget']))
    expect(LB_UX.reserveLabel).toBe('Token Reserve')
    expect(LB_UX.budgetLabel).toBe('Token Reserve')
  })

  it('code LB_CANARY matches SSOT addresses and reserve', () => {
    const config = readJson('canary-config.json')
    expect(LB_CANARY.marco).toBe(config.canonical.tokenToGrow.address)
    expect(LB_CANARY.wbnb).toBe(config.canonical.quoteAsset.address)
    expect(LB_CANARY.marcoWbnbPair).toBe(config.canonical.pair.address)
    expect(LB_CANARY.tokenReserveHuman).toBe(config.canonical.tokenReserve.human)
    expect(LB_CANARY.signer).toBe(config.signer)
    expect(LB_SUCCESS_FEE_BPS).toBe(1000)
    expect(
      resolveCanaryOrientation({
        projectToken: LB_CANARY.marco,
        quoteAsset: LB_CANARY.wbnb,
        quoteEnabled: true,
      }).ok,
    ).toBe(true)
  })
})
