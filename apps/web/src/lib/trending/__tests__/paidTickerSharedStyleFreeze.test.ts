import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

/**
 * Founder-approved Trending chrome from main. Paid delivery may add an isolated
 * pin, but it must not resize the shared bar, launcher, organic type, or pill.
 */
describe('paid ticker shared style freeze', () => {
  it('keeps the approved bar, launcher, pill, rocket, and organic type sizes', () => {
    const launcher = load('app-shell/BoostProjectLauncher.tsx')
    const bar = load('app-shell/GlobalTrendingBar.tsx')
    const ticker = load('design-system/melega/components/Ticker/MelegaTicker.tsx')

    expect(launcher).toContain('width: 30px;')
    expect(launcher).not.toContain('width: 26px;')
    expect(launcher).not.toContain('height: 26px;')

    expect(bar).toContain('padding: 0 16px;')
    expect(bar).not.toContain('padding: 0 8px;')
    expect(bar).toContain('padding-left: 10px;')
    expect(bar).toContain('margin-left: 8px;')
    expect(bar).not.toContain('padding-left: 6px;')
    expect(bar).not.toContain('margin-left: 4px;')

    expect(ticker).toContain('padding-right: 16px;')
    expect(ticker).toContain('padding-right: 24px;')
    expect(ticker).toContain('padding: 7px 15px 7px 10px;')
    expect(ticker).toContain('width="22" height="22"')
    expect(ticker).not.toContain('width="18"')
    expect(ticker).not.toContain('12px !important')
    expect(ticker).not.toContain('font-size: 11px;\n  }\n}\n\nconst Secondary')
    expect(ticker).not.toMatch(/const Primary[\s\S]*?const Secondary[\s\S]*max-width: 767px/)
    expect(ticker).not.toMatch(/const Accent[\s\S]*?const Dot[\s\S]*max-width: 767px/)
    expect(ticker).not.toContain('data-has-paid')
  })
})
