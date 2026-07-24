/**
 * PASSPORT_MODULE_003 — Assets guards + Modules 001–002 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { buildPassportAssetsViewModel } from '../buildPassportAssetsViewModel'
import { ASSETS_UNAVAILABLE } from '../passportAssetsTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('PASSPORT_MODULE_003 Assets', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001 and MODULE 002 implementation files', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001_002.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 003 geometry without altering 001–002 sizes', () => {
    expect(passportOne.assetsW).toBe('1376px')
    expect(passportOne.assetsH).toBe('176px')
    expect(passportOne.assetsCardW).toBe('320px')
    expect(passportOne.assetsCardH).toBe('144px')
    expect(passportOne.assetsCardGap).toBe('16px')
    expect(passportOne.assetsModulePadX).toBe('24px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.portfolioLeftW).toBe('560px')
  })

  it('keeps crypto and M-Credits separate with honest unavailable states', () => {
    const guest = buildPassportAssetsViewModel({ address: null })
    expect(guest.crypto.rows).toHaveLength(0)
    expect(guest.mCredits.balance).toBe(ASSETS_UNAVAILABLE)
    expect(guest.wallets.rows).toHaveLength(0)

    const connected = buildPassportAssetsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      connectorName: 'MetaMask',
      chainName: 'BNB Smart Chain',
    })
    expect(connected.crypto.availability).toBe('unavailable')
    expect(connected.mCredits.status).toMatch(/ERC-20|Separate|service/i)
    expect(connected.wallets.rows).toHaveLength(1)
    expect(connected.wallets.rows[0].primary).toBe(true)
    expect(connected.actions.items.find((a) => a.id === 'send')?.supported).toBe(true)
    expect(connected.actions.items.find((a) => a.id === 'top-up-mcredits')?.supported).toBe(false)
  })

  it('does not invent mockup balances or ERC-20 M-Credits', () => {
    const blob = readdirSync(ROOT)
      .filter((f) => /Assets|assets/.test(f))
      .map((f) => load(f))
      .join('\n')
    expect(blob).not.toContain('28450')
    expect(blob).not.toContain('2,450')
    expect(blob).toContain('not an ERC-20')
    expect(blob).toContain('Crypto Assets')
    expect(blob).toContain('M-Credits')
    expect(blob).toContain('Linked Wallets')
    expect(blob).toContain('Quick Actions')
  })

  it('mounts Module 003 on PassportScreen with 001–002 preserved', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportHeroIdentityModule')
    expect(screen).toContain('PassportPortfolioOverview')
    expect(screen).toContain('PassportAssets')
    expect(screen).toContain('CommandCenterScreen')
    expect(screen).toContain('data-passport-module-003')
  })

  it('Module 003 remains mounted without ArchitectureShell', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('data-passport-module-003')
    expect(screen).not.toContain('PassportArchitectureShell')
  })
})
