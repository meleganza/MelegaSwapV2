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
    const archived = readFileSync(path.join(WEB, 'src/views/Passport/_archived_wave04_consumer/PassportScreen.tsx'), 'utf8')
    const v1 = readFileSync(path.join(WEB, 'src/views/Passport/v1/PassportV1Shell.tsx'), 'utf8')
    expect(archived).toContain('MARCO Passport')
    expect(v1).toContain('MARCO Passport')
    expect(v1).not.toContain('Melega Passport')
    expect(v1).not.toContain('Passport Wallet')
    expect(v1).toContain('data-passport-command-center="removed"')
    expect(v1).not.toContain('CommandCenterScreen')
    expect(v1).not.toContain('Good morning')
  })

  it('keeps /passport route on Passport V1 zero-rebuild shell', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/passport/index.tsx'), 'utf8')
    expect(page).toContain('views/Passport/v1/PassportV1Shell')
    expect(page).not.toContain('PassportScreen')
  })
})
