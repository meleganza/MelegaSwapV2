/**
 * LIST_MODULE_006 — premium workspace internals + frozen module integrity.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(__dirname, '../../../../../../')
const BASE = 'c75cd6fb'

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function gitDiff(relFromRepo: string) {
  return execSync(`git diff ${BASE} -- ${relFromRepo}`, { cwd: REPO, encoding: 'utf8' })
}

describe('LIST_MODULE_006 Workspace Premium', () => {
  it('keeps MODULE_005 outer geometry locks unchanged', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: '920px'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain("workspaceHeaderH: '64px'")
    expect(tokens).toContain("workspaceBodyH: '760px'")
    expect(tokens).toContain("workspaceFooterH: '72px'")
    expect(tokens).toContain("workspaceContextW: '340px'")
    expect(tokens).toContain("workspaceProgressDot: '20px'")
    expect(tokens).toContain("workspaceCompleteRing: '72px'")
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("howH: '176px'")
  })

  it('keeps Modules 001–005 composition/frozen sources byte-identical to c75cd6fb', () => {
    expect(gitDiff('apps/web/src/views/ListStudio/ListPageHero.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListActionCards.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/useListIntent.ts')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListWhyBuildRail.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListHowItWorks.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListStudioScreen.tsx')).toBe('')
  })

  it('implements premium chrome without modals or routes', () => {
    const ws = load('ListWorkspace.tsx')
    const ai = load('ListAiCopilot.tsx')
    expect(ws).toContain('list-workspace-progress')
    expect(ws).toContain('list-workspace-status')
    expect(ws).toContain('list-workspace-autosave')
    expect(ws).toContain('list-workspace-right')
    expect(ws).toContain('Detected Token')
    expect(ws).toContain('Live Summary')
    expect(ws).toContain('Ownership checklist')
    expect(ws).toContain('ListAiCopilot')
    expect(ai).toContain('AI Memory')
    expect(ai).toContain('list-workspace-completeness')
    expect(ws).toContain('Autosaved')
    expect(ws).toContain('Publish')
    expect(ws).toContain('Cancel')
    expect(ws).not.toContain('createPortal')
    expect(ws).not.toContain('Modal')
    expect(ws).not.toContain('Drawer')
    expect(ws).toContain('data-pixel-workspace="1376x920"')
  })

  it('uses restrained motion and validation marks', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('workspaceAnimMs')
    expect(ws).toContain('workspaceAnimSlide')
    expect(ws).toContain('prefers-reduced-motion')
    expect(ws).toContain('$invalid')
    expect(ws).toContain('never estimated')
  })
})
