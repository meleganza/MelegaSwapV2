import { ChainId, Pair, Token, WNATIVE } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import contracts from 'config/constants/contracts'
import { getSwapProtocolFeeBps, isMarcoTokenAddress } from 'lib/d87-pricing/d87PricingCodex'
import { computeFeeAmountRaw } from 'lib/smartswap-universal-engine/evaluateRevenuePolicy'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import {
  getMarcoRegistryEntry,
  isBuyMarcoByAddress,
  isExplicitLegacyMarcoLookup,
  isPolygonCanonicalMarco,
  isPolygonLegacyMarco,
  POLYGON_CANONICAL_MARCO_ADDRESS,
  POLYGON_LEGACY_MARCO_ADDRESS,
} from 'lib/melega-smart-router/marcoRegistry'
import { readKerlMarcoToken } from 'lib/melega-smart-router/registry/kerlRegistry'
import { includePolygonMarcoSearchResult } from 'components/SearchModal/filtering'
import canonicalAsset from '../../../../public/registry/assets/marco-polygon-canonical.json'
import legacyAsset from '../../../../public/registry/assets/marco-polygon.json'
import { describe, expect, it } from 'vitest'

const USDT = '0x55d398326f99059fF775485246999027B3197955'
const BSC_MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const BASE_MARCO = '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7'

