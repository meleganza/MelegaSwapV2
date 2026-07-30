import { createHash } from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import { getTradeSurfaceAssets, getCanonicalIndexedAssets } from 'lib/dex-asset-index'

const OUT = path.resolve(
  __dirname,
  '../../../docs/runtime/melega-dex-v1-final-founder-acceptance-release-candidate',
)

describe('RC Listed Projects export', () => {
  it('writes exact proof inventory matching KPI measurement', () => {
    mkdirSync(OUT, { recursive: true })
    const measured = measureListedProjectsCount()
    const tokenlist56 = ((defaultTokenList.tokens ?? []) as Array<{ chainId?: number }>).filter(
      (t) => t.chainId === 56,
    ).length
    const trade = getTradeSurfaceAssets().length
    const canonical = getCanonicalIndexedAssets().length

    // Rebuild address list with same rules as measureListedProjectsCount
    const ZERO = '0x0000000000000000000000000000000000000000'
    const SYSTEM = new Set([
      '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c',
      '0xc25033218d181b27d4a2944fbb04fc055da4eab3',
      ZERO,
    ])
    const QUOTE = new Set([
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      '0x55d398326f99059ff775485246999027b3197955',
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
      '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    ])
    const isLp = (s: string) => s.includes('-') || s.includes('/') || /lp$/i.test(s)
    const seen = new Set<string>()
    const consider = (address?: string, symbol?: string) => {
      if (!address) return
      const addr = address.toLowerCase()
      if (!/^0x[a-f0-9]{40}$/.test(addr) || SYSTEM.has(addr)) return
      if (symbol && isLp(symbol)) return
      if (QUOTE.has(addr)) return
      seen.add(addr)
    }
    for (const t of (defaultTokenList.tokens ?? []) as Array<{
      chainId?: number
      address?: string
      symbol?: string
    }>) {
      if (t.chainId !== 56) continue
      consider(t.address, t.symbol)
    }
    for (const a of getTradeSurfaceAssets()) consider(a.address, a.symbol)
    for (const a of getCanonicalIndexedAssets()) consider(a.address, a.symbol)

    const addresses = [...seen].sort()
    expect(addresses.length).toBe(measured.finalCount)
    expect(measured.finalCount).toBeGreaterThan(50)
    expect(measured.finalCount).not.toBe(5)

    const proof = {
      chainId: 56,
      measuredAt: new Date().toISOString(),
      tokenlistSourceCount: tokenlist56,
      pairIndexSourceCount: trade,
      projectRegistrySourceCount: canonical,
      unionCountBeforeDedupe: measured.rawDiscovered,
      duplicatesRemoved: measured.duplicatesRemoved,
      lpTokensAndSystemRemoved: measured.lpOrSystemExcluded,
      quoteInfraExcluded: measured.quoteInfraExcluded,
      finalCount: measured.finalCount,
      provenance: measured.provenance,
      kpiMustEqual: measured.finalCount,
    }
    writeFileSync(path.join(OUT, 'listed-projects-proof.json'), JSON.stringify(proof, null, 2) + '\n')
    writeFileSync(
      path.join(OUT, 'listed-project-addresses.json'),
      JSON.stringify({ chainId: 56, count: addresses.length, addresses }, null, 2) + '\n',
    )
    const hash = createHash('sha256').update(addresses.join('\n') + '\n').digest('hex')
    writeFileSync(path.join(OUT, 'listed-project-addresses.sha256'), `${hash}  listed-project-addresses.json\n`)
  })
})
