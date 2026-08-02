/**
 * Repository forbidden-reference audit — Treasury Runtime decommission seal.
 */
import { execSync } from 'child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  DEX_ECONOMIC_AUTHORITY,
  MELEGA_TREASURY_WALLET_ADDRESS,
  isTreasuryRuntimeDecommissioned,
} from 'config/dexEconomicAuthority'
import { isTreasuryRuntimeConfigured } from 'lib/treasury-handoff/config'
import { resolveTreasuryCollector } from 'lib/melega-smart-router'
import { buildSmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')

const FORBIDDEN_UI_PATTERNS = [
  /Treasury Runtime/,
  /Allocated through Treasury Runtime/,
  /KERL attribution/,
  /canonical fee engine/i,
]

const ACTIVE_UI_PATHS = [
  'src/views/SmartSwapStudio/modules/SmartSwapFeeTransparency/SmartSwapFeeTransparencyPanel.tsx',
  'src/views/SmartSwapStudio/modules/SmartSwapFeeTransparency/useSmartSwapFeeTransparency.ts',
  'src/lib/smart-swap-fee-transparency/buildFeeTransparency.ts',
  'src/components/DexPricing/DexSwapFeeDisclosure.tsx',
  'src/components/DexPricing/DexPricingFeesSurface.tsx',
  'src/views/Trade/components/TradeHowItWorksPanel.tsx',
]

const TOP_MOVERS_ANCHORS = [
  'src/views/HomeTrade/DexHomeScreen.tsx',
  'src/views/HomeTrade/useDexTrendingRankings.ts',
]

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '__tests__' || name === 'docs') continue
      walkFiles(full, acc)
    } else if (/\.(ts|tsx|js|jsx)$/.test(name)) {
      acc.push(full)
    }
  }
  return acc
}

describe('Treasury Runtime decommission — forbidden references', () => {
  it('marks Treasury Runtime decommissioned with canonical beneficiary', () => {
    expect(isTreasuryRuntimeDecommissioned()).toBe(true)
    expect(DEX_ECONOMIC_AUTHORITY.treasuryRuntime.authority).toBe('NONE')
    expect(DEX_ECONOMIC_AUTHORITY.treasuryRuntime.runtime_dependency).toBe(false)
    expect(DEX_ECONOMIC_AUTHORITY.beneficiaryAddress).toBe(MELEGA_TREASURY_WALLET_ADDRESS)
    expect(isTreasuryRuntimeConfigured()).toBe(false)
  })

  it('forbids obsolete Smart Swap UI copy in active fee surfaces', () => {
    for (const rel of ACTIVE_UI_PATHS) {
      const full = path.join(WEB, rel)
      expect(existsSync(full), rel).toBe(true)
      const src = readFileSync(full, 'utf8')
      // Allow comments that explicitly say decommissioned; forbid active UI labels.
      const withoutBlockComments = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
      for (const pattern of FORBIDDEN_UI_PATTERNS) {
        expect(withoutBlockComments, `${rel} matches ${pattern}`).not.toMatch(pattern)
      }
    }
  })

  it('forbids active fetch/URL targets to treasury.melega.ai in runtime source', () => {
    const roots = [
      path.join(WEB, 'src/lib/treasury-handoff'),
      path.join(WEB, 'src/pages/api/treasury'),
      path.join(WEB, 'src/views/SmartSwapStudio'),
      path.join(WEB, 'src/views/Swap'),
      path.join(WEB, 'src/views/Trade'),
    ]
    const files = roots.flatMap((r) => walkFiles(r))
    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      // Allow mentions in comments / decommission machine codes; forbid live URL literals used as endpoints.
      if (/['"`]https?:\/\/treasury\.melega\.ai/.test(src)) {
        offenders.push(path.relative(WEB, file))
      }
    }
    expect(offenders).toEqual([])
  })

  it('Smart Swap readiness does not require Treasury Runtime', () => {
    expect(isTreasuryRuntimeConfigured()).toBe(false)
    const collector = resolveTreasuryCollector(56)
    expect(collector.collectorAddress?.toLowerCase()).toBe(MELEGA_TREASURY_WALLET_ADDRESS.toLowerCase())
    expect(collector.resolution.source).toBe('dex-economic-authority')
  })

  it('fee transparency renders canonical beneficiary and no TR/KERL claims', () => {
    const model = buildSmartSwapFeeTransparency({
      treasuryStatus: 'available',
      forceShowDestinationOnly: true,
      feeCollectionProven: false,
    })
    const blob = JSON.stringify(model)
    expect(blob).not.toContain('Treasury Runtime')
    expect(blob).not.toContain('Allocated through')
    expect(blob).not.toContain('KERL')
    expect(model.treasuryDestination).toContain(MELEGA_TREASURY_WALLET_ADDRESS)
    expect(model.flowSteps.some((s) => s.label === 'Fee destination')).toBe(true)
    expect(model.flowSteps.some((s) => s.label === 'Execution')).toBe(true)
  })

  it('no fallback beneficiary differs from canonical wallet on mainnet', () => {
    const collector = resolveTreasuryCollector(56)
    expect(collector.collectorAddress?.toLowerCase()).toBe(MELEGA_TREASURY_WALLET_ADDRESS.toLowerCase())
  })

  it('Top Movers anchors remain present (ranking model unmodified)', () => {
    for (const rel of TOP_MOVERS_ANCHORS) {
      expect(existsSync(path.join(WEB, rel)), rel).toBe(true)
    }
    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/DexHomeScreen.tsx'), 'utf8')
    expect(home).toContain('Top Movers')
    // Home shell may change for swap UX missions; ranking model must stay untouched.
    const status = execSync(
      'git status --porcelain -- apps/web/src/views/HomeTrade/useDexTrendingRankings.ts',
      { cwd: REPO },
    ).toString()
    expect(status.trim()).toBe('')
  })
})
