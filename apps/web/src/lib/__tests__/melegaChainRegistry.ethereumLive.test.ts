/**
 * MELEGASWAP_V2_ETHEREUM_LIVE — execution gates.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_ETH_FACTORY,
  MELEGA_ETH_ROUTER,
  MELEGA_ETH_MASTER_BUILDER,
  MELEGA_ETH_VAULT,
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

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')

describe('MELEGASWAP_V2_ETHEREUM_LIVE', () => {
  it('Ethereum is LIVE with Founder canonical contracts', () => {
    const eth = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 1)!
    expect(eth.status).toBe('LIVE')
    expect(eth.contracts.factory).toBe(MELEGA_ETH_FACTORY)
    expect(eth.contracts.router).toBe(MELEGA_ETH_ROUTER)
    expect(eth.contracts.masterBuilder).toBe(MELEGA_ETH_MASTER_BUILDER)
    expect(eth.contracts.vault).toBe(MELEGA_ETH_VAULT)
    expect(eth.capabilities.liquidityBuilder).toBe(false)
    expect(isMelegaChainLive(1)).toBe(true)
    expect(isMelegaCapabilityEnabled(1, 'swap')).toBe(true)
    expect(isMelegaCapabilityEnabled(1, 'farms')).toBe(true)
    expect(isMelegaCapabilityEnabled(1, 'pools')).toBe(true)
  })

  it('Router SSOT matches web + smart-router package + registry + V2 adapter', () => {
    expect(WEB_ROUTER[ChainId.ETHEREUM]).toBe(MELEGA_ETH_ROUTER)
    expect(getMelegaRouterAddress(1)).toBe(MELEGA_ETH_ROUTER)
    expect(getMelegaFactoryAddress(1)).toBe(MELEGA_ETH_FACTORY)
    expect(getV2RouterAddress(1)).toBe(MELEGA_ETH_ROUTER)
    const pkg = readFileSync(path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'), 'utf8')
    expect(pkg).toContain(`[ChainId.ETHEREUM]: '${MELEGA_ETH_ROUTER}'`)
  })

  it('switcher includes Ethereum LIVE; Avalanche remains PREPARING after Arb LIVE', () => {
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect(getMelegaPreparingChains().map((c) => c.chainId)).toEqual([43114])
  })

  it('fee settles native ETH at 25% to MELEGA TREASURY', () => {
    expect((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(1)).toBe(true)
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 1,
    })
    expect(fee.feeAsset).toBe('ETH')
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('token registry, logos, farms, pools inventory present', () => {
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    const tokens = list.tokens.filter((t: { chainId: number }) => t.chainId === 1)
    expect(tokens.length).toBeGreaterThanOrEqual(5)
    expect(existsSync(path.join(WEB, 'public/images/1/tokens'))).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/1.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBeGreaterThanOrEqual(5)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools1')
  })
})
