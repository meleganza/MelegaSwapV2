import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { VENUE_CAPABILITY, capabilityMap } from '../capabilities'
import { evmNetwork, solanaExecutionEnabled } from '../domain'
import {
  PRODUCTION_EXECUTION_MODE,
  UNIVERSAL_ENGINE_MODE,
  V2_EXTERNAL_VENUE_NOT_ENABLED,
  V2_SOLANA_EXECUTION_NOT_ENABLED,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { CROSS_CHAIN_FORBIDDEN, assertSameChainOnly } from '../shadowCompetition'
import { EXTERNAL_VENUE_IDS } from '../venueRegistry'
import { VENUE_SUPPORT } from '../certifiedVenues'
import {
  buildCertifiedMultichainShadowReadinessInventory,
  certifiedEvmVenueSupport,
  type CertifiedShadowVenueId,
} from '../multichainReadiness'

function row(
  inventory: ReturnType<typeof buildCertifiedMultichainShadowReadinessInventory>,
  chainId: number,
  venueId: CertifiedShadowVenueId,
) {
  const found = inventory.rows.find((entry) => entry.chainId === chainId && entry.venueId === venueId)
  expect(found).toBeDefined()
  return found!
}

describe('SmartSwap Universal Engine M10 certified multichain shadow-readiness inventory', () => {
  it('locks certified multichain SHADOW readiness facts without inventing support', () => {
    expect(PRODUCTION_EXECUTION_MODE).toBe('LEGACY_PRODUCTION')
    expect(UNIVERSAL_ENGINE_MODE).toBe('SHADOW')
    expect(isProductionCutoverAllowed()).toBe(false)

    const inventory = buildCertifiedMultichainShadowReadinessInventory()
    expect(inventory.evmChainIds).toEqual([1, 56, 97, 137, 8453, 42161, 43114])
    expect(inventory.rows).toHaveLength(21)
    const keys = inventory.rows.map((entry) => `${entry.chainId}:${entry.venueId}`)
    expect(new Set(keys).size).toBe(21)

    const bscMelega = row(inventory, 56, 'melega-dex')
    expect(bscMelega.support).toBe(VENUE_SUPPORT.SUPPORTED)
    expect(bscMelega.quoteCapable).toBe(true)
    expect(bscMelega.certifiedRouter).toBeNull()
    const bscPancake = row(inventory, 56, 'pancakeswap')
    expect(bscPancake.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(bscPancake.quoteCapable).toBe(true)
    expect(bscPancake.certifiedRouter).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    const bscUniswap = row(inventory, 56, 'uniswap')
    expect(bscUniswap.support).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(bscUniswap.quoteCapable).toBe(false)
    expect(bscUniswap.certifiedRouter).toBeNull()

    const ethMelega = row(inventory, 1, 'melega-dex')
    expect(ethMelega.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(ethMelega.quoteCapable).toBe(true)
    expect(ethMelega.certifiedRouter).toBeNull()
    const ethPancake = row(inventory, 1, 'pancakeswap')
    expect(ethPancake.support).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(ethPancake.quoteCapable).toBe(false)
    expect(ethPancake.certifiedRouter).toBeNull()
    const ethUniswap = row(inventory, 1, 'uniswap')
    expect(ethUniswap.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(ethUniswap.quoteCapable).toBe(true)
    expect(ethUniswap.certifiedRouter).toBe('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')

    const baseMelega = row(inventory, 8453, 'melega-dex')
    expect(baseMelega.support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(baseMelega.certifiedRouter).toBeNull()
    expect(row(inventory, 8453, 'pancakeswap').support).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(row(inventory, 8453, 'uniswap').support).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(row(inventory, 8453, 'pancakeswap').certifiedRouter).toBeNull()
    expect(row(inventory, 8453, 'uniswap').certifiedRouter).toBeNull()

    for (const chainId of [137, 42161, 43114] as const) {
      expect(row(inventory, chainId, 'melega-dex').support).toBe(VENUE_SUPPORT.QUOTE_ONLY)
      expect(row(inventory, chainId, 'pancakeswap').support).toBe(VENUE_SUPPORT.UNSUPPORTED)
      expect(row(inventory, chainId, 'uniswap').support).toBe(VENUE_SUPPORT.NOT_VERIFIED)
      expect(row(inventory, chainId, 'melega-dex').certifiedRouter).toBeNull()
      expect(row(inventory, chainId, 'pancakeswap').certifiedRouter).toBeNull()
      expect(row(inventory, chainId, 'uniswap').certifiedRouter).toBeNull()
    }

    for (const venueId of ['melega-dex', 'pancakeswap', 'uniswap'] as const) {
      const testnet = row(inventory, 97, venueId)
      expect(testnet.support).toBeNull()
      expect(testnet.quoteCapable).toBe(false)
      expect(testnet.certifiedRouter).toBeNull()
      expect(certifiedEvmVenueSupport(97, venueId)).toBeNull()
    }

    expect(certifiedEvmVenueSupport(56, 'melega-dex')).toBe(VENUE_SUPPORT.SUPPORTED)
    expect(certifiedEvmVenueSupport(56, 'pancakeswap')).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(certifiedEvmVenueSupport(56, 'uniswap')).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(certifiedEvmVenueSupport(1, 'melega-dex')).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(certifiedEvmVenueSupport(1, 'pancakeswap')).toBe(VENUE_SUPPORT.NOT_VERIFIED)
    expect(certifiedEvmVenueSupport(1, 'uniswap')).toBe(VENUE_SUPPORT.QUOTE_ONLY)
    expect(certifiedEvmVenueSupport(97, 'melega-dex')).toBeNull()

    expect(solanaExecutionEnabled()).toBe(false)
    expect(inventory.solanaExecutionEnabled).toBe(false)
    expect(inventory.solanaExecutionReason).toBe(V2_SOLANA_EXECUTION_NOT_ENABLED)

    expect(inventory.robinhoodReason).toBe('FEASIBILITY_REQUIRED')
    expect(EXTERNAL_VENUE_IDS).toContain('robinhood')
    expect(inventory.externalVenueIds).toBe(EXTERNAL_VENUE_IDS)
    expect(inventory.disabledExternalVenueReason).toBe(V2_EXTERNAL_VENUE_NOT_ENABLED)
    expect(inventory.externalVenueIds).toEqual(expect.arrayContaining(['jupiter', 'raydium', 'orca', 'robinhood']))

    const caps = capabilityMap(['QUOTE', 'EVM'])
    expect(caps[VENUE_CAPABILITY.CROSS_CHAIN]).toBe(false)
    expect(caps[VENUE_CAPABILITY.SOLANA]).toBe(false)
    expect(caps[VENUE_CAPABILITY.EXECUTE]).toBe(false)

    const bscRequest = {
      requestId: 'm10-same-chain',
      network: evmNetwork(56),
      inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      inputAmountRaw: '1',
      exactOut: false,
      slippageBps: 50,
    }
    expect(() => assertSameChainOnly(bscRequest)).not.toThrow()
    expect(() =>
      assertSameChainOnly({
        ...bscRequest,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcEthereum,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)
    expect(() =>
      assertSameChainOnly({
        ...bscRequest,
        outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcSolana,
      }),
    ).toThrow(CROSS_CHAIN_FORBIDDEN)

    const src = readFileSync(path.join(__dirname, '../multichainReadiness.ts'), 'utf8')
    expect(src).not.toMatch(/evmShadowRegistry|pancakeSwapAdapter|uniswapAdapter|externalEvmAdapter|authorizedShadowRun/)
    expect(isProductionCutoverAllowed()).toBe(false)
  })
})
