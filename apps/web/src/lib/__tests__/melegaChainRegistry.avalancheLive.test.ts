/**
 * MELEGASWAP_V2_AVALANCHE_LIVE — validation + SSOT bind gates.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_AVAX_FACTORY,
  MELEGA_AVAX_ROUTER,
  MELEGA_AVAX_MASTER_BUILDER,
  MELEGA_AVAX_ROUTER_DEPLOY_TX,
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
import {
  encodeAddLiquidityAvax,
  encodeSwapExactAvaxForMarco,
  encodeGetAmountsOut,
} from 'lib/deployment-orchestrator/founderAvalancheLiveSeed'
import { AVALANCHE_STATUS_UNTIL_ACTIVATION } from 'lib/deployment-orchestrator/founderAvalancheRouterValidation'

const WEB = path.resolve(__dirname, '../../..')
const REPO = path.resolve(WEB, '../..')
const ROUTER = '0x5A38b0B75C2E199fD8098710594115A35ABb6c7F'

describe('MELEGASWAP_V2_AVALANCHE_LIVE', () => {
  it('Avalanche is LIVE with Founder-bound Router', () => {
    const avax = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 43114)!
    expect(avax.status).toBe('LIVE')
    expect(avax.contracts.factory).toBe(MELEGA_AVAX_FACTORY)
    expect(avax.contracts.router).toBe(MELEGA_AVAX_ROUTER)
    expect(avax.contracts.router).toBe(ROUTER)
    expect(avax.contracts.masterBuilder).toBe(MELEGA_AVAX_MASTER_BUILDER)
    expect(avax.capabilities.swap).toBe(true)
    expect(avax.capabilities.farms).toBe(true)
    expect(avax.capabilities.pools).toBe(true)
    expect(avax.capabilities.tokens).toBe(true)
    expect(avax.capabilities.liquidityBuilder).toBe(false)
    expect(isMelegaChainLive(43114)).toBe(true)
    expect(isMelegaCapabilityEnabled(43114, 'swap')).toBe(true)
    expect(MELEGA_AVAX_ROUTER_DEPLOY_TX).toMatch(/^0xd3185d5f/)
    expect(AVALANCHE_STATUS_UNTIL_ACTIVATION).toBe('LIVE')
  })

  it('Router SSOT matches web + smart-router package + registry + V2 adapter', () => {
    expect(WEB_ROUTER[ChainId.AVAX]).toBe(MELEGA_AVAX_ROUTER)
    expect(getMelegaRouterAddress(43114)).toBe(MELEGA_AVAX_ROUTER)
    expect(getMelegaFactoryAddress(43114)).toBe(MELEGA_AVAX_FACTORY)
    expect(getV2RouterAddress(43114)).toBe(MELEGA_AVAX_ROUTER)
    const pkg = readFileSync(path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'), 'utf8')
    expect(pkg).toContain(`[ChainId.AVAX]: '${MELEGA_AVAX_ROUTER}'`)
  })

  it('switcher includes Avalanche LIVE; no PREPARING chains remain', () => {
    expect(getMelegaPreparingChains()).toEqual([])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS]).toContain(43114)
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([
      1, 56, 137, 8453, 42161, 43114,
    ])
  })

  it('fee settles native AVAX at 25% to MELEGA TREASURY', () => {
    expect((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(43114)).toBe(true)
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 43114,
    })
    expect(fee.feeAsset).toBe('AVAX')
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('seed calldata encodes addLiquidityETH + swapExactETHForTokens + getAmountsOut', () => {
    const liq = encodeAddLiquidityAvax({
      marcoAmount: 1n,
      avaxAmount: 1n,
      to: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
      deadline: 2_000_000_000,
    })
    expect(liq.data.startsWith('0xf305d719')).toBe(true)
    const swap = encodeSwapExactAvaxForMarco({
      avaxIn: 1n,
      to: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
      deadline: 2_000_000_000,
    })
    expect(swap.data.startsWith('0x7ff36ab5')).toBe(true)
    expect(encodeGetAmountsOut(1n).startsWith('0xd06ca61f')).toBe(true)
  })

  it('token logos + farm inventory present', () => {
    expect(
      existsSync(
        path.join(WEB, 'public/images/43114/tokens/0x8c880e839f3cacf60f11612087babd3307a33720.png'),
      ),
    ).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/43114.ts'), 'utf8')
    expect(farms).toContain('pid: 0')
    expect(farms).toContain('isTokenOnly: true')
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools43114')
  })
})
