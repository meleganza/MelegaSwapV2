/**
 * LIST_MODULE_002 — action cards guards (geometry + scope + honesty).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LIST_CREATE_TOKEN_AVAILABLE, LIST_INTENTS } from '../listTokens'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST_MODULE_002 Action Cards', () => {
  it('freezes certified hero geometry tokens', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("heroH: '360px'")
    expect(tokens).toContain("contentMax: '1376px'")
    expect(tokens).toContain("artW: '560px'")
    expect(tokens).toContain("statW: '120px'")
  })

  it('locks desktop and mobile action-card geometry', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("cardsTop: '24px'")
    expect(tokens).toContain("cardsRowH: '272px'")
    expect(tokens).toContain("cardW: '256px'")
    expect(tokens).toContain("cardH: '272px'")
    expect(tokens).toContain("cardGap: '24px'")
    expect(tokens).toContain("ctaW: '216px'")
    expect(tokens).toContain("ctaH: '44px'")
    expect(tokens).toContain("iconTile: '56px'")
    expect(tokens).toContain("badgeW: '68px'")
    expect(tokens).toContain("badgeH: '20px'")
    expect(tokens).toContain("mobileCardW: '358px'")
    expect(tokens).toContain("mobileCardH: '82px'")
    expect(tokens).toContain("mobileCardGap: '10px'")
    expect(tokens).toContain("tabletCardH: '240px'")
    expect(tokens).toContain("tabletGap: '16px'")
  })

  it('does not modify ListPageHero source', () => {
    const hero = load('ListPageHero.tsx')
    expect(hero).toContain('LIST_MODULE_001_HERO')
    expect(hero).toContain('1376×360')
    expect(hero).not.toContain('ListActionCards')
    expect(hero).not.toContain('listIntent')
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
    expect(cards).toContain("intent: 'import-token'")
    expect(cards).toContain("intent: 'create-token'")
    expect(cards).toContain("intent: 'claim-project'")
    expect(cards).toContain("intent: 'create-project'")
    expect(cards).toContain("intent: 'ai-assistant'")
    expect(cards.indexOf("intent: 'import-token'")).toBeLessThan(cards.indexOf("intent: 'create-token'"))
    expect(cards.indexOf("intent: 'create-token'")).toBeLessThan(cards.indexOf("intent: 'claim-project'"))
    expect(cards.indexOf("intent: 'claim-project'")).toBeLessThan(cards.indexOf("intent: 'create-project'"))
    expect(cards.indexOf("intent: 'create-project'")).toBeLessThan(cards.indexOf("intent: 'ai-assistant'"))
  })

  it('uses exact mission copy for all five cards', () => {
    const cards = load('ListActionCards.tsx')
    expect(cards).toContain('Add an existing token to the Melega ecosystem in just a few clicks.')
    expect(cards).toContain('Launch your own token with a simple and secure creation flow.')
    expect(cards).toContain('Already have a listed token? Claim its official Melega Project Page.')
    expect(cards).toContain('Build your project presence with or without a token.')
    expect(cards).toContain('Get guided help to prepare your token or project information.')
    expect(cards).toContain("cta: 'Import Token'")
    expect(cards).toContain("cta: 'Claim Page'")
    expect(cards).toContain("cta: 'Create Page'")
    expect(cards).toContain("cta: 'Get Help'")
  })

  it('keeps intent routing on /list without modal/drawer', () => {
    const intent = load('useListIntent.ts')
    expect(intent).toContain("pathname: '/list'")
    expect(intent).toContain('shallow: true')
    expect(intent).toContain('scroll: false')
    expect(intent).toContain('parseIntent')
    expect(intent).not.toMatch(/Modal|Drawer|window\.location\.href/)
    const cards = load('ListActionCards.tsx')
    expect(cards).not.toMatch(/createPortal|Dialog|Drawer/)
  })

  it('mounts action cards beneath hero only', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('ListPageHero')
    expect(screen).toContain('ListActionCards')
    expect(screen.indexOf('ListPageHero')).toBeLessThan(screen.indexOf('ListActionCards'))
    expect(screen).not.toContain('Import Existing Token')
  })

  it('features Claim Project Page without enlarging card geometry', () => {
    const cards = load('ListActionCards.tsx')
    expect(cards).toContain('featured: true')
    expect(cards).toContain('goldPremium')
    expect(cards).toContain('radial-gradient')
    expect(cards).toContain('rgba(221, 185, 47, 0.95)')
    expect(cards).toContain('${listOne.cardW}')
    expect(cards).toContain('${listOne.cardH}')
  })

  it('respects reduced-motion on hover transitions', () => {
    const cards = load('ListActionCards.tsx')
    expect(cards).toContain('prefers-reduced-motion: reduce')
    expect(cards).toContain('translateY(-2px)')
    expect(cards).toContain('120ms ease')
  })
})
