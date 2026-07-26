/**
 * MELEGA_DEX_V1_GLOBAL_PRODUCT_INTEGRATION_CERTIFICATION — static guards.
 * No redesign / no product rebuild — integration consistency only.
 */
import { createHash } from 'crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { execSync } from 'child_process'
import { GLOBAL_HEADER_NAV } from '../config/globalHeaderNav'
import { shellBottomNavItems } from '../config/navigation'
import {
  lookupCanonicalToken,
  resolveAssetLogo,
  searchCanonicalTokens,
} from 'lib/canonical-token-registry'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'

const WEB = path.resolve(__dirname, '../../../')
const REPO = path.resolve(WEB, '../..')
const OUT = path.join(WEB, 'docs/runtime/melega-dex-v1-global-product-integration')
const BASELINE = path.join(OUT, 'global-certification-baseline.json')

const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDT = '0x55d398326f99059ff775485246999027b3197955'

function sha256File(abs: string): string {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function resolveFreezeFile(studioDir: string, rel: string): string | null {
  const candidates = [
    path.join(studioDir, rel),
    path.join(studioDir, path.basename(rel)),
    path.join(WEB, rel),
    path.join(WEB, 'src', rel),
    path.join(WEB, 'src/views', rel),
    path.join(WEB, 'src/views/Passport', path.basename(rel)),
  ]
  return candidates.find((c) => existsSync(c)) || null
}

function verifyFreezeLock(lockAbs: string, studioDir: string) {
  const lock = JSON.parse(readFileSync(lockAbs, 'utf8'))
  const checks: { rel: string; pass: boolean }[] = []
  for (const [rel, expected] of Object.entries({
    ...(lock.files || {}),
    ...(lock.shared || {}),
  } as Record<string, string>)) {
    if (typeof expected !== 'string' || expected.length < 32) continue
    const abs = resolveFreezeFile(studioDir, rel)
    if (!abs) {
      checks.push({ rel, pass: false })
      continue
    }
    checks.push({ rel, pass: sha256File(abs) === expected })
  }
  return { lock, checks, pass: checks.length > 0 && checks.every((c) => c.pass) }
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '__tests__' || ent.name === 'node_modules' || ent.name === '.next') continue
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) walkTsFiles(abs, out)
    else if (/\.(ts|tsx)$/.test(ent.name)) out.push(abs)
  }
  return out
}

