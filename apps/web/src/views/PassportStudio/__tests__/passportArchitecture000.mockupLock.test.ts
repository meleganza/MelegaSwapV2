/**
 * PASSPORT_ARCHITECTURE_000 — mockup lock, terminology, contracts, ownership.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(__dirname, '../../../../../../')
const WEB = path.resolve(__dirname, '../../../../')

function loadStudio(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function loadRepo(rel: string) {
  return readFileSync(path.join(REPO, rel), 'utf8')
}

describe('PASSPORT_ARCHITECTURE_000 Mockup Lock', () => {
  it('archives Founder mockup with recorded SHA-256 and dimensions', () => {
    const meta = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/passport-architecture-000/mockup-integrity.json'), 'utf8'),
    )
    const mockupPath = path.join(REPO, meta.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(meta.sha256)
    expect(bytes.length).toBe(meta.bytes)
    expect(meta.width).toBe(844)
    expect(meta.height).toBe(1024)
    expect(meta.byteIdenticalToSource).toBe(true)

    const tokens = loadStudio('passportTokens.ts')
    expect(tokens).toContain(meta.sha256)
    expect(tokens).toContain("productName: 'MARCO Passport'")
  })

  it('locks desktop geometry contracts and module order', () => {
    const tokens = loadStudio('passportTokens.ts')
    expect(tokens).toContain("contentMax: '1376px'")
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("portfolioH: '176px'")
    expect(tokens).toContain("assetsH: '176px'")
    expect(tokens).toContain("projectsH: '176px'")
    expect(tokens).toContain("liquidityMinH: '232px'")
    expect(tokens).toContain("bottomColW: '680px'")
    expect(tokens).toContain("pageBg: '#050505'")
    expect(tokens).toContain("gold: '#DDB92F'")

    const contracts = loadStudio('passportModuleContracts.ts')
    expect(contracts).toContain('001-hero-identity')
    expect(contracts).toContain('007-security')
    expect(contracts).toContain('widthPx: 1376')

    const order = loadStudio('passportTokens.ts')
    const idx = (id: string) => order.indexOf(id)
    expect(idx('001-hero-identity')).toBeLessThan(idx('002-portfolio'))
    expect(idx('002-portfolio')).toBeLessThan(idx('003-assets'))
    expect(idx('005-liquidity')).toBeLessThan(idx('006-activity'))
    expect(idx('006-activity')).toBeLessThan(idx('007-security'))
  })

  it('enforces canonical terminology and forbids wallet aliases', () => {
    const tokens = loadStudio('passportTokens.ts')
    expect(tokens).toContain('MARCO Passport')
    expect(tokens).toContain('Melega Passport')
    expect(tokens).toContain('Passport Wallet')
    expect(tokens).toContain('PASSPORT_FORBIDDEN_LABELS')

    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('MARCO Passport')
    expect(screen).not.toContain('Melega Passport')
    expect(screen).not.toContain('Passport Wallet')
    expect(screen).toContain('data-passport-architecture="000"')
    expect(screen).toContain('CommandCenterScreen')
  })

  it('keeps /passport route on PassportScreen (no premature shell cutover)', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/passport/index.tsx'), 'utf8')
    expect(page).toContain("views/Passport/PassportScreen")
    expect(page).not.toContain('PassportArchitectureShell')

    const shell = loadStudio('PassportArchitectureShell.tsx')
    expect(shell).toContain('passport-architecture-shell')
    expect(shell).toContain('passport-slot-001')
    expect(shell).toContain('Not wired to /passport')
  })

  it('validates ownership map and product authority boundaries', () => {
    const map = loadRepo('apps/web/docs/runtime/PASSPORT_MODULE_OWNERSHIP_MAP.md')
    expect(map).toContain('MODULE 001')
    expect(map).toContain('MODULE 009')
    expect(map).toContain('Treasury Runtime')
    expect(map).toContain('/list?intent=create-project')
    expect(map).toContain('SafeTrendingRibbon')
    expect(map).toContain('000 → 001 → 002')
    expect(map).toContain('Fake verified badges')
    expect(map).not.toContain('$28,450')
  })

  it('does not introduce mockup production numbers into PassportStudio', () => {
    const studio = `${loadStudio('passportTokens.ts')}\n${loadStudio('PassportArchitectureShell.tsx')}`
    expect(studio).not.toContain('28450')
    expect(studio).not.toContain('28,450')
    expect(studio).not.toContain('2,450')
    expect(studio).not.toContain('12680')
  })
})
