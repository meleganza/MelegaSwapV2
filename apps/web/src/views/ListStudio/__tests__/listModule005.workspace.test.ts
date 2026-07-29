/**
 * LIST Wave 04A — workspace beside compact How it works.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A Workspace', () => {
  it('keeps workspace geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: '920px'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain("workspaceHeaderH: '64px'")
    expect(tokens).toContain("workspaceBodyH: '760px'")
    expect(tokens).toContain("workspaceFooterH: '72px'")
  })

  it('implements all five intent bodies without modals or routes', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('Import Token')
    expect(ws).toContain('Contract Address')
    expect(ws).toContain('ListAiCopilot')
    expect(ws).toContain('Continue')
    expect(ws).toContain('Cancel')
    expect(ws).toContain('Publish')
    expect(ws).not.toContain('createPortal')
    expect(ws).not.toContain('Modal')
    expect(ws).not.toContain('Drawer')
  })

  it('places How it works beside workspace Completion surface', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('list-workflow-bridge')
    expect(screen).toContain('<ListHowItWorks')
    expect(screen).toContain('<ListWorkspace')
    expect(screen.indexOf('<ListHowItWorks')).toBeLessThan(screen.indexOf('<ListWorkspace'))
    expect(screen).toContain('list-workspace')
  })

  it('keeps create-token honest about Coming Soon', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('LIST_CREATE_TOKEN_AVAILABLE')
    expect(ws).toContain('Coming Soon')
  })
})
