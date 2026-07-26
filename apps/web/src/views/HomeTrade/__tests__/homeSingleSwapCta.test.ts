import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Home single Swap CTA', () => {
  const src = readFileSync(join(__dirname, '../DexHomeScreen.tsx'), 'utf8')

  it('exposes one primary Swap CTA', () => {
    expect(src).toMatch(/data-testid="dex-home-start-trading"/)
    expect(src).toMatch(/>\s*Swap\s*</)
  })

  it('does not render Instant Swap / Smart Swap hero buttons', () => {
    expect(src).not.toMatch(/Instant Swap/)
    expect(src).not.toMatch(/Smart Swap/)
  })

  it('scrolls and focuses the on-page terminal', () => {
    expect(src).toMatch(/scrollIntoView/)
    expect(src).toMatch(/\.focus\(/)
  })
})
