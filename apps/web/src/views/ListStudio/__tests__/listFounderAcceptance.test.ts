/**
 * List Final Founder Acceptance — source contracts.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { LIST_HERO_BNB_LOGO, LIST_HERO_USDT_LOGO } from '../ListPageHero'
import { CREATE_TOKEN_READINESS } from '../createTokenReadiness'
import { FEATURED_OFFER } from 'lib/featured-placement/constants'
import { deleteListDraft, loadListDraft, saveListDraft } from '../listDraftPersistence'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('List Founder Acceptance', () => {
  it('entry cards map to URL intents and workspace', () => {
    const cards = load('ListActionCards.tsx')
    const intent = load('useListIntent.ts')
    for (const id of [
      'import-token',
      'create-token',
      'claim-project',
      'create-project',
      'ai-assistant',
    ]) {
      expect(cards).toContain(`intent: '${id}'`)
    }
    expect(cards).toContain('list-action-${def.intent}')
    expect(intent).toContain('LIST_INTENTS')
    expect(intent).toContain("pathname: '/list'")
    expect(cards).toContain('setListIntent')
    expect(cards).toContain('scrollIntoView')
    expect(cards).toContain("data-selected={selected ? '1' : '0'}")
    // Create Token card opens workspace even when factory undeployed
    expect(cards).toContain('Review readiness')
  })

  it('uses canonical local BNB and USDT logos in hero orbit', () => {
    const hero = load('ListPageHero.tsx')
    expect(hero).toContain('LIST_HERO_BNB_LOGO')
    expect(hero).toContain('LIST_HERO_USDT_LOGO')
    expect(hero).toContain('MELEGA_LOGO_URI')
    expect(LIST_HERO_BNB_LOGO).toBe('/images/56/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png')
    expect(LIST_HERO_USDT_LOGO).toContain('0x55d398326f99059fF775485246999027B3197955')
    expect(existsSync(path.join(WEB, 'public', LIST_HERO_BNB_LOGO))).toBe(true)
    expect(existsSync(path.join(WEB, 'public', LIST_HERO_USDT_LOGO))).toBe(true)
    expect(hero).not.toMatch(/<Orbiter[^>]*>\s*BNB\s*</)
    expect(hero).not.toMatch(/<Orbiter[^>]*>\s*USDT\s*</)
  })

  it('places How it works as right-side vertical guide', () => {
    const screen = load('ListStudioScreen.tsx')
    const how = load('ListHowItWorks.tsx')
    expect(screen.indexOf('<ListWorkspace')).toBeLessThan(screen.indexOf('<ListHowItWorks'))
    expect(how).toContain('data-list-how="vertical-right"')
    expect(how).toContain('data-list-how-placement="right"')
    expect(how).toContain('Configure')
    expect(how).toContain('Verify')
    expect(how).toContain('sticky')
  })

  it('Featured offer is optional with canon terms in List checkout', () => {
    const checkout = load('ListFeaturedCheckout.tsx')
    expect(checkout).toContain('continueWithoutFeatured')
    expect(checkout).toContain('Get Featured · $')
    expect(checkout).toContain('data-featured-optional="1"')
    expect(checkout).toContain('FEATURED_PACKAGES')
    expect(FEATURED_OFFER.usdPrice).toBe(99)
    expect(FEATURED_OFFER.durationDays).toBe(7)
    expect(checkout).not.toMatch(/TreasuryRuntime|treasury-runtime/i)
  })

  it('Create Token readiness is MAINNET READY with measured factory', () => {
    expect(CREATE_TOKEN_READINESS.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
    expect(CREATE_TOKEN_READINESS.blockerCode).toBeNull()
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('list-create-token-ready')
    expect(ws).toContain('list-create-token-cta-ready')
  })

  it('draft isolation keys include wallet + intent + chain', () => {
    const mem = new Map<string, string>()
    const ls = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v)
      },
      removeItem: (k: string) => {
        mem.delete(k)
      },
    }
    // @ts-expect-error test fixture storage
    globalThis.window = { localStorage: ls }
    saveListDraft({
      intent: 'claim-project',
      wallet: '0xaaa',
      chainId: 56,
      projectKey: '0xbbb',
      values: { contract: '0xbbb', wallet: '0xaaa' },
      featuredOrderId: null,
    })
    saveListDraft({
      intent: 'create-project',
      wallet: '0xaaa',
      chainId: 56,
      projectKey: 'name',
      values: { name: 'Other', wallet: '0xaaa' },
      featuredOrderId: null,
    })
    saveListDraft({
      intent: 'claim-project',
      wallet: '0xbbb',
      chainId: 56,
      projectKey: null,
      values: { contract: '0xleak' },
      featuredOrderId: null,
    })
    const claimA = loadListDraft({ intent: 'claim-project', wallet: '0xaaa', chainId: 56 })
    const createA = loadListDraft({ intent: 'create-project', wallet: '0xaaa', chainId: 56 })
    const claimB = loadListDraft({ intent: 'claim-project', wallet: '0xbbb', chainId: 56 })
    expect(claimA?.values.contract).toBe('0xbbb')
    expect(createA?.values.name).toBe('Other')
    expect(claimA?.values.name).toBeUndefined()
    expect(claimB?.values.contract).toBe('0xleak')
    expect(claimA?.values.contract).not.toBe(claimB?.values.contract)
    deleteListDraft({ intent: 'claim-project', wallet: '0xaaa', chainId: 56 })
    deleteListDraft({ intent: 'create-project', wallet: '0xaaa', chainId: 56 })
    deleteListDraft({ intent: 'claim-project', wallet: '0xbbb', chainId: 56 })
  })

  it('workspace density avoids fixed 920px empty shell', () => {
    const tokens = load('listTokens.ts')
    expect(tokens).toContain("workspaceH: 'auto'")
    expect(tokens).toContain('workspaceMinH')
    const ws = load('ListWorkspace.tsx')
    expect(ws).toContain('min-height: ${listOne.workspaceMinH}')
  })
})
