/**
 * PASSPORT_MODULE_002 — Portfolio Overview guards + Module 001 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { buildPassportPortfolioOverviewViewModel } from '../buildPassportPortfolioOverviewViewModel'
import { PORTFOLIO_NOT_AVAILABLE, PORTFOLIO_UNAVAILABLE } from '../passportPortfolioOverviewTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('PASSPORT_MODULE_002 Portfolio Overview', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001 component files (byte SHA-256)', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 002 geometry tokens without altering Module 001 hero sizes', () => {
    expect(passportOne.portfolioW).toBe('1376px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.portfolioLeftW).toBe('560px')
    expect(passportOne.portfolioChartW).toBe('320px')
    expect(passportOne.portfolioRightW).toBe('480px')
    expect(passportOne.portfolioKpiW).toBe('160px')
    expect(passportOne.portfolioKpiH).toBe('120px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.heroLeftW).toBe('616px')
    expect(passportOne.heroRightW).toBe('664px')
    expect(passportOne.identityCardW).toBe('640px')
  })

  it('guest and connected states stay honest (no fake totals/charts)', () => {
    const guest = buildPassportPortfolioOverviewViewModel({ address: null })
    expect(guest.totalValueDisplay).toBe(PORTFOLIO_UNAVAILABLE)
    expect(guest.performance.every((p) => p.value === null)).toBe(true)
    expect(guest.chartAvailability).toBe('unavailable')
    expect(guest.kpis).toHaveLength(3)

    const connected = buildPassportPortfolioOverviewViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(connected.totalValueDisplay).toBe(PORTFOLIO_UNAVAILABLE)
    expect(connected.totalAvailability).toBe('unavailable')
    expect(connected.kpis.find((k) => k.id === 'mcredits')?.status).toMatch(/Separate|Not Available/)
    expect(connected.totalDisclosure).toMatch(/M-Credits/)
    expect(connected.totalDisclosure).toMatch(/separate/i)
  })

  it('never invents mockup portfolio money or verified chart series', () => {
    const studio = readdirSync(ROOT)
      .filter((f) => /Portfolio|portfolio/.test(f))
      .map((f) => load(f))
      .join('\n')
    expect(studio).not.toContain('28450')
    expect(studio).not.toContain('28,450')
    expect(studio).not.toContain('9.82')
    expect(studio).not.toContain('sparkline')
    const live = buildPassportPortfolioOverviewViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(live.totalValueDisplay).not.toMatch(/\$/)
    expect(live.kpis.every((k) => k.value === PORTFOLIO_UNAVAILABLE || k.status.includes(PORTFOLIO_NOT_AVAILABLE) || k.status.includes('Separate'))).toBe(true)
  })

  it('does not treat M-Credits as ERC-20 or fold into total', () => {
    const builder = load('buildPassportPortfolioOverviewViewModel.ts')
    expect(builder).toMatch(/M-Credits/)
    expect(builder).toMatch(/separate/i)
    expect(builder).not.toMatch(/ERC-?20/)
    const overview = load('PassportPortfolioOverview.tsx')
    expect(overview).not.toContain('PassportHeroIdentityModule')
  })

  it('mounts Module 002 on PassportScreen without removing Module 001 or Command Center', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportHeroIdentityModule')
    expect(screen).toContain('PassportPortfolioOverview')
    expect(screen).toContain('CommandCenterScreen')
    expect(screen).toContain('data-passport-module-002')
  })

  it('Module 002 remains mounted without ArchitectureShell', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('data-passport-module-002')
    expect(screen).not.toContain('PassportArchitectureShell')
  })

  it('Module 002 UI avoids Connect Wallet and forbidden product names', () => {
    const blob = [
      'PassportPortfolioOverview.tsx',
      'PassportPortfolioSummary.tsx',
      'PassportPortfolioChart.tsx',
      'PassportPortfolioKpiCard.tsx',
      'buildPassportPortfolioOverviewViewModel.ts',
    ]
      .map((f) => load(f))
      .join('\n')
    expect(blob).toContain('Portfolio Overview')
    expect(blob).toContain('Total Portfolio Value')
    expect(blob).toContain('Crypto Assets')
    expect(blob).toContain('M-Credits')
    expect(blob).toContain('Projects')
    expect(blob).not.toContain('Connect Wallet')
    expect(blob).not.toContain('Melega Passport')
    expect(blob).not.toContain('Passport Wallet')
  })
})
