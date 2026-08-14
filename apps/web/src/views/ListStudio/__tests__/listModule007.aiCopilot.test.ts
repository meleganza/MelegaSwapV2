/**
 * LIST Wave 04A — AI Copilot guards.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A AI Copilot', () => {
  it('keeps AI geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: 'auto'")
    expect(tokens).toContain("aiSuggestSectionH: '260px'")
    expect(tokens).toContain("aiSuggestCardH: '52px'")
  })

  it('implements product-copilot panel without chat UI', () => {
    const ai = load('ListAiCopilot.tsx')
    expect(ai).toContain('AI Copilot')
    expect(ai).toContain('list-ai-copilot-status')
    expect(ai).toContain('Missing Items')
    expect(ai).toContain('AI Suggestions')
    expect(ai).not.toContain('Bubble')
    expect(ai).not.toContain('createPortal')
    expect(ai).not.toContain('Modal')
  })

  it('wires copilot into workspace for create-project and ai-assistant', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('ListAiCopilot')
    expect(ws).toContain('Generate Description')
    expect(ws).toContain('data-list-module="007"')
    expect(ws).not.toContain('list-workspace-ai-transcript')
  })
})
