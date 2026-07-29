/**
 * Wave 04 Continuation — Passport rebuilt; keep mockup archive + terminology locks.
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

describe('PASSPORT Wave 04 Continuation', () => {
  it('archives Founder mockup with recorded SHA-256', () => {
    const meta = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/passport-architecture-000/mockup-integrity.json'), 'utf8'),
    )
    const mockupPath = path.join(REPO, meta.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(meta.sha256)

    const tokens = loadStudio('passportTokens.ts')
    expect(tokens).toContain(meta.sha256)
    expect(tokens).toContain("productName: 'MARCO Passport'")
  })

  it('enforces canonical terminology and removes Command Center', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('MARCO Passport')
    expect(screen).not.toContain('Melega Passport')
    expect(screen).not.toContain('Passport Wallet')
    expect(screen).toContain('data-passport-architecture="wave-04-continuation"')
    expect(screen).toContain('data-passport-command-center="removed"')
    expect(screen).not.toContain('CommandCenterScreen')
    expect(screen).toContain('passport-identity-card')
  })

  it('keeps /passport route on PassportScreen', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/passport/index.tsx'), 'utf8')
    expect(page).toContain('views/Passport/PassportScreen')
  })
})
