/**
 * MELEGASWAP_V2_PROJECT_PAGES_MULTICHAIN_PRODUCT_COMPLETION — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  buildProjectChainDeployments,
  defaultSelectedChainId,
  explorerLabelFor,
  explorerUrlFor,
  filterParticipationByChain,
  getBuyTokenHref,
} from '../helpers'
import {
  MELEGA_BNB_ROUTER,
  MELEGA_BASE_ROUTER,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import { resolveProjectBySlug } from 'registry/projects/identity/resolveProject'
import { normalizeProjectDocument } from 'registry/projects/identity/normalizeProject'

const V1 = path.resolve(__dirname, '..')
const SRC = path.resolve(__dirname, '../../../..')

describe('Project Pages Multichain Product Completion', () => {
  it('exposes chain-aware explorer URLs (Base ≠ BscScan)', () => {
    expect(explorerUrlFor('0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7', 8453)).toContain(
      'basescan.org',
    )
    expect(explorerLabelFor(8453)).toBe('BaseScan')
    expect(explorerLabelFor(56)).toBe('BscScan')
    expect(explorerUrlFor('0x963556de0eb8138E97A85F0A86eE0acD159D210b', 56)).toContain('bscscan.com')
  })

  it('Buy Token CTA stays on Project Page (focus=swap), not generic Trade', () => {
    const href = getBuyTokenHref({
      chainId: 56,
      contract: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    })
    expect(href).toContain('focus=swap')
    expect(href).toContain('chain=bsc')
    expect(href).not.toMatch(/^\/trade/)

    const baseHref = getBuyTokenHref({
      chainId: 8453,
      contract: '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
    })
    expect(baseHref).toContain('chain=base')
    expect(baseHref).toContain('inputCurrency=ETH')

    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('Buy Token')
    expect(shell).toContain('data-testid="project-v1-buy"')
    expect(shell).not.toContain('data-testid="project-v1-trade"')
  })

  it('builds LIVE + Coming soon deployments for MARCO', () => {
    const resolved = resolveProjectBySlug('marco')
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const document = normalizeProjectDocument(resolved.project)
    const deployments = buildProjectChainDeployments(document)
    const byId = Object.fromEntries(deployments.map((d) => [d.chainId, d]))

    expect(byId[56]?.status).toBe('LIVE')
    expect(byId[8453]?.status).toBe('LIVE')
    expect(byId[56]?.routerAddress?.toLowerCase()).toBe(MELEGA_BNB_ROUTER.toLowerCase())
    expect(byId[8453]?.routerAddress?.toLowerCase()).toBe(MELEGA_BASE_ROUTER.toLowerCase())
    expect(byId[56]?.swapTarget).toMatch(/BNB/)
    expect(byId[8453]?.swapTarget).toMatch(/ETH/)

    // After Avalanche LIVE: 43114 selectable.
    expect(byId[137]?.status).toBe('LIVE')
    expect(byId[137]?.comingSoon).toBe(false)
    expect(byId[1]?.status).toBe('LIVE')
    expect(byId[1]?.comingSoon).toBe(false)
    expect(byId[42161]?.status).toBe('LIVE')
    expect(byId[42161]?.comingSoon).toBe(false)
    expect(byId[43114]?.comingSoon).toBe(false)
    expect(byId[43114]?.status).toBe('LIVE')

    expect(isMelegaChainLive(defaultSelectedChainId(deployments))).toBe(true)
  })

  it('filters farms / pools / liquidity to the selected chain', () => {
    const rows = [
      { participationId: 'a', chainId: 56 },
      { participationId: 'b', chainId: 8453 },
      { participationId: 'c', chainId: 56 },
    ] as any
    expect(filterParticipationByChain(rows, 56).map((r) => r.participationId)).toEqual(['a', 'c'])
    expect(filterParticipationByChain(rows, 8453).map((r) => r.participationId)).toEqual(['b'])
  })

  it('shell wires Add to Wallet, Copy Contract, Explorer, verified, chain badges', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('AddToWalletButton')
    expect(shell).toContain('project-v1-copy-contract')
    expect(shell).toContain('project-v1-explorer')
    expect(shell).toContain('project-v1-verified')
    expect(shell).toContain('project-v1-chain-deployments')
    expect(shell).toContain('Coming soon')
    expect(shell).toContain('MelegaExploreChainBadge')
    expect(shell).toContain('data-project-multichain="ready"')
  })

  it('trading embed auto-selects BNB/Base router and has no NetworkSwitcher', () => {
    const trade = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    expect(trade).toContain('SmartSwapForm')
    expect(trade).toContain('switchNetworkAsync')
    expect(trade).toContain('getMelegaRouterAddress')
    expect(trade).toContain('projectChainId')
    expect(trade).toContain('Coming soon')
    expect(trade).not.toContain('NetworkSwitcher')
    expect(trade).toContain("views/Swap/SmartSwap")
  })

  it('markets builder resolves Base factory/router from registry', () => {
    const markets = readFileSync(
      path.join(SRC, 'registry/projects/identity/markets/buildProjectMarketsDocument.ts'),
      'utf8',
    )
    expect(markets).toContain('getMelegaRouterAddress')
    expect(markets).toContain('getMelegaFactoryAddress')
    expect(markets).toContain('isMelegaChainLive')
  })

  it('trading embed does not embed fee / treasury logic', () => {
    const trade = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    expect(trade).not.toMatch(/2500|feeBps|TREASURY/)
  })
})
