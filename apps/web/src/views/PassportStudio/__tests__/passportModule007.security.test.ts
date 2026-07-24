/**
 * PASSPORT_MODULE_007 — Security guards + Modules 001–006 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { buildPassportSecurityViewModel } from '../buildPassportSecurityViewModel'
import type { PassportSecurityRow } from '../passportSecurityTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('PASSPORT_MODULE_007 Security', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001–006 implementation files', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001_002_003_004_005_006.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 007 geometry without altering 001–006 sizes', () => {
    expect(passportOne.securityW).toBe('680px')
    expect(passportOne.securityH).toBe('360px')
    expect(passportOne.securityRowH).toBe('52px')
    expect(passportOne.securityRowGap).toBe('8px')
    expect(passportOne.activityH).toBe('360px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.liquidityMinH).toBe('232px')
  })

  it('disconnected state has no fabricated rows', () => {
    const vm = buildPassportSecurityViewModel({ forceDisconnected: true })
    expect(vm.state).toBe('disconnected')
    expect(vm.rows).toHaveLength(0)
  })

  it('connected production shows five independent rows without inventing Verified', () => {
    const vm = buildPassportSecurityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      verificationState: 'not_verified',
      connectorName: 'MetaMask',
    })
    expect(vm.state).toBe('ready')
    expect(vm.rows).toHaveLength(5)
    expect(vm.rows.map((r) => r.id)).toEqual([
      'identity',
      'wallets',
      'sessions',
      'recovery',
      'alerts',
    ])
    expect(vm.rows[0].badge).not.toBe('Verified')
    expect(vm.rows[1].description).toMatch(/Primary 0x8f12/)
    expect(vm.rows[1].description).not.toMatch(/0x8f1234567890abcdef1234567890abcdef7a3B/)
    expect(vm.rows[2].badge).toBe('Unavailable')
    expect(vm.rows[3].badge).toBe('Unavailable')
    expect(vm.rows[4].badge).toBe('Unavailable')
  })

  it('supports verification fixture states without defaulting to Verified in production', () => {
    const pending = buildPassportSecurityViewModel({
      address: '0xabc',
      verificationState: 'pending',
    })
    expect(pending.rows[0].badge).toBe('Pending')
    const live = buildPassportSecurityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(live.rows[0].badge).toBe('Not Configured')
  })

  it('partial source failure keeps other rows', () => {
    const vm = buildPassportSecurityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      verificationState: 'unavailable',
    })
    expect(vm.rows[0].badge).toBe('Unavailable')
    expect(vm.rows[1].sourceAvailable).toBe(true)
    expect(vm.rows[1].badge).toBe('Healthy')
  })

  it('fixture verified / review / recovery rows remain test-only', () => {
    const rows: PassportSecurityRow[] = [
      {
        id: 'identity',
        title: 'Identity Verification',
        description: 'Verified',
        iconMark: 'ID',
        badge: 'Verified',
        badgeTone: 'positive',
        actionLabel: null,
        actionHref: null,
        actionAriaLabel: null,
        sourceAvailable: true,
      },
      {
        id: 'wallets',
        title: 'Connected Wallets',
        description: '2 trusted wallets',
        iconMark: 'WL',
        badge: 'Healthy',
        badgeTone: 'positive',
        actionLabel: null,
        actionHref: null,
        actionAriaLabel: null,
        sourceAvailable: true,
      },
      {
        id: 'sessions',
        title: 'Active Sessions',
        description: '2 Active Sessions',
        iconMark: 'SS',
        badge: 'Healthy',
        badgeTone: 'positive',
        actionLabel: null,
        actionHref: null,
        actionAriaLabel: null,
        sourceAvailable: true,
      },
      {
        id: 'recovery',
        title: 'Recovery Methods',
        description: 'Recovery configured',
        iconMark: 'RC',
        badge: 'Configured',
        badgeTone: 'positive',
        actionLabel: null,
        actionHref: null,
        actionAriaLabel: null,
        sourceAvailable: true,
      },
      {
        id: 'alerts',
        title: 'Security Alerts',
        description: 'Review required',
        iconMark: 'AL',
        badge: 'Review',
        badgeTone: 'attention',
        actionLabel: 'Review',
        actionHref: '/passport',
        actionAriaLabel: 'Review security alerts',
        sourceAvailable: true,
      },
    ]
    const fx = buildPassportSecurityViewModel({ fixtureRows: rows })
    expect(fx.rows[0].badge).toBe('Verified')
    const prod = buildPassportSecurityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(prod.rows[0].badge).not.toBe('Verified')
    expect(prod.rows[3].badge).toBe('Unavailable')
  })

  it('mounts Module 007 in bottom grid', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportBottomGrid')
    expect(screen).toContain('data-passport-module-007')
    const grid = load('PassportBottomGrid.tsx')
    expect(grid).toContain('PassportSecurity')
    expect(grid).not.toContain('passport-security-reserve')
  })

  it('zero production mock security scores', () => {
    const blob = ['PassportSecurity.tsx', 'buildPassportSecurityViewModel.ts'].map(load).join('\n')
    expect(blob).not.toContain('security score')
    expect(blob).not.toContain('Risk Score')
    expect(blob).not.toContain('98/100')
  })
})
