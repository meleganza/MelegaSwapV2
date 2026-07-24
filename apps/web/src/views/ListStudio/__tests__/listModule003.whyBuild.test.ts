/**
 * LIST_MODULE_003 — Why build on Melega guards.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST_MODULE_003 Why Build', () => {
  it('locks why-rail geometry without changing hero/card locks', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("cardsRowH: '272px'")
    expect(tokens).toContain("cardW: '256px'")
    expect(tokens).toContain("whyH: '112px'")
    expect(tokens).toContain("whyTop: '24px'")
    expect(tokens).toContain("whyIntroW: '220px'")
    expect(tokens).toContain("whyBenefitW: '265px'")
    expect(tokens).toContain("whyInnerW: '1344px'")
    expect(tokens).toContain("whyInnerH: '80px'")
    expect(tokens).toContain("whyIconTile: '44px'")
    expect(tokens).toContain("whyMobileBenefitH: '64px'")
    expect(tokens).toContain("whyMobileGap: '10px'")
  })

  it('keeps ListPageHero and ListActionCards byte-identical to Module 002 tip', () => {
    const heroDiff = execSync('git diff 50538dd6 -- apps/web/src/views/ListStudio/ListPageHero.tsx', {
      cwd: path.resolve(WEB, '../..'),
      encoding: 'utf8',
    })
    const cardsDiff = execSync('git diff 50538dd6 -- apps/web/src/views/ListStudio/ListActionCards.tsx', {
      cwd: path.resolve(WEB, '../..'),
      encoding: 'utf8',
    })
    const intentDiff = execSync('git diff 50538dd6 -- apps/web/src/views/ListStudio/useListIntent.ts', {
      cwd: path.resolve(WEB, '../..'),
      encoding: 'utf8',
    })
    expect(heroDiff).toBe('')
    expect(cardsDiff).toBe('')
    expect(intentDiff).toBe('')
  })

  it('implements exact benefit copy without unsupported claims', () => {
    const why = load('ListWhyBuildRail.tsx')
    expect(why).toContain('Why build on Melega?')
    expect(why).toContain('Full Ecosystem Access')
    expect(why).toContain('Liquidity, Farms, Pools, SmartDrop, Radar and more.')
    expect(why).toContain('AI-Powered Guidance')
    expect(why).toContain('Smart assistance helps prepare and improve your project information.')
    expect(why).toContain('Verified & Secure')
    expect(why).toContain('Built-in tools support verification, ownership checks and safer publishing.')
    expect(why).toContain('Community Driven')
    expect(why).toContain('Gain visibility and connect with the wider Melega builder community.')
    expect(why).not.toMatch(/guaranteed|automatically verified|AI verifies ownership|publishes without/i)
    expect(why).not.toMatch(/onClick|href=|router\.push/)
    expect(why).not.toContain('<button')
    expect(why).not.toContain('styled.a')
  })

  it('uses semantic section / heading / list structure', () => {
    const why = load('ListWhyBuildRail.tsx')
    expect(why).toContain('styled.section')
    expect(why).toContain('styled.h2')
    expect(why).toContain('styled.ul')
    expect(why).toContain('styled.li')
    expect(why).toContain('aria-labelledby')
    expect(why).toContain('aria-hidden')
  })

  it('mounts Why rail beneath action cards via page composition', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListPageHero')
    expect(screen).toContain('ListActionCards')
    expect(screen).toContain('ListWhyBuildRail')
    expect(screen.indexOf('ListActionCards')).toBeLessThan(screen.indexOf('ListWhyBuildRail'))
    expect(screen).toContain("order: 3")
    expect(screen).toContain('list-why-build')
  })
})
