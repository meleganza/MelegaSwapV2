/**
 * MELEGASWAP_V2_ARBITRUM_LIVE — final execution gates.
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
  it('Arbitrum is LIVE with Founder contracts + canonical MARCO', () => {
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
    expect(CAKE_ARB.address.toLowerCase()).toBe(MELEGA_ARB_MARCO.toLowerCase())
  })

  it('Router SSOT + no stale 0x3BC722 as live target', () => {
    expect(WEB_ROUTER[ChainId.ARBITRUM]?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(getMelegaRouterAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(getMelegaFactoryAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_FACTORY.toLowerCase())
    expect(getV2RouterAddress(42161)?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(WEB_ROUTER[ChainId.ARBITRUM]).not.toMatch(/0x3BC722/i)
  })

  it('switcher includes Arbitrum; Avalanche remains PREPARING', () => {
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

  it('farms inventory + token logo present; pools not fabricated', () => {
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/42161.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBeGreaterThanOrEqual(10)
    expect(existsSync(path.join(WEB, 'public/images/42161/tokens'))).toBe(true)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools42161')
  })
})
