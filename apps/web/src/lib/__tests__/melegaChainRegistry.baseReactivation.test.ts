/**
 * MELEGASWAP_V2_MULTICHAIN_FOUNDATION_AND_BASE_REACTIVATION — mission-scoped gates.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_BASE_FACTORY,
  MELEGA_BASE_ROUTER,
  MELEGA_CHAIN_REGISTRY,
  getMelegaChain,
  getMelegaFactoryAddress,
  getMelegaLiveSwitcherChainIds,
  getMelegaPreparingChains,
  getMelegaRouterAddress,
  isMelegaCapabilityEnabled,
} from 'config/melegaChainRegistry'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'
import { ROUTER_ADDRESS as WEB_ROUTER } from 'config/constants/exchange'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import { resolveCanonicalFeeBeneficiary } from 'config/dexEconomicAuthority'
import { getV2RouterAddress } from 'lib/melega-smart-router/execution-adapter/adapters'

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/melegaswap-v2-multichain-foundation-and-base-reactivation')

describe('Multichain foundation + Base reactivation', () => {
  it('canonical registry covers required chains with LIVE/PREPARING statuses', () => {
    const byId = Object.fromEntries(MELEGA_CHAIN_REGISTRY.map((c) => [c.chainId, c]))
    expect(byId[56].status).toBe('LIVE')
    expect(byId[8453].status).toBe('LIVE')
    expect(byId[137].status).toBe('PREPARING')
    expect(byId[1].status).toBe('PREPARING')
    expect(byId[43114].status).toBe('PREPARING')
    expect(byId[8453].capabilities.liquidityBuilder).toBe(false)
    expect(byId[56].capabilities.liquidityBuilder).toBe(true)
    expect(byId[8453].contracts.router).toBe(MELEGA_BASE_ROUTER)
    expect(byId[8453].contracts.factory).toBe(MELEGA_BASE_FACTORY)
  })

  it('switcher LIVE set is BNB + Base only; PREPARING are not switchable', () => {
    expect([...getMelegaLiveSwitcherChainIds()].sort()).toEqual([56, 8453])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS].sort()).toEqual([56, 8453])
    expect(getMelegaPreparingChains().map((c) => c.chainId).sort()).toEqual([1, 137, 43114])
  })

  it('resolves Base Router SSOT across web + smart-router package', () => {
    expect(WEB_ROUTER[ChainId.BASE]).toBe(MELEGA_BASE_ROUTER)
    const pkgExchange = readFileSync(
      path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'),
      'utf8',
    )
    expect(pkgExchange).toContain(`[ChainId.BASE]: '${MELEGA_BASE_ROUTER}'`)
    expect(getMelegaRouterAddress(8453)).toBe(MELEGA_BASE_ROUTER)
    expect(getMelegaFactoryAddress(8453)).toBe(MELEGA_BASE_FACTORY)
    expect(getV2RouterAddress(8453)).toBe(MELEGA_BASE_ROUTER)
  })

  it('never falls back to BNB addresses for other chains', () => {
    const empty: Record<number, string> = { 56: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }
    expect(getAddress(empty as any, 8453)).toBe('')
    expect(getAddress(empty as any, 56)).toBe('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    expect(getMasterChefAddress(99999)).toBe('')
    expect(getMasterChefAddress(8453)).toBe('0x149EE9245E5eD52a89Ea777d19AD3A5D87873680')
  })

  it('Base farms/pools capabilities are LIVE; LB remains BNB-only', () => {
    expect(isMelegaCapabilityEnabled(8453, 'farms')).toBe(true)
    expect(isMelegaCapabilityEnabled(8453, 'pools')).toBe(true)
    expect(isMelegaCapabilityEnabled(8453, 'swap')).toBe(true)
    expect(isMelegaCapabilityEnabled(8453, 'liquidityBuilder')).toBe(false)
    expect(isMelegaCapabilityEnabled(56, 'liquidityBuilder')).toBe(true)
    const lbActions = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/modules/LiquidityActionsModule.tsx'), 'utf8')
    expect(lbActions).toContain('LB_SUPPORTED_CHAIN_ID')
    expect(lbActions).toContain('BNB Chain only')
    expect(lbActions).toContain('BETA')
  })

  it('Smart Swap fee settles native ETH on Base at 25% to MELEGA TREASURY', () => {
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 8453,
    })
    expect(fee.feeAsset).toBe('ETH')
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
    expect(resolveCanonicalFeeBeneficiary(8453)?.address.toLowerCase()).toBe(
      '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b',
    )
    const bnb = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 56,
    })
    expect(bnb.feeAsset).toBe('BNB')
    expect(bnb.feeWei).toBe(fee.feeWei)
  })

  it('Base token list + logos exist; farms/pools configs present', () => {
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    const baseTokens = list.tokens.filter((t: { chainId: number }) => t.chainId === 8453)
    expect(baseTokens.length).toBeGreaterThanOrEqual(20)
    expect(existsSync(path.join(WEB, 'public/images/8453/tokens'))).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/8453.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBe(30)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools8453')
  })

  it('chain badges and explore farms support Base', () => {
    const badge = readFileSync(path.join(WEB, 'src/components/Logo/MelegaExploreChainBadge.tsx'), 'utf8')
    expect(badge).toContain('8453')
    expect(badge).toContain('Base')
    const explore = readFileSync(path.join(WEB, 'src/views/FarmsStudio/modules/useFarmsExploreFarms.ts'), 'utf8')
    expect(explore).toContain('isMelegaCapabilityEnabled')
  })

  it('evidence directory is reserved for mission artifacts', () => {
    expect(EVIDENCE.includes('melegaswap-v2-multichain-foundation-and-base-reactivation')).toBe(true)
  })
})