describe('Polygon official MARCO identity', () => {
  it('resolves public Polygon MARCO to the canonical OFT and keeps the legacy contract binding', () => {
    expect(getMarcoRegistryEntry(137).marcoTokenAddress?.toLowerCase()).toBe(
      POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase(),
    )
    expect(readKerlMarcoToken(137).marcoTokenAddress?.toLowerCase()).toBe(POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase())
    expect(POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase()).toBe(
      MARCO_WAVE1_NETWORKS.polygon.marcoIdentity.toLowerCase(),
    )
    expect(contracts.marco[137].toLowerCase()).toBe(POLYGON_LEGACY_MARCO_ADDRESS.toLowerCase())
    expect(CAKE[ChainId.POLYGON].address.toLowerCase()).toBe(POLYGON_LEGACY_MARCO_ADDRESS.toLowerCase())
    expect(contracts.masterChef[137].toLowerCase()).toBe('0x130d2bd998767b6091352dd71feaba4460846d94')
  })

  it('default token list offers only the canonical Polygon MARCO', () => {
    const polygonMarcos = (defaultTokenList.tokens as Array<{ chainId: number; address: string; symbol: string }>).filter(
      (token) => token.chainId === 137 && token.symbol === 'MARCO',
    )
    expect(polygonMarcos.map((token) => token.address.toLowerCase())).toEqual([
      POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase(),
    ])
    expect(defaultTokenList.version.patch).toBeGreaterThan(0)
  })

  it('archives the legacy registry record and does not mark the canonical pair live', () => {
    expect(legacyAsset.contract_address.toLowerCase()).toBe(POLYGON_LEGACY_MARCO_ADDRESS.toLowerCase())
    expect(legacyAsset.lifecycle).toBe('archived')
    expect(legacyAsset.project_binding.is_primary).toBe(false)
    expect(legacyAsset.trust.badges).not.toContain('canonical')
    expect(canonicalAsset.contract_address.toLowerCase()).toBe(POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase())
    expect(canonicalAsset.symbol).toBe('MARCO')
    expect(canonicalAsset.decimals).toBe(18)
    expect(canonicalAsset.trust.badges).toContain('canonical')
    expect(canonicalAsset.capabilities.tradable.status).not.toBe('live')
    expect(canonicalAsset.capabilities.liquidity.status).toBe('none')
  })

  it('does not treat symbol, wrong chain, impostor, or missing chain as Polygon canonical', () => {
    expect(isPolygonCanonicalMarco(137, POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase())).toBe(true)
    expect(isPolygonLegacyMarco(137, POLYGON_LEGACY_MARCO_ADDRESS.toLowerCase())).toBe(true)
    expect(isPolygonCanonicalMarco(56, POLYGON_CANONICAL_MARCO_ADDRESS)).toBe(false)
    expect(isPolygonLegacyMarco(56, POLYGON_LEGACY_MARCO_ADDRESS)).toBe(false)
    expect(isPolygonCanonicalMarco(137, '0x0000000000000000000000000000000000000001')).toBe(false)
    expect(isBuyMarcoByAddress(137, undefined)).toBe(false)
    expect(isMarcoTokenAddress(POLYGON_CANONICAL_MARCO_ADDRESS)).toBe(false)
    expect(isMarcoTokenAddress(POLYGON_LEGACY_MARCO_ADDRESS)).toBe(false)
    expect(getSwapProtocolFeeBps({ outputAddress: POLYGON_CANONICAL_MARCO_ADDRESS })).toBe(30)
    expect(getSwapProtocolFeeBps({ outputAddress: POLYGON_LEGACY_MARCO_ADDRESS })).toBe(30)
  })

  it('classifies Polygon buy-MARCO only for the canonical output', () => {
    expect(getSwapProtocolFeeBps({ chainId: 137, outputAddress: POLYGON_CANONICAL_MARCO_ADDRESS })).toBe(20)
    expect(
      getSwapProtocolFeeBps({
        chainId: 137,
        inputAddress: USDT,
        outputAddress: POLYGON_CANONICAL_MARCO_ADDRESS.toLowerCase(),
      }),
    ).toBe(20)
    expect(getSwapProtocolFeeBps({ chainId: 137, outputAddress: POLYGON_LEGACY_MARCO_ADDRESS })).toBe(30)
    expect(
      getSwapProtocolFeeBps({
        chainId: 137,
        inputAddress: POLYGON_CANONICAL_MARCO_ADDRESS,
        outputAddress: USDT,
      }),
    ).toBe(30)
    expect(getSwapProtocolFeeBps({ chainId: 137, outputAddress: USDT })).toBe(30)
    expect(getSwapProtocolFeeBps({ chainId: 56, outputAddress: BSC_MARCO })).toBe(20)
    expect(getSwapProtocolFeeBps({ chainId: 56, outputAddress: USDT })).toBe(30)
    expect(getSwapProtocolFeeBps({ chainId: 8453, outputAddress: BASE_MARCO })).toBe(20)
    expect(getSwapProtocolFeeBps({ chainId: 56, outputAddress: POLYGON_CANONICAL_MARCO_ADDRESS })).toBe(30)
  })

  it('keeps integer floor fee math and does not add a second charge', () => {
    const canonicalBps = getSwapProtocolFeeBps({ chainId: 137, outputAddress: POLYGON_CANONICAL_MARCO_ADDRESS })
    const legacyBps = getSwapProtocolFeeBps({ chainId: 137, outputAddress: POLYGON_LEGACY_MARCO_ADDRESS })
    expect(computeFeeAmountRaw('10001', canonicalBps)).toBe('20')
    expect(computeFeeAmountRaw('10001', legacyBps)).toBe('30')
    expect(canonicalBps).toBe(20)
    expect(legacyBps).toBe(30)
  })

  it('search keeps canonical and legacy as different addresses', () => {
    const canonical = { chainId: 137, address: POLYGON_CANONICAL_MARCO_ADDRESS, symbol: 'MARCO', name: 'MELEGA' }
    const legacy = { chainId: 137, address: POLYGON_LEGACY_MARCO_ADDRESS, symbol: 'MARCO', name: 'MARCO Legacy' }
    const both = [canonical, legacy]
    expect(includePolygonMarcoSearchResult(137, canonical.address, 'MARCO')).toBe(true)
    expect(includePolygonMarcoSearchResult(137, legacy.address, 'MARCO')).toBe(false)
    expect(includePolygonMarcoSearchResult(137, legacy.address, 'MARCO Legacy')).toBe(true)
    expect(includePolygonMarcoSearchResult(137, legacy.address, POLYGON_LEGACY_MARCO_ADDRESS.toLowerCase())).toBe(true)
    expect(isExplicitLegacyMarcoLookup('MARCO')).toBe(false)
    expect(both.filter((token) => includePolygonMarcoSearchResult(137, token.address, 'MARCO'))).toEqual([canonical])
    expect(both.filter((token) => includePolygonMarcoSearchResult(137, token.address, 'legacy'))).toEqual([canonical, legacy])
  })

  it('does not reuse the legacy Melega pair as the canonical pair', () => {
    const wrapped = WNATIVE[ChainId.POLYGON]
    const legacy = new Token(ChainId.POLYGON, POLYGON_LEGACY_MARCO_ADDRESS, 18, 'MARCO', 'MARCO Legacy')
    const canonical = new Token(ChainId.POLYGON, POLYGON_CANONICAL_MARCO_ADDRESS, 18, 'MARCO', 'MELEGA')
    expect(Pair.getAddress(wrapped, legacy).toLowerCase()).not.toBe(Pair.getAddress(wrapped, canonical).toLowerCase())
    expect(canonicalAsset.relationships.liquidity_pools).toEqual([])
  })
})
