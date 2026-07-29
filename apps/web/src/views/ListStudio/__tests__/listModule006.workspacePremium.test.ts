/**
 * LIST Wave 04A — premium workspace internals.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A Workspace Premium', () => {
  it('keeps workspace geometry locks', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: '920px'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain("workspaceHeaderH: '64px'")
    expect(tokens).toContain("workspaceBodyH: '760px'")
    expect(tokens).toContain("workspaceFooterH: '72px'")
    expect(tokens).toContain("workspaceCompleteRing: '72px'")
  })

  it('implements premium chrome without modals or routes', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('list-workspace-progress')
    expect(ws).toContain('list-workspace-status')
    expect(ws).toContain('list-workspace-autosave')
    expect(ws).toContain('list-workspace-completeness')
    expect(ws).toContain('Completion')
    expect(ws).not.toContain('createPortal')
  })
})
