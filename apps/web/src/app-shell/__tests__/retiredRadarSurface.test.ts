import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { GLOBAL_HEADER_NAV, MORE_DROPDOWN_ITEMS } from '../config/globalHeaderNav'
import { shellNavigation } from '../config/navigation'

const WEB_ROOT = path.resolve(__dirname, '../..')

describe('retired Radar public surface', () => {
  it('removes public /radar from shell and header navigation', () => {
    const hrefs = shellNavigation.flatMap((section) => section.items.map((item) => item.href))
    expect(hrefs).not.toContain('/radar')
    expect(GLOBAL_HEADER_NAV.some((item) => item.id === 'radar')).toBe(false)
    expect(MORE_DROPDOWN_ITEMS.some((item) => item.href === '/radar' || item.label === 'DEX Intelligence')).toBe(false)
  })

  it('does not redirect retired aliases to /radar', () => {
    const cfg = readFileSync(path.join(WEB_ROOT, '../next.config.mjs'), 'utf8')
    expect(cfg).not.toMatch(/destination:\s*'\/radar'/)
    expect(cfg).not.toMatch(/source:\s*'\/dex-intelligence/)
    expect(cfg).not.toMatch(/source:\s*'\/info'/)
    expect(cfg).not.toMatch(/source:\s*'\/info\//)
  })

  it('deletes the public radar page and dead /info stubs', () => {
    expect(existsSync(path.join(WEB_ROOT, 'pages/radar/index.tsx'))).toBe(false)
    expect(existsSync(path.join(WEB_ROOT, 'pages/info/index.tsx'))).toBe(false)
    expect(existsSync(path.join(WEB_ROOT, 'views/RadarStudio/RadarStudioScreen.tsx'))).toBe(false)
    expect(existsSync(path.join(WEB_ROOT, 'views/RadarStudio/radarRuntime/buildDexTokenIndex.ts'))).toBe(true)
    expect(existsSync(path.join(WEB_ROOT, 'views/Info/index.tsx'))).toBe(true)
  })
})