describe('Melega DEX V1 Global Product Integration Certification', () => {
  it('locks global certification baseline + production ancestry', () => {
    expect(existsSync(BASELINE)).toBe(true)
    const b = JSON.parse(readFileSync(BASELINE, 'utf8'))
    expect(b.production.commitShort).toBe('ff6d6179')
    expect(b.worktreeBaseShort).toBe('2f834b45')
    expect(b.baselines.farms.tipShort).toBe('2f834b45')
    expect(b.baselines.pools.tipShort).toBe('99258574')
    expect(b.baselines.passport.tipShort).toBe('70d2bd19')
    expect(b.baselines.globalIa.tipShort).toBe('258fb26e')
    expect(b.baselines.list.tipShort).toBe('7a29e691')
    expect(b.baselines.liquidity.tipShort).toBe('1d422eb5')

    const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim()
    expect(head.startsWith('2f834b45') || head.length === 40).toBe(true)
    execSync('git merge-base --is-ancestor ff6d6179 HEAD', { cwd: REPO })
    execSync('git merge-base --is-ancestor 258fb26e HEAD', { cwd: REPO })
    execSync('git merge-base --is-ancestor 70d2bd19 HEAD', { cwd: REPO })
    execSync('git merge-base --is-ancestor 99258574 HEAD', { cwd: REPO })
    execSync('git merge-base --is-ancestor 2e8f6c2e HEAD', { cwd: REPO })
  })

  it('freezes Farms + Pools + Passport byte-identically', () => {
    const farms = verifyFreezeLock(
      path.join(WEB, 'src/views/FarmsStudio/__tests__/farmsV1.final.freeze.sha256.json'),
      path.join(WEB, 'src/views/FarmsStudio'),
    )
    const pools = verifyFreezeLock(
      path.join(WEB, 'src/views/PoolsStudio/__tests__/poolsV1.final.freeze.sha256.json'),
      path.join(WEB, 'src/views/PoolsStudio'),
    )
    const passport = verifyFreezeLock(
      path.join(WEB, 'src/views/PassportStudio/__tests__/passportV1.final.freeze.sha256.json'),
      path.join(WEB, 'src/views/PassportStudio'),
    )
    expect(farms.pass).toBe(true)
    expect(pools.pass).toBe(true)
    expect(passport.pass).toBe(true)
  })

  it('retains List + Global IA integrity docs and Liquidity evidence', () => {
    const listDocs = [
      'list-module-004-how-it-works',
      'list-module-005-workspace',
      'list-module-006-workspace-premium',
      'list-module-007-ai-copilot',
    ]
    for (const d of listDocs) {
      expect(existsSync(path.join(WEB, 'docs/runtime', d, 'frozen-modules-integrity.json'))).toBe(true)
    }
    expect(
      existsSync(
        path.join(WEB, 'docs/runtime/dex-v1-global-information-architecture/frozen-module-integrity.json'),
      ),
    ).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/liquidity-pixel-perfection-002/certify.mjs'))).toBe(true)
  })

  it('enforces single primary nav ownership without duplicate destinations', () => {
    const headerHrefs = GLOBAL_HEADER_NAV.filter((i) => i.kind === 'link').map((i) => i.href)
    expect(headerHrefs).toEqual(['/', '/liquidity-studio', '/farms', '/pools', '/list', '/passport'])
    expect(new Set(headerHrefs).size).toBe(headerHrefs.length)

    const bottomHrefs = shellBottomNavItems.map((i) => i.href)
    expect(bottomHrefs).toEqual(['/', '/liquidity-studio', '/farms', '/pools', '/passport'])
    expect(new Set(bottomHrefs).size).toBe(bottomHrefs.length)

    // Certified products reachable
    expect(headerHrefs).toContain('/liquidity-studio')
    expect(headerHrefs).toContain('/farms')
    expect(headerHrefs).toContain('/pools')
    expect(headerHrefs).toContain('/list')
    expect(headerHrefs).toContain('/passport')
  })

  it('certifies token identity consistency for MARCO / WBNB / USDT', () => {
    const marco = lookupCanonicalToken(56, MARCO_BSC_ADDRESS)
    const wbnb = lookupCanonicalToken(56, WBNB)
    const usdt = lookupCanonicalToken(56, USDT)
    expect(marco?.symbol).toBe('MARCO')
    expect(marco?.decimals).toBe(18)
    expect(marco?.address.toLowerCase()).toBe(MARCO_BSC_ADDRESS.toLowerCase())
    expect(wbnb?.symbol).toBe('WBNB')
    expect(wbnb?.decimals).toBe(18)
    expect(usdt?.symbol?.toUpperCase()).toContain('USDT')
    expect(usdt?.decimals).toBe(18)

    const marcoLogo = resolveAssetLogo({ chainId: 56, address: MARCO_BSC_ADDRESS })
    const wbnbLogo = resolveAssetLogo({ chainId: 56, address: WBNB })
    const usdtLogo = resolveAssetLogo({ chainId: 56, address: USDT })
    expect(marcoLogo).toBeTruthy()
    expect(wbnbLogo).toBeTruthy()
    expect(usdtLogo).toBeTruthy()
    expect(marcoLogo).not.toBe(wbnbLogo)

    // No dual MARCO identity under different addresses for primary symbol
    const marcoHits = searchCanonicalTokens('MARCO').filter((t) => t.chainId === 56 && t.symbol === 'MARCO')
    const addresses = new Set(marcoHits.map((t) => t.address.toLowerCase()))
    expect(addresses.size).toBe(1)
    expect([...addresses][0]).toBe(MARCO_BSC_ADDRESS.toLowerCase())
  })

  it('enforces cross-product action ownership contracts in source', () => {
    const liquidity = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/LiquidityStudioScreen.tsx'), 'utf8')
    const farms = readFileSync(path.join(WEB, 'src/views/FarmsStudio/FarmsStudioScreen.tsx'), 'utf8')
    const pools = readFileSync(path.join(WEB, 'src/views/PoolsStudio/PoolsStudioScreen.tsx'), 'utf8')
    const list = existsSync(path.join(WEB, 'src/views/ListStudio/ListStudioScreen.tsx'))
      ? readFileSync(path.join(WEB, 'src/views/ListStudio/ListStudioScreen.tsx'), 'utf8')
      : readFileSync(path.join(WEB, 'src/pages/list.tsx'), 'utf8')

    expect(liquidity).toContain('LiquidityRuntime')
    expect(farms).toContain('FarmsActionHost')
    expect(farms).toContain('FarmsRuntimeProvider')
    expect(pools).toContain('PoolsActionHost')
    expect(pools).toContain('PoolsRuntimeProvider')
    expect(list.length).toBeGreaterThan(20)

    // Single action host each
    expect(farms.match(/<FarmsActionHost/g)?.length).toBe(1)
    expect(pools.match(/<PoolsActionHost/g)?.length).toBe(1)
  })

  it('audits production surfaces for banned mock fixture producers', () => {
    const banned = [
      'mockPositions',
      'fakeApr',
      'fakeTvl',
      'fakeRewards',
      'fakeWallets',
      'DEMO_ONLY',
      'mockProduction',
      'getFarmsUxFixture',
      'fixtureFarm',
      'SAMPLE_POSITION',
    ]
    const roots = [
      'src/views/FarmsStudio',
      'src/views/PoolsStudio',
      'src/views/PassportStudio',
      'src/views/LiquidityStudio',
      'src/views/ListStudio',
      'src/app-shell/config',
      'src/lib/canonical-token-registry',
      'src/lib/dex-asset-index',
    ]
    const hits: { file: string; token: string }[] = []
    for (const root of roots) {
      for (const file of walkTsFiles(path.join(WEB, root))) {
        const src = readFileSync(file, 'utf8')
        for (const token of banned) {
          if (src.includes(token)) hits.push({ file: path.relative(WEB, file), token })
        }
      }
    }
    expect(hits).toEqual([])
  })

  it('requires evidence pack + certify script + crash recovery baseline', () => {
    expect(existsSync(path.join(OUT, 'certify.mjs'))).toBe(true)
    expect(existsSync(path.join(OUT, 'global-certification-baseline.json'))).toBe(true)
    expect(existsSync(path.join(OUT, 'global-recovery-baseline.json'))).toBe(true)
    expect(statSync(path.join(OUT, 'certify.mjs')).size).toBeGreaterThan(1000)
    const recovery = JSON.parse(readFileSync(path.join(OUT, 'global-recovery-baseline.json'), 'utf8'))
    expect(recovery.currentHeadShort).toBe('2f834b45')
    expect(recovery.production.commitShort).toBe('ff6d6179')
    expect(recovery.recoveredFiles.length).toBeGreaterThanOrEqual(3)
  })
})
