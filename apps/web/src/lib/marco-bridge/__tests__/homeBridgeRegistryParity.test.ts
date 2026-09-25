/**
 * P0 MELEGA-HOME-POLYGON-BRIDGE
 *
 * The Home "MARCO Bridge" tab and /bridge must be the SAME product: one panel component
 * (MarcoBridgePanel) reading the ONE canonical Wave-1 registry (MARCO_WAVE1_NETWORKS +
 * MARCO_WAVE1_ROUTE_ACTIVATION). No surface may keep its own chain array.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  MARCO_WAVE1_DIRECT_ROUTES,
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_ROUTE_ACTIVATION,
  POLYGON_ROUND_TRIP_CERTIFIED,
  localRouteActivationEnabled,
} from '../wave1Registry'

const SRC = path.resolve(__dirname, '../../..')
const read = (rel: string) => readFileSync(path.join(SRC, rel), 'utf8')
const POLYGON_OFT = '0xF31A621A0e75d90fdA320EeE52956D718Fa34615'
const BNB_ADAPTER = '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E'
const RETIRED_POLYGON = '0xd3e28c74177b812d1543a406ad1a97ee3c398ac2'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    if (statSync(p).isDirectory()) return name === '__tests__' ? [] : walk(p)
    return /\.(ts|tsx)$/.test(name) ? [p] : []
  })
}

describe('Home MARCO Bridge ↔ /bridge registry parity', () => {
  const workspace = read('views/MarcoBridge/MarcoBridgeWorkspace.tsx')

  it('Home, Trade and /bridge all mount the same MarcoBridgePanel from MarcoBridgeWorkspace', () => {
    const importPanel =
      "import('views/MarcoBridge/MarcoBridgeWorkspace').then((module) => module.MarcoBridgePanel)"
    expect(read('views/HomeTrade/HomeSwapPanel.tsx')).toContain(importPanel)
    expect(read('views/HomeTrade/HomeSwapPanel.tsx')).toContain('<MarcoBridgePanel embedded />')
    expect(read('views/Trade/TradeCockpit.tsx')).toContain(importPanel)
    expect(read('pages/bridge/index.tsx')).toContain("import MarcoBridgeWorkspace from 'views/MarcoBridge/MarcoBridgeWorkspace'")
    expect(workspace).toMatch(/export const MarcoBridgePanel: React\.FC<\{ embedded\?: boolean \}>/)
  })

  it('both network selectors (embedded and full page) are built from the canonical registry only', () => {
    expect(workspace).toContain('const networkEntries = Object.values(MARCO_WAVE1_NETWORKS)')
    const selectorBlocks = workspace.match(/\{networkEntries\.map\(\(network\) => \(\s*<option key=\{network\.id\} value=\{network\.id\}>/g) ?? []
    expect(selectorBlocks).toHaveLength(2)
    // The embedded flag only changes layout; it never filters networks.
    expect(workspace).not.toMatch(/embedded[^\n]*networkEntries|networkEntries[^\n]*embedded/)
    const home = read('views/HomeTrade/HomeSwapPanel.tsx')
    expect(home).not.toMatch(/Robinhood Chain|Solana|chainId:\s*137|30109/)
  })

  it('the registry exposes Polygon to every surface: selector order includes Polygon', () => {
    const labels = Object.values(MARCO_WAVE1_NETWORKS).map((n) => n.label)
    expect(labels).toEqual(['BNB Smart Chain', 'Base', 'Solana', 'Robinhood Chain', 'Polygon', 'Arc'])
  })
})

describe('canonical Polygon entry', () => {
  it('Polygon PoS fields match the certified truth', () => {
    const polygon = MARCO_WAVE1_NETWORKS.polygon
    expect(polygon).toMatchObject({
      id: 'polygon',
      label: 'Polygon',
      shortLabel: 'Polygon',
      walletFamily: 'evm',
      chainId: 137,
      layerZeroEid: 30109,
      marcoIdentity: POLYGON_OFT,
      endpointContract: POLYGON_OFT,
      tokenDecimals: 18,
      sharedDecimals: 6,
      nativeFeeSymbol: 'POL',
    })
    expect(MARCO_WAVE1_NETWORKS.bnb.endpointContract).toBe(BNB_ADAPTER)
  })

  it('BNB↔Polygon is a certified active direct route; no other Polygon pair is active', () => {
    expect(POLYGON_ROUND_TRIP_CERTIFIED).toBe(true)
    expect(localRouteActivationEnabled('bnb', 'polygon')).toBe(true)
    expect(localRouteActivationEnabled('polygon', 'bnb')).toBe(true)
    for (const other of ['base', 'solana', 'robinhood', 'arc', 'polygon'] as const) {
      expect(localRouteActivationEnabled('polygon', other)).toBe(false)
      expect(localRouteActivationEnabled(other, 'polygon')).toBe(false)
    }
    const ids = MARCO_WAVE1_DIRECT_ROUTES.map((r) => `${r.from}:${r.to}`)
    expect(ids).toEqual(expect.arrayContaining(['bnb:polygon', 'polygon:bnb']))
  })

  it('identity guard: live binding requires MELEGA / MARCO; no "MARCO (MARCO)" copy on bridge surfaces', () => {
    const authority = read('lib/marco-bridge/polygonAuthority.ts')
    expect(authority).toContain("name !== 'MELEGA'")
    expect(authority).toContain("symbol !== 'MARCO'")
    const files = [
      ...walk(path.join(SRC, 'lib/marco-bridge')),
      ...walk(path.join(SRC, 'views/MarcoBridge')),
      ...walk(path.join(SRC, 'pages/api/marco-bridge')),
      path.join(SRC, 'views/HomeTrade/HomeSwapPanel.tsx'),
    ]
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toContain('MARCO (MARCO)')
  })

  it('zero references to the retired Polygon token in the active bridge route code', () => {
    const files = [
      ...walk(path.join(SRC, 'lib/marco-bridge')),
      ...walk(path.join(SRC, 'views/MarcoBridge')),
      ...walk(path.join(SRC, 'pages/api/marco-bridge')),
      path.join(SRC, 'views/HomeTrade/HomeSwapPanel.tsx'),
      path.join(SRC, 'config/publicNetworkSwitchCapabilities.ts'),
    ]
    expect(files.length).toBeGreaterThan(10)
    for (const f of files) expect(readFileSync(f, 'utf8').toLowerCase(), f).not.toContain(RETIRED_POLYGON)
    for (const n of Object.values(MARCO_WAVE1_NETWORKS)) {
      expect(String(n.marcoIdentity).toLowerCase()).not.toBe(RETIRED_POLYGON)
      expect(String(n.endpointContract).toLowerCase()).not.toBe(RETIRED_POLYGON)
    }
  })
})

describe('no unintended activation', () => {
  it('Base keeps its current canonical public state (visible, not executable); Arc/Solana/Robinhood unchanged', () => {
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['bnb:base']).toBe(false)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['base:bnb']).toBe(false)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['bnb:solana']).toBe(true)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['solana:bnb']).toBe(true)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['bnb:robinhood']).toBe(true)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['robinhood:bnb']).toBe(true)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['bnb:arc']).toBe(true)
    expect(MARCO_WAVE1_ROUTE_ACTIVATION['arc:bnb']).toBe(true)
  })
})
