/**
 * Explore Pools click integrity.
 * Pair identity is the on-chain chainId + pair + token0 + token1.
 * WBNB/MGC, USDT/MGC, and MARCO/WBNB were read from the BSC factory.
 * WPOL/KONG was read from the Polygon factory. No address here is inferred.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { ERC20Token } from '@pancakeswap/sdk'
import { isAddress } from 'utils'
import { toDiscoveryCard } from '../modules/liquidityPoolDiscoveryModel'
import {
  buildExplorePoolAddHref,
  buildLiquidityInputCurrency,
  canonicalWrappedSymbol,
  explorePoolContractUrl,
  liquidityAddDeepLinkPreservesPair,
  manualCurrencyReplacesSelection,
  parseExploreAddQuery,
  parseLiquidityChainId,
  resolveLiquidityInputDisplay,
} from '../modules/explorePoolClick'

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const MGC = '0xbb73BB2505AC4643d5C0a99c2A1F34B3DfD09D11'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const WPOL = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
const KONG = '0x9e5f008F477797654D4c34b19A77478dD9664814'
const BASE_WETH = '0x4200000000000000000000000000000000000006'
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const ETH_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const PAIRS = {
  wbnbMgc: {
    chainId: 56,
    pair: '0x52C435b262781E488B674821606D0dB5dff23bd7',
    token0: WBNB,
    token1: MGC,
    symbol0: 'WBNB',
    symbol1: 'MGC',
    explorer: 'https://bscscan.com',
  },
  usdtMgc: {
    chainId: 56,
    pair: '0xce074f8e3da7b4560a6774dfa18dc66173b1e238',
    token0: USDT,
    token1: MGC,
    symbol0: 'USDT',
    symbol1: 'MGC',
    explorer: 'https://bscscan.com',
  },
  marcoWbnb: {
    chainId: 56,
    pair: '0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E',
    token0: MARCO,
    token1: WBNB,
    symbol0: 'MARCO',
    symbol1: 'WBNB',
    explorer: 'https://bscscan.com',
  },
  wpolKong: {
    chainId: 137,
    pair: '0xEe437aEEeA33aED4FF22b525120e1dAd0C9E2411',
    token0: WPOL,
    token1: KONG,
    symbol0: 'WPOL',
    symbol1: 'KONG',
    explorer: 'https://polygonscan.com',
  },
  baseWethUsdc: {
    chainId: 8453,
    pair: '0xf2157f527ad7572691d25371838cbe040e93cdd3',
    token0: BASE_WETH,
    token1: BASE_USDC,
    symbol0: 'WETH',
    symbol1: 'USDC',
    explorer: 'https://basescan.org',
  },
  ethWeth: {
    chainId: 1,
    pair: '0x7f0183d7c1b0365a3580ecbdb2f0d8db2d693c5e',
    token0: '0x5911dc98a9e1a4fffd802c3a57cda6bbd26cdb76',
    token1: ETH_WETH,
    symbol0: undefined,
    symbol1: 'WETH',
    explorer: 'https://etherscan.io',
  },
} as const

function checksum(address: string): string {
  const value = isAddress(address.toLowerCase())
  if (!value) throw new Error(`invalid address ${address}`)
  return value
}

function hrefParts(href: string) {
  const url = new URL(href, 'https://melega.local')
  const [, , token0, token1] = url.pathname.split('/')
  return { url, token0, token1 }
}

describe('Explore Pools click integrity', () => {
  it('points every real indexed pair at its own chain explorer and add route', () => {
    const hrefs = new Set<string>()
    const explorers = new Set<string>()
    for (const pair of Object.values(PAIRS)) {
      const href = buildExplorePoolAddHref({ ...pair, pairAddress: pair.pair })
      const explorer = explorePoolContractUrl(pair.chainId, pair.pair)
      const parts = hrefParts(href)
      expect(parts.token0.toLowerCase()).toBe(pair.token0.toLowerCase())
      expect(parts.token1.toLowerCase()).toBe(pair.token1.toLowerCase())
      expect(parts.url.searchParams.get('chain')).toBe(String(pair.chainId))
      expect(parts.url.searchParams.get('pair')?.toLowerCase()).toBe(pair.pair.toLowerCase())
      expect(explorer).toBe(`${pair.explorer}/address/${checksum(pair.pair)}`)
      hrefs.add(href.toLowerCase())
      explorers.add(explorer!.toLowerCase())
    }
    expect(hrefs.size).toBe(Object.keys(PAIRS).length)
    expect(explorers.size).toBe(Object.keys(PAIRS).length)
  })

  it('keeps WBNB wrapped and WPOL wrapped when the wallet is on another chain', () => {
    const wbnb = resolveLiquidityInputDisplay({
      chainId: 56,
      addressOrId: WBNB,
      indexedSymbol: 'WBNB',
      walletChainId: 1,
    })
    const mgc = resolveLiquidityInputDisplay({
      chainId: 56,
      addressOrId: MGC,
      indexedSymbol: 'MGC',
      walletChainId: 1,
    })
    const wpol = resolveLiquidityInputDisplay({
      chainId: 137,
      addressOrId: WPOL,
      indexedSymbol: 'WPOL',
      walletChainId: 56,
    })
    const kong = resolveLiquidityInputDisplay({
      chainId: 137,
      addressOrId: KONG,
      indexedSymbol: 'KONG',
      walletChainId: 56,
    })
    expect(wbnb?.isToken).toBe(true)
    expect(wbnb?.symbol).toBe('WBNB')
    expect(wbnb?.chainId).toBe(56)
    expect(wbnb?.isNative).toBe(false)
    expect(mgc?.symbol).toBe('MGC')
    expect(mgc?.chainId).toBe(56)
    expect(mgc).toBeInstanceOf(ERC20Token)
    expect((mgc as ERC20Token).decimals).toBe(9)
    expect(wpol?.symbol).toBe('WPOL')
    expect(wpol?.symbol).not.toBe('WMATIC')
    expect(wpol?.isNative).toBe(false)
    expect(wpol?.chainId).toBe(137)
    expect(kong?.symbol).toBe('KONG')
    expect(kong?.chainId).toBe(137)
    expect(canonicalWrappedSymbol(56, 'BNB')).toBe('WBNB')
    expect(buildLiquidityInputCurrency(56, 'BNB')?.isNative).toBe(true)
    expect(buildLiquidityInputCurrency(56, 'BNB')?.symbol).toBe('BNB')
    expect(buildLiquidityInputCurrency(137, 'POL')?.isNative).toBe(true)
  })

  it('round-trips a deep link and replaces it on back/forward without inventing a pair', () => {
    const first = buildExplorePoolAddHref({ ...PAIRS.wbnbMgc, pairAddress: PAIRS.wbnbMgc.pair })
    const second = buildExplorePoolAddHref({ ...PAIRS.wpolKong, pairAddress: PAIRS.wpolKong.pair })
    const read = (href: string) => {
      const parts = hrefParts(href)
      return parseExploreAddQuery(
        {
          view: 'add',
          chain: parts.url.searchParams.get('chain'),
          pair: parts.url.searchParams.get('pair'),
          token0: parts.token0,
          token1: parts.token1,
          symbol0: parts.url.searchParams.get('symbol0'),
          symbol1: parts.url.searchParams.get('symbol1'),
        },
        1,
      )
    }
    const parsedFirst = read(first)
    const parsedSecond = read(second)
    expect(parsedFirst.kind).toBe('pair')
    expect(parsedSecond.kind).toBe('pair')
    if (parsedFirst.kind !== 'pair' || parsedSecond.kind !== 'pair') return
    expect(parsedFirst.key).not.toBe(parsedSecond.key)
    expect(parsedFirst.selection.chainId).toBe(56)
    expect(parsedFirst.selection.pairAddress?.toLowerCase()).toBe(PAIRS.wbnbMgc.pair.toLowerCase())
    expect(parsedSecond.selection.chainId).toBe(137)
    expect(parsedSecond.selection.token0.toLowerCase()).toBe(WPOL.toLowerCase())
    expect(parsedSecond.selection.token1.toLowerCase()).toBe(KONG.toLowerCase())
    expect(liquidityAddDeepLinkPreservesPair({ view: 'add', token0: WBNB, token1: MGC })).toBe(true)
    expect(liquidityAddDeepLinkPreservesPair({ view: 'remove', token0: WBNB, token1: MGC })).toBe(false)
    expect(liquidityAddDeepLinkPreservesPair({ view: 'add', token0: 'not-an-address', token1: MGC })).toBe(false)
  })

  it('tells the truth for a missing pair, missing metadata, and an unsupported network', () => {
    expect(explorePoolContractUrl(56, null)).toBeNull()
    expect(explorePoolContractUrl(56, 'not-a-pair')).toBeNull()
    expect(explorePoolContractUrl(999999, PAIRS.wbnbMgc.pair)).toBeNull()
    expect(
      buildExplorePoolAddHref({
        chainId: 999999,
        pairAddress: PAIRS.wbnbMgc.pair,
        token0: WBNB,
        token1: MGC,
      }),
    ).toBe('/add')
    expect(parseExploreAddQuery({ chain: '999999', token0: WBNB, token1: MGC }, 56)).toEqual({
      kind: 'unsupported',
      chainId: 999999,
    })
    expect(parseExploreAddQuery({ chain: '56' }, 1)).toEqual({ kind: 'empty' })
    expect(parseLiquidityChainId('bsc')).toBe(56)
    expect(parseLiquidityChainId('polygon')).toBe(137)
    expect(parseLiquidityChainId('ethereum')).toBe(1)
    expect(parseLiquidityChainId('base')).toBe(8453)
    expect(parseLiquidityChainId('nope')).toBeNull()

    const unknown = '0x0000000000000000000000000000000000000001'
    const token = buildLiquidityInputCurrency(56, unknown)
    expect(token?.symbol).toBe('Token')
    expect(token?.isToken && token.address.toLowerCase()).toBe(unknown.toLowerCase())

    const href = buildExplorePoolAddHref({
      chainId: 56,
      token0: WBNB,
      token1: MGC,
      symbol0: 'WBNB',
      symbol1: 'MGC',
    })
    expect(hrefParts(href).url.searchParams.get('pair')).toBeNull()
  })

  it('does not keep a manually chosen token that differs from the explore pair', () => {
    const selection = {
      chainId: 56,
      pairAddress: checksum(PAIRS.marcoWbnb.pair),
      token0: checksum(MARCO),
      token1: checksum(WBNB),
      symbol0: 'MARCO',
      symbol1: 'WBNB',
    }
    const same = new ERC20Token(56, checksum(MARCO), 18, 'MARCO')
    const other = new ERC20Token(56, checksum(MGC), 9, 'MGC')
    const wrongChain = new ERC20Token(1, checksum(MARCO), 18, 'MARCO')
    expect(manualCurrencyReplacesSelection(selection, same, 'A')).toBe(false)
    expect(manualCurrencyReplacesSelection(selection, other, 'A')).toBe(true)
    expect(manualCurrencyReplacesSelection(selection, wrongChain, 'A')).toBe(true)
  })

  it('builds the discovery card link from the pair itself', () => {
    const card = toDiscoveryCard(
      {
        pairAddress: PAIRS.marcoWbnb.pair,
        token0: MARCO,
        token1: WBNB,
        symbol0: 'MARCO',
        symbol1: 'WBNB',
        classification: 'tradeable',
        metadataStatus: 'complete',
        active: true,
      },
      { tvlUsd: 3700, tvlKnown: true },
      null,
      56,
    )
    expect(card?.pairName).toBe('MARCO / WBNB')
    expect(card?.explorerHref).toBe(`https://bscscan.com/address/${checksum(PAIRS.marcoWbnb.pair)}`)
    expect(card?.addHref.toLowerCase()).toContain(MARCO.toLowerCase())
    expect(card?.addHref.toLowerCase()).toContain(WBNB.toLowerCase())
    expect(card?.addHref).toContain('chain=56')
    expect(card?.addHref.toLowerCase()).toContain(PAIRS.marcoWbnb.pair.toLowerCase())
  })

  it('wires the card, add alias, and chain switch guard without a new router', () => {
    const studio = path.resolve(__dirname, '..')
    const card = readFileSync(path.join(studio, 'modules/LiquidityPoolDiscoveryCard.tsx'), 'utf8')
    const addPage = readFileSync(path.resolve(__dirname, '../../../pages/add/[[...currency]].tsx'), 'utf8')
    const shell = readFileSync(path.join(studio, 'v3/LiquidityStudioV3Shell.tsx'), 'utf8')
    const addModule = readFileSync(path.join(studio, 'modules/LiquidityAddModule.tsx'), 'utf8')
    const runtime = readFileSync(path.join(studio, 'liquidityRuntime/useLiquidityMintRuntime.tsx'), 'utf8')
    expect(card).toContain('rel="noopener noreferrer"')
    expect(card).toContain('target="_blank"')
    expect(card).toContain('View ${card.pairName} LP pair contract')
    expect(card).toContain('data-add-href={card.addHref}')
    expect(addPage).toContain('window.location.search')
    expect(addPage).toContain('#liquidity-add')
    expect(shell).toContain('liquidityAddDeepLinkPreservesPair')
    expect(shell).toContain('preservePair:')
    expect(addModule).toContain("Do NOT call setMode('Add Liquidity') on mount")
    expect(addModule).toContain('router.query.token0')
    expect(addModule).toContain('This network is not supported for Add Liquidity.')
    expect(addModule).toContain('Switch Network')
    expect(runtime).toContain('Switch to the pool network before adding liquidity.')
    expect(runtime).not.toContain('new Router')
  })
})
