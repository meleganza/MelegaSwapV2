/**
 * LIST_MODULE_004 — How it works guards + frozen module integrity.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function gitDiff(relFromRepo: string) {
  return execSync(`git diff 10c37d62 -- ${relFromRepo}`, { cwd: REPO, encoding: 'utf8' })
}

describe('LIST_MODULE_004 How It Works', () => {
  it('locks how-it-works geometry without changing earlier locks', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("cardsRowH: '272px'")
    expect(tokens).toContain("whyH: '112px'")
    expect(tokens).toContain("howH: '176px'")
    expect(tokens).toContain("howTop: '24px'")
    expect(tokens).toContain("howTimelineW: '1336px'")
    expect(tokens).toContain("howTimelineH: '108px'")
    expect(tokens).toContain("howStepW: '208px'")
    expect(tokens).toContain("howCircle: '32px'")
    expect(tokens).toContain("howConnectorW: '1088px'")
    expect(tokens).toContain("howMobileCircle: '28px'")
    expect(tokens).toContain("howMobileGap: '8px'")
  })

  it('keeps Modules 001–003 source files byte-identical to tip 10c37d62', () => {
    expect(gitDiff('apps/web/src/views/ListStudio/ListPageHero.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListActionCards.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/useListIntent.ts')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListWhyBuildRail.tsx')).toBe('')
  })

  it('implements exact five-step copy without unsupported claims', () => {
    const how = load('ListHowItWorks.tsx')
    expect(how).toContain('How it works')
    expect(how).toContain('Choose')
    expect(how).toContain('Import, create or claim your token or project.')
    expect(how).toContain('Setup')
    expect(how).toContain('Complete the required information with AI assistance.')
    expect(how).toContain('Review')
    expect(how).toContain('Confirm the details, ownership and publishing choices.')
    expect(how).toContain('Publish')
    expect(how).toContain('Create your Melega identity and ecosystem presence.')
    expect(how).toContain('Grow')
    expect(how).toContain('Build visibility, liquidity and community over time.')
    expect(how).not.toMatch(/guaranteed|automatically verified|AI verifies|activated automatically/i)
    expect(how).not.toContain('onClick')
    expect(how).not.toContain('router.push')
    expect(how).not.toContain('<button')
    expect(how).toContain('pointer-events: none')
  })

  it('uses semantic ordered-list structure', () => {
    const how = load('ListHowItWorks.tsx')
    expect(how).toContain('styled.section')
    expect(how).toContain('styled.h2')
    expect(how).toContain('styled.ol')
    expect(how).toContain('styled.li')
    expect(how).toContain('aria-labelledby')
  })

  it('mounts How It Works beneath Why Build via page composition', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListWhyBuildRail')
    expect(screen).toContain('ListHowItWorks')
    expect(screen.indexOf('ListWhyBuildRail')).toBeLessThan(screen.indexOf('ListHowItWorks'))
    expect(screen).toContain("order: 4")
    expect(screen).toContain('list-how-it-works')
  })
})
