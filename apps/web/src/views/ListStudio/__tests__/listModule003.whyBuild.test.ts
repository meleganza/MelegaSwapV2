/**
 * LIST Wave 04A — Why build rail (unchanged copy, composition updated).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A Why Build', () => {
  it('keeps why-rail geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("whyH: '112px'")
    expect(tokens).toContain("cardsRowH: '272px'")
  })

  it('implements exact benefit copy without unsupported claims', () => {
    const why = load('ListWhyBuildRail.tsx')
    expect(why).toContain('Why build on Melega?')
    expect(why).toContain('Full Ecosystem Access')
    expect(why).toContain('AI-Powered Guidance')
    expect(why).toContain('Verified & Secure')
    expect(why).toContain('Community Driven')
    expect(why).not.toMatch(/guaranteed|automatically verified|AI verifies ownership|publishes without/i)
  })

  it('mounts Why rail beneath action cards', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen.indexOf('ListActionCards')).toBeLessThan(screen.indexOf('ListWhyBuildRail'))
    expect(screen).toContain('list-why-build')
  })
})
