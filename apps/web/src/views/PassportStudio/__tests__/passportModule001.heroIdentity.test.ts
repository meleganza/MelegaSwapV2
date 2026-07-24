/**
 * PASSPORT_MODULE_001 — Hero + Identity Card guards and state matrix.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import {
  buildPassportHeroIdentityViewModel,
  fixturePassportIdentity,
} from '../buildPassportHeroIdentityViewModel'
import { VERIFICATION_LABELS } from '../passportHeroIdentityTypes'
import { PASSPORT_MOCKUP, passportOne, PASSPORT_FORBIDDEN_LABELS } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('PASSPORT_MODULE_001 Hero Identity', () => {
  it('preserves Founder mockup byte integrity', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(PASSPORT_MOCKUP.sha256)
    expect(bytes.length).toBe(PASSPORT_MOCKUP.bytes)
  })

  it('locks Module 001 desktop geometry tokens', () => {
    expect(passportOne.heroW).toBe('1376px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.heroLeftW).toBe('616px')
    expect(passportOne.heroGap).toBe('40px')
    expect(passportOne.heroRightW).toBe('664px')
    expect(passportOne.identityCardW).toBe('640px')
    expect(passportOne.identityCardH).toBe('304px')
    expect(passportOne.heroPrimaryCtaW).toBe('186px')
    expect(passportOne.heroSecondaryCtaW).toBe('124px')
    expect(passportOne.heroCtaH).toBe('44px')
    expect(passportOne.heroModulePad).toBe('28px')
    expect(passportOne.topAfterTrending).toBe('24px')
  })

  it('guest state (A)', () => {
    const vm = buildPassportHeroIdentityViewModel({ address: null })
    expect(vm.displayName).toBe('Guest')
    expect(vm.handleDisplay).toContain('MARCO Passport')
    expect(vm.verificationState).toBe('unavailable')
    expect(vm.verificationLabel).toBe(VERIFICATION_LABELS.unavailable)
    expect(vm.memberSince).toBe('—')
    expect(vm.accountType).toBe('Guest')
    expect(vm.connectedWalletCount).toBe(0)
    expect(vm.passportExists).toBe(false)
    expect(vm.verificationState).not.toBe('verified')
  })

  it('wallet-only state (B)', () => {
    const addr = '0x8f1234567890abcdef1234567890abcdef7a3B'
    const vm = buildPassportHeroIdentityViewModel({ address: addr })
    expect(vm.walletConnected).toBe(true)
    expect(vm.passportExists).toBe(false)
    expect(vm.displayName).toMatch(/^0x8f12/)
    expect(vm.handleDisplay).toBe('No MARCO Passport yet')
    expect(vm.verificationState).toBe('not_verified')
    expect(vm.accountType).toBe('Guest')
    expect(vm.connectedWalletCount).toBe(1)
    expect(vm.primaryIdentityAction).toBeNull()
  })

  it('unverified Passport fixture (C)', () => {
    const vm = fixturePassportIdentity({
      passportExists: true,
      displayName: 'Alex Rivera',
      handle: '@alex',
      handleDisplay: '@alex',
      verificationState: 'not_verified',
      accountType: 'Individual',
      memberSince: 'Jan 2025',
      connectedWalletCount: 1,
      walletConnected: true,
    })
    expect(vm.verificationState).toBe('not_verified')
    expect(vm.verificationLabel).toBe('NOT VERIFIED')
    expect(vm.displayName).toBe('Alex Rivera')
  })

  it('pending verification fixture (D)', () => {
    const vm = fixturePassportIdentity({
      passportExists: true,
      displayName: 'Pending User',
      verificationState: 'pending',
      accountType: 'Individual',
      walletConnected: true,
    })
    expect(vm.verificationLabel).toBe('PENDING')
  })

  it('verified Passport fixture (E) — never default in production builder', () => {
    const live = buildPassportHeroIdentityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(live.verificationState).not.toBe('verified')

    const vm = fixturePassportIdentity({
      passportExists: true,
      displayName: 'Verified User',
      verificationState: 'verified',
      accountType: 'Individual',
      walletConnected: true,
      managementRoute: '/passport',
      primaryIdentityAction: { label: 'Manage Passport', href: '/passport', kind: 'manage' },
    })
    expect(vm.verificationLabel).toBe('ID VERIFIED')
  })

  it('unavailable source state (F)', () => {
    const vm = buildPassportHeroIdentityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      sourceUnavailable: true,
    })
    expect(vm.sourceAvailable).toBe(false)
    expect(vm.verificationState).toBe('unavailable')
    expect(vm.accountType).toBe('Unavailable')
    expect(vm.handleDisplay).toContain('unavailable')
  })

  it('long display name and missing handle', () => {
    const vm = fixturePassportIdentity({
      passportExists: true,
      displayName: 'Supercalifragilisticexpialidocious Identity Name',
      handle: null,
      handleDisplay: 'Handle unavailable',
      verificationState: 'not_verified',
      walletConnected: true,
    })
    expect(vm.displayName.length).toBeGreaterThan(30)
    expect(vm.handle).toBeNull()
  })

  it('zero and multiple wallets', () => {
    const zero = buildPassportHeroIdentityViewModel({ address: null })
    expect(zero.connectedWalletsLabel).toBe('0 wallets')
    const multi = fixturePassportIdentity({
      walletConnected: true,
      connectedWalletCount: 3,
      connectedWalletsLabel: '3 wallets',
      verificationState: 'not_verified',
    })
    expect(multi.connectedWalletsLabel).toBe('3 wallets')
  })

  it('individual, business, organization account fixtures', () => {
    for (const accountType of ['Individual', 'Business', 'Organization'] as const) {
      const vm = fixturePassportIdentity({
        passportExists: true,
        accountType,
        verificationState: 'not_verified',
        walletConnected: true,
        displayName: accountType,
      })
      expect(vm.accountType).toBe(accountType)
    }
  })

  it('canonical terminology and no forbidden labels in Module 001 UI', () => {
    const files = [
      'PassportHeroIdentityModule.tsx',
      'PassportHeroCopy.tsx',
      'PassportIdentityCard.tsx',
      'PassportScreen.tsx',
    ]
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    const blob = `${files
      .filter((f) => f !== 'PassportScreen.tsx')
      .map((f) => load(f))
      .join('\n')}\n${screen}`
    expect(blob).toContain('MARCO Passport')
    expect(blob).toContain('MARCO PASSPORT')
    expect(blob).toContain('Your identity.')
    expect(blob).toContain('Your ecosystem.')
    expect(blob).toContain('Explore the Ecosystem')
    expect(blob).toContain('Learn More')
    expect(blob).toContain('M-Credits')
    for (const bad of PASSPORT_FORBIDDEN_LABELS) {
      expect(blob).not.toContain(bad)
    }
    expect(blob).not.toContain('melega.eth')
    const heroOwned = [
      'PassportHeroIdentityModule.tsx',
      'PassportHeroCopy.tsx',
      'PassportIdentityCard.tsx',
      'PassportHeroBackground.tsx',
      'PassportVerificationBadge.tsx',
    ]
      .map((f) => load(f))
      .join('\n')
    expect(heroOwned).not.toContain('ConnectWalletButton')
    expect(heroOwned).not.toContain('Connect Wallet')
    // Production path never defaults verification to verified
    expect(buildPassportHeroIdentityViewModel({ address: null }).verificationState).not.toBe('verified')
    expect(
      buildPassportHeroIdentityViewModel({
        address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      }).verificationState,
    ).not.toBe('verified')
  })

  it('Hero does not embed Connect Wallet; route still uses PassportScreen', () => {
    const hero = load('PassportHeroCopy.tsx')
    expect(hero).not.toContain('ConnectWallet')
    expect(hero).not.toContain('Connect Wallet')
    const page = readFileSync(path.join(WEB, 'src/pages/passport/index.tsx'), 'utf8')
    expect(page).toContain('views/Passport/PassportScreen')
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportHeroIdentityModule')
    expect(screen).toContain('CommandCenterScreen')
    expect(screen).toContain('passport-guest-bridge')
  })

  it('does not mount Modules 007–009 implementations (002–006 may exist after certification)', () => {
    const studioFiles = readdirSync(ROOT)
    expect(studioFiles.some((f) => /PassportSecurity/.test(f))).toBe(false)
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).not.toContain('PassportArchitectureShell')
  })

  it('zero production mock identity / mockup money values', () => {
    const studio = readdirSync(ROOT)
      .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
      .map((f) => load(f))
      .join('\n')
    expect(studio).not.toContain('28450')
    expect(studio).not.toContain('28,450')
    expect(studio).not.toContain('melega.eth')
    expect(studio).not.toContain('MEMBER SINCE JAN 2024')
    // Production builder must never emit verified
    const prod = buildPassportHeroIdentityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(prod.verificationState).not.toBe('verified')
    expect(prod.displayName).not.toBe('MARCO')
  })

  it('does not edit Header or Trending Bar sources', () => {
    // Structural guard: Module 001 files do not import SafeTrendingRibbon / MelegaGlobalHeader for duplication
    const moduleFiles = [
      'PassportHeroIdentityModule.tsx',
      'PassportHeroCopy.tsx',
      'PassportIdentityCard.tsx',
      'PassportHeroBackground.tsx',
    ]
    const blob = moduleFiles.map((f) => load(f)).join('\n')
    expect(blob).not.toContain('SafeTrendingRibbon')
    expect(blob).not.toContain('MelegaGlobalHeader')
    expect(blob).not.toContain('GlobalTrendingBar')
  })
})
