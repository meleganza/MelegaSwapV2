/**
 * LIST Final — denser workspace beside right How guide.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Workspace (founder-final)', () => {
  it('uses auto-height denser workspace shell', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: 'auto'")
    expect(tokens).toContain("workspaceW: '1376px'")
    expect(tokens).toContain('workspaceMinH')
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

  it('places workspace left of How it works', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('list-workflow-bridge')
    expect(screen).toContain('<ListHowItWorks')
    expect(screen).toContain('<ListWorkspace')
    expect(screen.indexOf('<ListWorkspace')).toBeLessThan(screen.indexOf('<ListHowItWorks'))
    expect(screen).toContain('list-workspace')
  })

  it('keeps create-token honest about factory deployment blocker', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('LIST_CREATE_TOKEN_AVAILABLE')
    expect(ws).toContain('CREATE_TOKEN_FACTORY_NOT_DEPLOYED')
  })
})
