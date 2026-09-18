/**
 * MELEGA-DEX-P0-PUBLIC-NETWORK-CAPABILITIES — public Network Switch only.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { chains } from 'utils/wagmi'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'
import {
  MELEGA_ARB_FACTORY,
  MELEGA_ARB_ROUTER,
  MELEGA_AVAX_FACTORY,
  MELEGA_AVAX_ROUTER,
  MELEGA_CHAIN_REGISTRY,
  getMelegaLiveSwitcherChainIds,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import {
  filterMelegaPublicPreparingChains,
  filterMelegaPublicTradingSwitcherChains,
  getMelegaPublicBridgeSwitcherRows,
  isMelegaPublicBridgeSwitcherChain,
  isMelegaPublicTradingSwitcherChain,
  MARCO_BRIDGE_PUBLIC_PATH,
  MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS,
  MELEGA_PUBLIC_SWITCHER_HIDDEN_CHAIN_IDS,
  MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS,
} from 'config/publicNetworkSwitchCapabilities'
import { ARC_CHAIN_ID } from 'lib/marco-bridge/arcChain'
import { ROBINHOOD_CHAIN_ID } from 'lib/marco-bridge/robinhoodChain'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'

const WEB = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('public Network Switch capabilities', () => {
  it('trading allowlist is exactly BSC, Base, POL, ETH', () => {
    expect([...MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS]).toEqual([56, 8453, 137, 1])
    expect(filterMelegaPublicTradingSwitcherChains(chains).map((chain) => chain.id)).toEqual([56, 8453, 137, 1])
    expect(isMelegaPublicTradingSwitcherChain(56)).toBe(true)
    expect(isMelegaPublicTradingSwitcherChain(42161)).toBe(false)
    expect(isMelegaPublicTradingSwitcherChain(43114)).toBe(false)
    expect(isMelegaPublicTradingSwitcherChain(4663)).toBe(false)
    expect(isMelegaPublicTradingSwitcherChain(5042)).toBe(false)
  })

  it('bridge-only public rows reuse Robinhood 4663 and Arc 5042', () => {
    expect([...MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS]).toEqual([ROBINHOOD_CHAIN_ID, ARC_CHAIN_ID])
    expect([...MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS]).toEqual([4663, 5042])
    const rows = getMelegaPublicBridgeSwitcherRows()
    expect(rows.map((row) => row.chainId)).toEqual([4663, 5042])
    expect(rows[0].id).toBe(MARCO_WAVE1_NETWORKS.robinhood.id)
    expect(rows[1].id).toBe(MARCO_WAVE1_NETWORKS.arc.id)
    expect(isMelegaPublicBridgeSwitcherChain(4663)).toBe(true)
    expect(isMelegaPublicBridgeSwitcherChain(5042)).toBe(true)
    expect(isMelegaPublicBridgeSwitcherChain(56)).toBe(false)
  })

  it('hides ARB and AVAX from public switcher lists without changing internal LIVE registry', () => {
    expect([...MELEGA_PUBLIC_SWITCHER_HIDDEN_CHAIN_IDS]).toEqual([42161, 43114])
    expect(filterMelegaPublicPreparingChains([{ chainId: 42161 }, { chainId: 43114 }, { chainId: 999 }])).toEqual([
      { chainId: 999 },
    ])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161, 43114])
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161, 43114])
    expect(isMelegaChainLive(42161)).toBe(true)
    expect(isMelegaChainLive(43114)).toBe(true)
    const arb = MELEGA_CHAIN_REGISTRY.find((row) => row.chainId === 42161)!
    const avax = MELEGA_CHAIN_REGISTRY.find((row) => row.chainId === 43114)!
    expect(arb.status).toBe('LIVE')
    expect(avax.status).toBe('LIVE')
    expect(arb.contracts.router?.toLowerCase()).toBe(MELEGA_ARB_ROUTER.toLowerCase())
    expect(arb.contracts.factory?.toLowerCase()).toBe(MELEGA_ARB_FACTORY.toLowerCase())
    expect(avax.contracts.router).toBe(MELEGA_AVAX_ROUTER)
    expect(avax.contracts.factory).toBe(MELEGA_AVAX_FACTORY)
  })

  it('modal source: TRADING cards call switchNetwork; BRIDGE cards open /bridge only', () => {
    const modal = load('components/Menu/UserMenu/NetworkSwitchModal.tsx')
    expect(modal).toContain('filterMelegaPublicTradingSwitcherChains')
    expect(modal).toContain('getMelegaPublicBridgeSwitcherRows')
    expect(modal).toContain('data-network-switch-trading')
    expect(modal).toContain('data-network-switch-bridge')
    expect(modal).toContain("t('TRADING')")
    expect(modal).toContain("t('Trading ready')")
    expect(modal).toContain("t('BRIDGE')")
    expect(modal).toContain("t('MARCO transfer available')")
    expect(modal).toContain("t('BRIDGE LIVE')")
    expect(modal).toContain("t('MARCO transfer available · DEX trading not yet enabled')")
    expect(modal).toContain('data-capability="trading"')
    expect(modal).toContain('data-capability="bridge"')
    expect(modal).toContain('onClick={() => safePick(chain.id)}')
    expect(modal).toContain('onClick={openMarcoBridge}')
    expect(modal).toContain('MARCO_BRIDGE_PUBLIC_PATH')
    expect(MARCO_BRIDGE_PUBLIC_PATH).toBe('/bridge')
    expect(modal).toContain('void router.push(MARCO_BRIDGE_PUBLIC_PATH)')

    const openBridge = modal.slice(modal.indexOf('const openMarcoBridge'), modal.indexOf('return ('))
    expect(openBridge).toContain('router.push(MARCO_BRIDGE_PUBLIC_PATH)')
    expect(openBridge).not.toContain('switchNetwork')
    expect(openBridge).not.toContain('safePick')

    const bridgeSection = modal.slice(modal.indexOf('data-testid="network-switch-bridge"'))
    const bridgeBlock = bridgeSection.slice(0, bridgeSection.indexOf('network-switch-preparing'))
    expect(bridgeBlock).not.toContain('Trading ready')
    expect(bridgeBlock).not.toContain('safePick')
    expect(bridgeBlock).not.toContain('switchNetwork(')
    expect(bridgeBlock).toContain('BRIDGE LIVE')
    expect(bridgeBlock).toContain('onClick={openMarcoBridge}')

    const tradingSection = modal.slice(
      modal.indexOf('data-testid="network-switch-live"'),
      modal.indexOf('data-testid="network-switch-bridge"'),
    )
    expect(tradingSection).toContain('safePick')
    expect(tradingSection).toContain('Trading ready')
    expect(tradingSection).not.toContain('BRIDGE LIVE')
    expect(tradingSection).toContain("active ? t('Active') : t('LIVE')")
  })

  it('public dropdown also hides ARB/AVAX without changing WrongNetworkSelect internals', () => {
    const switcher = load('components/NetworkSwitcher.tsx')
    const select = switcher.slice(switcher.indexOf('const NetworkSelect'), switcher.indexOf('const WrongNetworkSelect'))
    expect(select).toContain('filterMelegaPublicTradingSwitcherChains')
    expect(select).toContain('filterMelegaPublicPreparingChains')
    expect(select).not.toContain('filterMelegaVisibleSwitcherChains')
    const wrong = switcher.slice(switcher.indexOf('const WrongNetworkSelect'))
    expect(wrong).toContain('filterMelegaVisibleSwitcherChains')
  })
})
