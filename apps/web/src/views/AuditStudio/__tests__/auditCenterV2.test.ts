/**
 * MELEGASWAP_V2_AUDIT_CENTER_V2 — structural + score contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  buildOfficialContracts,
  computeMelegaScore,
  scoreOfficialContract,
  buildDimensions,
  buildChainBoard,
} from 'views/AuditStudio/buildOfficialContracts'

const WEB = path.resolve(__dirname, '../../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_AUDIT_CENTER_V2', () => {
  it('mounts Audit Center V2 from /audit', () => {
    const page = load('pages/audit/index.tsx')
    expect(page).toContain('AuditCenterV2')
    expect(page).toContain("from 'views/AuditStudio/AuditCenterV2'")
    expect(existsSync(path.join(WEB, 'views/AuditStudio/AuditCenterV2.tsx'))).toBe(true)
  })

  it('lists official contracts from SSOTs (not a 4-row hardcode)', () => {
    const rows = buildOfficialContracts()
    expect(rows.length).toBeGreaterThan(10)
    const names = rows.map((r) => r.name)
    expect(names.some((n) => /Router/i.test(n))).toBe(true)
    expect(names.some((n) => /Factory/i.test(n))).toBe(true)
    expect(names.some((n) => /MasterBuilder|MasterChef/i.test(n))).toBe(true)
    expect(names.some((n) => /Token Factory/i.test(n))).toBe(true)
    expect(names.some((n) => /Farm Factory/i.test(n))).toBe(true)
    expect(names.some((n) => /Liquidity Building/i.test(n))).toBe(true)
    expect(names.some((n) => /Treasury/i.test(n))).toBe(true)
    expect(rows.every((r) => /^0x[a-fA-F0-9]{40}$/.test(r.address))).toBe(true)
  })

  it('Melega Score is weighted average with transparent formula', () => {
    const rows = buildOfficialContracts()
    const result = computeMelegaScore(rows)
    expect(result.score).toBeGreaterThan(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.formula).toContain('MelegaScore = Σ')
    expect(result.contractCount).toBe(rows.length)
    const manual =
      rows.reduce((s, c) => s + c.score * c.weight, 0) / rows.reduce((s, c) => s + c.weight, 0)
    expect(result.score).toBe(Math.round(manual * 10) / 10)
  })

  it('contract score formula is deterministic', () => {
    expect(
      scoreOfficialContract({
        address: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
        chainStatus: 'LIVE',
        certified: true,
        verified: true,
      }),
    ).toBe(100)
    expect(
      scoreOfficialContract({
        address: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
        chainStatus: 'PREPARING',
        certified: false,
        verified: false,
      }),
    ).toBe(50)
  })

  it('dimensions + multichain board cover mission indicators', () => {
    const contracts = buildOfficialContracts()
    const score = computeMelegaScore(contracts).score
    const dims = buildDimensions({ contracts, melegaScore: score })
    for (const id of [
      'Health',
      'Security',
      'Availability',
      'Verification',
      'Infrastructure',
      'Runtime',
      'Transparency',
      'Indexer',
      'Liquidity',
      'Routing',
      'Wallet',
      'Oracle',
      'Bridge',
      'Deployment',
    ]) {
      expect(dims.some((d) => d.id === id)).toBe(true)
    }
    const board = buildChainBoard(contracts)
    expect(board.map((b) => b.label)).toEqual(
      expect.arrayContaining(['BNB', 'Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Avalanche']),
    )
  })

  it('UI is Mission Control — cards, gauge, live status, timeline; not a plain table', () => {
    const ui = load('views/AuditStudio/AuditCenterV2.tsx')
    expect(ui).toContain('LIVE SECURITY CENTER')
    expect(ui).toContain('audit-melega-score')
    expect(ui).toContain('ScoreGauge')
    expect(ui).toContain('audit-contracts')
    expect(ui).toContain('ContractCard')
    expect(ui).toContain('audit-live-status')
    expect(ui).toContain('audit-timeline')
    expect(ui).toContain('audit-multichain')
    expect(ui).toContain('DonutRing')
    expect(ui).toContain('Heatmap')
    expect(ui).not.toContain('<table')
    expect(ui).not.toMatch(/views\/Swap\/SmartSwap/)
  })

  it('header search is primary and not clipped by chain cluster', () => {
    const header = load('design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx')
    expect(header).toContain('max-width: min(520px, 42vw)')
    expect(header).toContain('overflow: visible')
    expect(header).toContain('margin-left: 16px')
    const search = load('app-shell/components/GlobalSearch.tsx')
    expect(search).toContain('width: 100%')
    const bar = load('design-system/melega/components/SearchBar/MelegaSearchBar.tsx')
    expect(bar).toContain('padding: 0 14px 0 18px')
    expect(bar).toContain('color: #a8a8a8')
  })
})
