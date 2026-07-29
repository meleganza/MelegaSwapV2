/**
 * LIST Wave 04A — action cards connect into workspace.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LIST_CREATE_TOKEN_AVAILABLE, LIST_INTENTS } from '../listTokens'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A Action Cards', () => {
  it('keeps action-card geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("contentMax: '1376px'")
    expect(tokens).toContain("cardsRowH: '272px'")
    expect(tokens).toContain("cardW: '256px'")
    expect(tokens).toContain("cardH: '272px'")
  })

  it('scrolls selected intent into the workspace', () => {
    const cards = load('ListActionCards.tsx')
    expect(cards).toContain('list-workspace')
    expect(cards).toContain('scrollIntoView')
    expect(cards).toContain('Continue in the workspace below')
  })

  it('defines five intents in order with honest create-token availability', () => {
    expect([...LIST_INTENTS]).toEqual([
      'import-token',
      'create-token',
      'claim-project',
      'create-project',
      'ai-assistant',
    ])
    expect(LIST_CREATE_TOKEN_AVAILABLE).toBe(false)
    const cards = load('ListActionCards.tsx')
    expect(cards).toContain('Coming Soon')
    expect(cards).toContain('Claim Project Page')
    expect(cards).toContain('POPULAR')
  })

  it('mounts after hero and before workspace bridge', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListPageHero')
    expect(screen).toContain('ListActionCards')
    expect(screen.indexOf('ListPageHero')).toBeLessThan(screen.indexOf('ListActionCards'))
    expect(screen.indexOf('ListActionCards')).toBeLessThan(screen.indexOf('list-workflow-bridge'))
  })
})
