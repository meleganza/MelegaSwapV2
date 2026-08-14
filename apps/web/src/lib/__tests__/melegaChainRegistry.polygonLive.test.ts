/**
 * MELEGASWAP_V2_POLYGON_LIVE — execution gates.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ChainId } from '@pancakeswap/sdk'
import {
  MELEGA_POLYGON_FACTORY,
  MELEGA_POLYGON_ROUTER,
  MELEGA_POLYGON_MASTER_BUILDER,
  MELEGA_POLYGON_VAULT,
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

describe('MELEGASWAP_V2_POLYGON_LIVE', () => {
  it('Polygon is LIVE with Founder canonical contracts', () => {
    const poly = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 137)!
    expect(poly.status).toBe('LIVE')
    expect(poly.contracts.factory).toBe(MELEGA_POLYGON_FACTORY)
    expect(poly.contracts.router).toBe(MELEGA_POLYGON_ROUTER)
    expect(poly.contracts.masterBuilder).toBe(MELEGA_POLYGON_MASTER_BUILDER)
    expect(poly.contracts.vault).toBe(MELEGA_POLYGON_VAULT)
    expect(poly.capabilities.swap).toBe(true)
    expect(poly.capabilities.farms).toBe(true)
    expect(poly.capabilities.pools).toBe(true)
    expect(poly.capabilities.tokens).toBe(true)
    expect(poly.capabilities.liquidityBuilder).toBe(false)
    expect(isMelegaChainLive(137)).toBe(true)
    expect(isMelegaCapabilityEnabled(137, 'swap')).toBe(true)
  })

  it('Router SSOT matches web + smart-router package + registry + V2 adapter', () => {
    expect(WEB_ROUTER[ChainId.POLYGON]).toBe(MELEGA_POLYGON_ROUTER)
    expect(getMelegaRouterAddress(137)).toBe(MELEGA_POLYGON_ROUTER)
    expect(getMelegaFactoryAddress(137)).toBe(MELEGA_POLYGON_FACTORY)
    expect(getV2RouterAddress(137)).toBe(MELEGA_POLYGON_ROUTER)
    const pkg = readFileSync(path.join(REPO, 'packages/smart-router/evm/constants/exchange.ts'), 'utf8')
    expect(pkg).toContain(`[ChainId.POLYGON]: '${MELEGA_POLYGON_ROUTER}'`)
    expect(pkg).not.toMatch(/\[ChainId\.POLYGON\]: '0x3BC722/)
  })

  it('switcher includes Polygon LIVE; ETH/Arb/Avax remain PREPARING', () => {
    // Superseded by Ethereum LIVE — keep Polygon assertions; full LIVE set asserted in ethereumLive.
    expect(isMelegaChainLive(137)).toBe(true)
    expect(getMelegaRouterAddress(137)).toBe(MELEGA_POLYGON_ROUTER)
  })

  it('fee settles native POL at 25% to MELEGA TREASURY', () => {
    expect((DEX_ECONOMIC_AUTHORITY.chainIdsSupported as readonly number[]).includes(137)).toBe(true)
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 137,
    })
    expect(fee.feeAsset).toBe('POL')
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('token registry, logos, farms, pools inventory present', () => {
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    const tokens = list.tokens.filter((t: { chainId: number }) => t.chainId === 137)
    expect(tokens.length).toBeGreaterThanOrEqual(20)
    expect(existsSync(path.join(WEB, 'public/images/137/tokens'))).toBe(true)
    const farms = readFileSync(path.join(REPO, 'packages/farms/constants/137.ts'), 'utf8')
    expect((farms.match(/pid:/g) || []).length).toBeGreaterThanOrEqual(40)
    const pools = readFileSync(path.join(WEB, 'src/config/constants/pools.tsx'), 'utf8')
    expect(pools).toContain('livePools137')
    const syrup = readFileSync(path.join(REPO, 'packages/tokens/src/137.ts'), 'utf8')
    expect(syrup).toMatch(/syrup:[\s\S]*ChainId\.POLYGON/)
    expect(syrup).not.toMatch(/syrup:[\s\S]*ChainId\.BASE/)
  })

  it('explorer + chain badge cover Polygon', () => {
    const badge = readFileSync(path.join(WEB, 'src/components/Logo/MelegaExploreChainBadge.tsx'), 'utf8')
    expect(badge).toContain('137')
    expect(badge).toContain('Polygon')
    const helpers = readFileSync(path.join(WEB, 'src/views/ProjectPage/v1/helpers.ts'), 'utf8')
    expect(helpers).toContain('Polygonscan')
  })
})
