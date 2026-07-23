/**
 * LIST_MODULE_005 — unified workspace guards + frozen module integrity.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(__dirname, '../../../../../../')
const BASE = 'f879c6c8'

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function gitDiff(relFromRepo: string) {
  return execSync(`git diff ${BASE} -- ${relFromRepo}`, { cwd: REPO, encoding: 'utf8' })
}

describe('LIST_MODULE_005 Workspace', () => {
  it('locks workspace geometry without changing earlier locks', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("cardsRowH: '272px'")
    expect(tokens).toContain("whyH: '112px'")
    expect(tokens).toContain("howH: '176px'")
    expect(tokens).toContain("workspaceH: '920px'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain("workspaceHeaderH: '64px'")
    expect(tokens).toContain("workspaceBodyH: '760px'")
    expect(tokens).toContain("workspaceFooterH: '72px'")
    expect(tokens).toContain("workspaceBg: '#101010'")
    expect(tokens).toContain("workspaceTop: '24px'")
  })

  it('keeps Modules 001–004 source files byte-identical to tip f879c6c8', () => {
    expect(gitDiff('apps/web/src/views/ListStudio/ListPageHero.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListActionCards.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/useListIntent.ts')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListWhyBuildRail.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListHowItWorks.tsx')).toBe('')
  })

  it('implements all five intent bodies without modals or routes', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('Import Token')
    expect(ws).toContain('Contract Address')
    expect(ws).toContain('Auto Detection')
    expect(ws).toContain('Project Preview')
    expect(ws).toContain('Token Name')
    expect(ws).toContain('Ticker')
    expect(ws).toContain('Supply')
    expect(ws).toContain('Decimals')
    expect(ws).toContain('Logo')
    expect(ws).toContain('Claim Project')
    expect(ws).toContain('Verification')
    expect(ws).toContain('Project Name')
    expect(ws).toContain('Category')
    expect(ws).toContain('Website')
    expect(ws).toContain('optional — never mandatory')
    expect(ws).toContain('Generate Description')
    // MODULE_007 replaces chat actions with product-copilot suggestions
    expect(ws).toContain('ListAiCopilot')
    expect(ws).toContain('Continue')
    expect(ws).toContain('Cancel')
    // MODULE_006 footer is Cancel + Continue/Publish only (no Back)
    expect(ws).toContain('Publish')
    expect(ws).not.toContain('createPortal')
    expect(ws).not.toContain('Modal')
    expect(ws).not.toContain('Drawer')
    expect(ws).not.toMatch(/pathname:\s*'\/(?!list)/)
  })

  it('mounts workspace beneath How It Works and retires placeholder visually', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('<ListHowItWorks')
    expect(screen).toContain('<ListWorkspace')
    expect(screen.indexOf('<ListHowItWorks')).toBeLessThan(screen.indexOf('<ListWorkspace'))
    expect(screen).toContain("order: 5")
    expect(screen).toContain('list-workspace')
    expect(screen).toContain("display: none !important")
    expect(screen).toContain('list-intent-placeholder')
  })

  it('keeps create-token honest about Coming Soon', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('LIST_CREATE_TOKEN_AVAILABLE')
    expect(ws).toContain('Coming Soon')
  })
})
