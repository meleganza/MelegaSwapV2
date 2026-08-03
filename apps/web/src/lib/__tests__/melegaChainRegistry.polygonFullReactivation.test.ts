/**
 * MELEGASWAP_V2_POLYGON_FULL_REACTIVATION_AND_ARBITRUM_REGISTRY_COMPLETION
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_CHAIN_REGISTRY,
  MELEGA_POLYGON_FACTORY,
  MELEGA_POLYGON_ROUTER,
  MELEGA_POLYGON_MASTER_BUILDER,
  MELEGA_POLYGON_VAULT,
  MELEGA_POLYGON_POOL_DEPLOY,
  MELEGA_POLYGON_MULTICALL,
  MELEGA_BASE_ROUTER,
  getMelegaLiveSwitcherChainIds,
  getMelegaPreparingChains,
  getMelegaRouterAddress,
  getMelegaFactoryAddress,
  isMelegaCapabilityEnabled,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'
import { ROUTER_ADDRESS as WEB_ROUTER } from 'config/constants/exchange'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { getV2RouterAddress } from 'lib/melega-smart-router/execution-adapter/adapters'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import { DEX_ECONOMIC_AUTHORITY } from 'config/dexEconomicAuthority'
import { getBuyTokenHref, explorerLabelFor, explorerUrlFor } from 'views/ProjectPage/v1/helpers'
import { MELEGA_EXPLORE_CHAIN_LABELS } from 'components/Logo/MelegaExploreChainBadge'

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')

describe('Polygon full reactivation + Arbitrum registry', () => {
  it('chain matrix: BNB+Base+Polygon LIVE; ETH+Arb+Avax PREPARING', () => {
    const byId = Object.fromEntries(MELEGA_CHAIN_REGISTRY.map((c) => [c.chainId, c]))
    expect(byId[56].status).toBe('LIVE')
    expect(byId[8453].status).toBe('LIVE')
    expect(byId[137].status).toBe('LIVE')
    expect(byId[1].status).toBe('PREPARING')
    expect(byId[42161].status).toBe('PREPARING')
    expect(byId[43114].status).toBe('PREPARING')
    expect(byId[137].capabilities.liquidityBuilder).toBe(false)
    expect(byId[56].capabilities.liquidityBuilder).toBe(true)
    expect(byId[42161].capabilities.swap).toBe(false)
    expect(byId[42161].contracts.factory).toBeNull()
    expect(byId[42161].contracts.router).toBeNull()
  })

  it('Arbitrum registered on Coming Soon surfaces', () => {
    expect(getMelegaPreparingChains().map((c) => c.chainId).sort((a, b) => a - b)).toEqual([
      1, 42161, 43114,
    ])
    expect(MELEGA_EXPLORE_CHAIN_LABELS[42161]).toBe('Arbitrum')
    expect(explorerLabelFor(42161)).toBe('Arbiscan')
    expect(explorerUrlFor('0x0000000000000000000000000000000000000001', 42161)).toContain('arbiscan.io')
    const switcher = readFileSync(path.join(WEB, 'src/components/NetworkSwitcher.tsx'), 'utf8')
    expect(switcher).toContain('getMelegaPreparingChains')
    expect(switcher).toContain('Coming soon')
  })

  it('Polygon LIVE contracts + capabilities', () => {
    expect(isMelegaChainLive(137)).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'swap')).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'farms')).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'pools')).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'tokens')).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'liquidityBuilder')).toBe(false)
    expect(getMelegaFactoryAddress(137)).toBe(MELEGA_POLYGON_FACTORY)
    expect(getMelegaRouterAddress(137)).toBe(MELEGA_POLYGON_ROUTER)
    const poly = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 137)!
    expect(poly.contracts.masterBuilder).toBe(MELEGA_POLYGON_MASTER_BUILDER)
    expect(poly.contracts.vault).toBe(MELEGA_POLYGON_VAULT)
    expect(poly.contracts.multicall).toBe(MELEGA_POLYGON_MULTICALL)
    expect(poly.contracts.poolDeploymentFactory).toBe(MELEGA_POLYGON_POOL_DEPLOY)
  })

  it('Polygon Router SSOT across web + smart-router + registry + V2 adapter', () => {
    expect(WEB_ROUTER[ChainId.POLYGON]).toBe(MELEGA_POLYGON_ROUTER)
    expect(getV2RouterAddress(137)).toBe(MELEGA_POLYGON_ROUTER)
    const pkg = readFileSync(path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'), 'utf8')
    expect(pkg).toContain(`[ChainId.POLYGON]: '${MELEGA_POLYGON_ROUTER}'`)
    expect(pkg).not.toMatch(/\[ChainId\.POLYGON\]: '0x3BC722/)
    expect(pkg).toMatch(/\[ChainId\.ARBITRUM\]: ''/)
  })

  it('switcher LIVE = BNB + Base + Polygon', () => {
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([56, 137, 8453])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS].sort((a, b) => a - b)).toEqual([56, 137, 8453])
  })

  it('no cross-chain address fallback', () => {
    const empty: Record<number, string> = { 56: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }
    expect(getAddress(empty as any, 137)).toBe('')
    expect(getAddress(empty as any, 8453)).toBe('')
    expect(getMasterChefAddress(99999)).toBe('')
    expect(getMasterChefAddress(137)).toBe(MELEGA_POLYGON_MASTER_BUILDER)
  })

  it('Polygon fee settles native POL at 25% to MELEGA TREASURY', () => {
    expect((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(137)).toBe(true)
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 137,
    })
    expect(fee.feeAsset).toBe('POL')
    expect(fee.percent).toBe(25)
    expect(fee.bps).toBe(2500)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('Polygon syrup uses ChainId.POLYGON not BASE', () => {
    const syrup = readFileSync(path.join(REPO, 'packages/tokens/src/137.ts'), 'utf8')
    expect(syrup).toMatch(/syrup:[\s\S]*ChainId\.POLYGON/)
    expect(syrup).not.toMatch(/syrup:[\s\S]*ChainId\.BASE/)
  })

  it('Polygon token/farm/pool inventory present', () => {
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    expect(list.tokens.filter((t: { chainId: number }) => t.chainId === 137).length).toBeGreaterThanOrEqual(20)
    expect(existsSync(path.join(WEB, 'public/images/137/tokens'))).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/137.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBeGreaterThanOrEqual(40)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools137')
    const explore = readFileSync(path.join(WEB, 'src/views/FarmsStudio/modules/useFarmsExploreFarms.ts'), 'utf8')
    expect(explore).toContain('isMelegaCapabilityEnabled')
  })

  it('Project Pages Polygon Buy Token + explorer', () => {
    const href = getBuyTokenHref({
      chainId: 137,
      contract: '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
    })
    expect(href).toContain('focus=swap')
    expect(href).toContain('chain=polygon')
    expect(href).toContain('inputCurrency=MATIC')
    expect(explorerLabelFor(137)).toBe('Polygonscan')
    expect(explorerUrlFor('0xD3e28c74177B812d1543A406aD1A97ee3C398AC2', 137)).toContain('polygonscan.com')
    const shell = readFileSync(path.join(WEB, 'src/views/ProjectPage/v1/ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('Buy Token')
    expect(shell).toContain('data-project-multichain="ready"')
    const trade = readFileSync(path.join(WEB, 'src/views/ProjectPage/v1/ProjectTradingEmbed.tsx'), 'utf8')
    expect(trade).toContain('switchNetworkAsync')
    expect(trade).toContain('projectChainId')
  })

  it('LB remains BNB-only; Base router regression intact', () => {
    expect(isMelegaCapabilityEnabled(56, 'liquidityBuilder')).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'liquidityBuilder')).toBe(false)
    expect(isMelegaCapabilityEnabled(8453, 'liquidityBuilder')).toBe(false)
    expect(WEB_ROUTER[ChainId.BASE]).toBe(MELEGA_BASE_ROUTER)
    const lb = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/modules/LiquidityActionsModule.tsx'), 'utf8')
    expect(lb).toContain('BNB Chain only')
    expect(lb).toContain('BETA')
  })
})
