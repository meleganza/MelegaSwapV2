/**
 * LIST_MODULE_007 — AI Copilot guards + frozen module integrity.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ROOT = path.resolve(__dirname, '..')
const REPO = path.resolve(__dirname, '../../../../../../')
const BASE = 'fbefcab3'

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function gitDiff(relFromRepo: string) {
  return execSync(`git diff ${BASE} -- ${relFromRepo}`, { cwd: REPO, encoding: 'utf8' })
}

describe('LIST_MODULE_007 AI Copilot', () => {
  it('keeps outer workspace geometry locks unchanged', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: '920px'")
    expect(tokens).toContain("workspaceContextW: '340px'")
    expect(tokens).toContain("workspaceCompleteRing: '72px'")
    expect(tokens).toContain("aiSuggestSectionH: '260px'")
    expect(tokens).toContain("aiSuggestCardH: '52px'")
    expect(tokens).toContain("aiAnalysisH: '120px'")
    expect(tokens).toContain("aiMemoryH: '120px'")
  })

  it('keeps Modules 001–005 composition sources byte-identical to fbefcab3', () => {
    expect(gitDiff('apps/web/src/views/ListStudio/ListPageHero.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListActionCards.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/useListIntent.ts')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListWhyBuildRail.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListHowItWorks.tsx')).toBe('')
    expect(gitDiff('apps/web/src/views/ListStudio/ListStudioScreen.tsx')).toBe('')
  })

  it('implements product-copilot panel without chat UI', () => {
    const ai = load('ListAiCopilot.tsx')
    expect(ai).toContain('AI Copilot')
    expect(ai).toContain('list-ai-copilot-status')
    expect(ai).toContain('Missing Items')
    expect(ai).toContain('AI Suggestions')
    expect(ai).toContain('Live Analysis')
    expect(ai).toContain('AI Memory')
    expect(ai).toContain('Confidence')
    expect(ai).toContain('pending')
    expect(ai).not.toContain('Bubble')
    expect(ai).not.toContain('Transcript')
    expect(ai).not.toMatch(/chat bubble|ChatGPT|conversation UI/i)
    expect(ai).not.toContain('createPortal')
    expect(ai).not.toContain('Modal')
  })

  it('wires copilot into workspace for create-project and ai-assistant without chat left pane', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('ListAiCopilot')
    expect(ws).toContain('Generate Description')
    expect(ws).toContain("data-list-module=\"007\"")
    expect(ws).not.toContain('list-workspace-ai-transcript')
    expect(ws).not.toContain('Ask for a draft')
  })
})
