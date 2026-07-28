import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getAddress } from '@ethersproject/address'
import { getTokenLogoURLByAddress, getTokenLogoPosition } from 'utils/getTokenLogoURL'
import { Token } from '@pancakeswap/sdk'
import { buildHopVisualization } from '../visualization'

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const ETH = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'

const token = (address: string, symbol: string) => ({
  address,
  symbol,
  decimals: 18,
  chainId: 56,
  isNative: false as const,
})

function logoBundle(address: string, symbol: string) {
  const checksum = getAddress(address)
  const trust = getTokenLogoURLByAddress(address, 56)
  const local = getTokenLogoPosition(new Token(56, address, 18, symbol))
  return {
    address: checksum,
    symbol,
    trustWalletLogo: trust,
    canonicalLocalLogo: local,
    fallback: 'generic-placeholder',
  }
}

describe('SMART_SWAP_ROUTE_LOGO_MAPPING', () => {
  it('BNB → MARCO attaches exact addresses (never inherit hop logos)', () => {
    const viz = buildHopVisualization({
      inputToken: { ...token(WBNB, 'BNB'), isNative: true },
      outputToken: token(MARCO, 'MARCO'),
      hops: [
        {
          index: 0,
          tokenIn: WBNB,
          tokenOut: MARCO,
          pool: { address: '0xpair', kind: 'v2', token0: WBNB, token1: MARCO },
        },
      ],
      pools: [{ address: '0xpair', kind: 'v2', token0: WBNB, token1: MARCO }],
      pathSymbols: ['BNB', 'MARCO'],
      pathAddresses: [WBNB, MARCO],
    })
    const tokens = viz.filter((h) => h.kind === 'token')
    const pool = viz.find((h) => h.kind === 'pool')
    expect(tokens[0]?.address?.toLowerCase()).toBe(WBNB.toLowerCase())
    expect(tokens[tokens.length - 1]?.address?.toLowerCase()).toBe(MARCO.toLowerCase())
    expect(pool?.token0Address?.toLowerCase()).toBe(WBNB.toLowerCase())
    expect(pool?.token1Address?.toLowerCase()).toBe(MARCO.toLowerCase())
    expect(tokens[tokens.length - 1]?.address?.toLowerCase()).not.toBe(WBNB.toLowerCase())
  })

  it('BNB → ETH and BNB → MARCO → ETH keep distinct logos per address', () => {
    const direct = buildHopVisualization({
      inputToken: { ...token(WBNB, 'BNB'), isNative: true },
      outputToken: token(ETH, 'ETH'),
      hops: [
        {
          index: 0,
          tokenIn: WBNB,
          tokenOut: ETH,
          pool: { address: '0xp', kind: 'v2', token0: WBNB, token1: ETH },
        },
      ],
      pools: [{ address: '0xp', kind: 'v2', token0: WBNB, token1: ETH }],
      pathSymbols: ['BNB', 'ETH'],
      pathAddresses: [WBNB, ETH],
    })
    expect(direct.filter((h) => h.kind === 'token').map((h) => h.address?.toLowerCase())).toEqual([
      WBNB.toLowerCase(),
      ETH.toLowerCase(),
    ])

    const multi = buildHopVisualization({
      inputToken: { ...token(WBNB, 'BNB'), isNative: true },
      outputToken: token(ETH, 'ETH'),
      hops: [
        {
          index: 0,
          tokenIn: WBNB,
          tokenOut: MARCO,
          pool: { address: '0xp1', kind: 'v2', token0: WBNB, token1: MARCO },
        },
        {
          index: 1,
          tokenIn: MARCO,
          tokenOut: ETH,
          pool: { address: '0xp2', kind: 'v2', token0: MARCO, token1: ETH },
        },
      ],
      pools: [
        { address: '0xp1', kind: 'v2', token0: WBNB, token1: MARCO },
        { address: '0xp2', kind: 'v2', token0: MARCO, token1: ETH },
      ],
      pathSymbols: ['BNB', 'MARCO', 'ETH'],
      pathAddresses: [WBNB, MARCO, ETH],
    })
    const tokenAddrs = multi.filter((h) => h.kind === 'token').map((h) => h.address?.toLowerCase())
    expect(tokenAddrs).toEqual([WBNB.toLowerCase(), MARCO.toLowerCase(), ETH.toLowerCase()])
    expect(new Set(tokenAddrs).size).toBe(3)
  })

  it('resolved logo URIs differ for BNB / MARCO / ETH', () => {
    const bnb = logoBundle(WBNB, 'BNB')
    const marco = logoBundle(MARCO, 'MARCO')
    const eth = logoBundle(ETH, 'ETH')
    expect(bnb.trustWalletLogo).not.toBe(marco.trustWalletLogo)
    expect(marco.trustWalletLogo).not.toBe(eth.trustWalletLogo)
    expect(bnb.canonicalLocalLogo).not.toBe(marco.canonicalLocalLogo)
  })

  it('SmartSwapVisualRoute never falls back MARCO→inputCurrency/BNB', () => {
    const visualSrc = readFileSync(
      join(__dirname, '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapVisualRoute.tsx'),
      'utf8',
    )
    expect(visualSrc).toMatch(/AddressTokenLogo/)
    expect(visualSrc).toMatch(/never inherit previous hop/)
    expect(visualSrc).not.toMatch(/inputCurrency\s*\|\|\s*outputCurrency/)
    expect(visualSrc).toMatch(/Placeholder/)
  })
})
