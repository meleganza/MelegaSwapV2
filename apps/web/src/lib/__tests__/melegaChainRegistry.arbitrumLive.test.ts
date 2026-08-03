/**
 * MELEGASWAP_V2_ARBITRUM_LIVE — execution gates.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_ARB_FACTORY,
  MELEGA_ARB_ROUTER,
  MELEGA_ARB_MASTER_BUILDER,
  MELEGA_ARB_VAULT,
  MELEGA_ARB_POOL_DEPLOY,
  MELEGA_ARB_MARCO,
  MELEGA_CHAIN_REGISTRY,
  getMelegaLiveSwitcherChainIds,
  getMelegaPreparingChains,
  getMelegaRouterAddress,
  getMelegaFactoryAddress,
  isMelegaCapabilityEnabled,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'
import { ROUTER_ADDRESS as WEB_ROUTER } from 'config/constants/exchange'
import { getV2RouterAddress } from 'lib/melega-smart-router/execution-adapter/adapters'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import { DEX_ECONOMIC_AUTHORITY } from 'config/dexEconomicAuthority'
import { CAKE_ARB } from '@pancakeswap/tokens'

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')

describe('MELEGASWAP_V2_ARBITRUM_LIVE', () => {
  it('Arbitrum is LIVE with Founder canonical contracts', () => {
    const arb = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 42161)!
    expect(arb.status).toBe('LIVE')
    expect(arb.contracts.factory?.toLowerCase()).toBe(MELEGA_ARB_FACTORY.toLowerCase())
    expect(arb.contracts.router?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(arb.contracts.masterBuilder).toBe(MELEGA_ARB_MASTER_BUILDER)
    expect(arb.contracts.vault).toBe(MELEGA_ARB_VAULT)
    expect(arb.contracts.poolDeploymentFactory).toBe(MELEGA_ARB_POOL_DEPLOY)
    expect(arb.capabilities.liquidityBuilder).toBe(false)
    expect(isMelegaChainLive(42161)).toBe(true)
    expect(isMelegaCapabilityEnabled(42161, 'swap')).toBe(true)
    expect(isMelegaCapabilityEnabled(42161, 'farms')).toBe(true)
    expect(isMelegaCapabilityEnabled(42161, 'pools')).toBe(true)
  })

  it('Router SSOT matches web + smart-router package + registry + V2 adapter', () => {
    expect(WEB_ROUTER[ChainId.ARBITRUM]?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(getMelegaRouterAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(getMelegaFactoryAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_FACTORY.toLowerCase())
    expect(getV2RouterAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    const pkg = readFileSync(path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'), 'utf8')
    expect(pkg.toLowerCase()).toContain(MELEGA_ARB_ROUTER.toLowerCase())
    expect(WEB_ROUTER[ChainId.ARBITRUM]).not.toMatch(/0x3BC722/i)
    expect(getV2RouterAddress(42161)).not.toMatch(/0x3BC722/i)
  })

  it('switcher includes Arbitrum LIVE; Avalanche remains PREPARING', () => {
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect(getMelegaPreparingChains().map((c) => c.chainId)).toEqual([43114])
  })

  it('fee settles native ETH at 25% to MELEGA TREASURY', () => {
    expect((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(42161)).toBe(true)
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 42161,
    })
    expect(fee.feeAsset).toBe('ETH')
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('MARCO identity is Arbitrum-factual (not BSC-only mislabel)', () => {
    expect(CAKE_ARB.chainId).toBe(42161)
    expect(CAKE_ARB.address.toLowerCase()).toBe(MELEGA_ARB_MARCO.toLowerCase())
    expect(CAKE_ARB.symbol).toBe('MARCO')
    expect(CAKE_ARB.decimals).toBe(18)
  })

  it('token registry, logos, farms inventory present; pools not fabricated', () => {
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    const tokens = list.tokens.filter((t: { chainId: number }) => t.chainId === 42161)
    expect(tokens.some((t: { symbol: string }) => t.symbol === 'MARCO')).toBe(true)
    expect(existsSync(path.join(WEB, 'public/images/42161/tokens'))).toBe(true)
    expect(
      existsSync(
        path.join(WEB, 'public/images/42161/tokens/0x963556de0eb8138E97A85F0A86eE0acD159D210b.png'),
      ),
    ).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/42161.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBeGreaterThanOrEqual(10)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools42161')
  })

  it('regression: BNB Base Polygon Ethereum remain LIVE', () => {
    for (const id of [56, 8453, 137, 1]) {
      expect(isMelegaChainLive(id)).toBe(true)
    }
  })
})
