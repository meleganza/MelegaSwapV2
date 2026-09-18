/**
 * MELEGA-DEX-P0-BRIDGE-NETWORK-RECOGNITION
 * Robinhood 4663 / Arc 5042 are valid on /bridge and in the header,
 * without becoming DEX trading chains.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SUPPORT_FARMS, SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import {
  isBridgeOnlyWalletOnBridgePage,
  isMarcoBridgePublicPath,
  isMelegaBridgePageChain,
  isMelegaPublicBridgeSwitcherChain,
  isMelegaPublicTradingSwitcherChain,
  isMelegaRecognizedWalletChain,
  MELEGA_BRIDGE_PAGE_CHAIN_IDS,
  MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS,
  MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS,
  shouldOpenUnsupportedNetworkModal,
} from 'config/publicNetworkSwitchCapabilities'
import { HEADER_CHAIN_COMPACT, headerChainLabel, headerChainTitle, isHeaderNetworkDanger } from 'components/NetworkSwitcher'
import { ARC_CHAIN_ID } from 'lib/marco-bridge/arcChain'
import { ROBINHOOD_CHAIN_ID } from 'lib/marco-bridge/robinhoodChain'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import { isChainSupported } from 'utils/wagmi'

const WEB = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGA-DEX-P0-BRIDGE-NETWORK-RECOGNITION', () => {
  it('/bridge page classification accepts 4663 and 5042 without mutating DEX lists', () => {
    expect(ROBINHOOD_CHAIN_ID).toBe(4663)
    expect(ARC_CHAIN_ID).toBe(5042)
    expect(MARCO_WAVE1_NETWORKS.robinhood.chainId).toBe(4663)
    expect(MARCO_WAVE1_NETWORKS.arc.chainId).toBe(5042)
    expect([...MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS]).toEqual([4663, 5042])
    expect(isMelegaBridgePageChain(4663)).toBe(true)
    expect(isMelegaBridgePageChain(5042)).toBe(true)
    expect(isMelegaBridgePageChain(56)).toBe(true)
    expect(MELEGA_BRIDGE_PAGE_CHAIN_IDS).toEqual(expect.arrayContaining([...SUPPORT_MULTI_CHAINS, 4663, 5042]))
    expect(SUPPORT_MULTI_CHAINS).not.toContain(4663)
    expect(SUPPORT_MULTI_CHAINS).not.toContain(5042)
    expect(SUPPORT_FARMS).not.toContain(4663)
    expect(SUPPORT_FARMS).not.toContain(5042)
    expect(isChainSupported(4663)).toBe(false)
    expect(isChainSupported(5042)).toBe(false)
    expect(isMelegaPublicTradingSwitcherChain(4663)).toBe(false)
    expect(isMelegaPublicTradingSwitcherChain(5042)).toBe(false)
    expect([...MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS]).toEqual([56, 8453, 137, 1])
  })

  it('BridgePage.chains uses the bridge-page list, not SUPPORT_MULTI_CHAINS alone', () => {
    const src = load('pages/bridge/index.tsx')
    expect(src).toContain('MELEGA_BRIDGE_PAGE_CHAIN_IDS')
    expect(src).toContain('BridgePage.chains')
    expect(src).not.toMatch(/BridgePage\.chains\s*=\s*SUPPORT_MULTI_CHAINS/)
  })

  it('suppresses UnsupportedNetworkModal on /bridge for Robinhood and Arc', () => {
    expect(isMarcoBridgePublicPath('/bridge')).toBe(true)
    expect(isMarcoBridgePublicPath('/bridge/')).toBe(true)
    expect(isMarcoBridgePublicPath('/swap')).toBe(false)
    expect(isBridgeOnlyWalletOnBridgePage('/bridge', 4663)).toBe(true)
    expect(isBridgeOnlyWalletOnBridgePage('/bridge', 5042)).toBe(true)
    expect(isBridgeOnlyWalletOnBridgePage('/swap', 4663)).toBe(false)
    expect(isBridgeOnlyWalletOnBridgePage('/bridge', 56)).toBe(false)

    expect(
      shouldOpenUnsupportedNetworkModal({
        pathname: '/bridge',
        chainId: 4663,
        wagmiUnsupported: true,
        isPageNotSupported: true,
      }),
    ).toBe(false)
    expect(
      shouldOpenUnsupportedNetworkModal({
        pathname: '/bridge',
        chainId: 5042,
        wagmiUnsupported: true,
        isPageNotSupported: true,
      }),
    ).toBe(false)
    expect(
      shouldOpenUnsupportedNetworkModal({
        pathname: '/swap',
        chainId: 4663,
        wagmiUnsupported: true,
        isPageNotSupported: true,
      }),
    ).toBe(true)
    expect(
      shouldOpenUnsupportedNetworkModal({
        pathname: '/bridge',
        chainId: 999,
        wagmiUnsupported: true,
        isPageNotSupported: true,
      }),
    ).toBe(true)

    const modal = load('components/NetworkModal/NetworkModal.tsx')
    expect(modal).toContain('shouldOpenUnsupportedNetworkModal')
    expect(modal).toContain('isBridgeOnlyWalletOnBridgePage')
    expect(modal).toContain('allowBridgeOnlyOnBridge')
  })

  it('header resolves Robinhood/Arc without danger and without wagmi foundChain', () => {
    expect(isMelegaRecognizedWalletChain(4663)).toBe(true)
    expect(isMelegaRecognizedWalletChain(5042)).toBe(true)
    expect(isMelegaRecognizedWalletChain(56)).toBe(false)
    expect(isMelegaPublicBridgeSwitcherChain(4663)).toBe(true)
    expect(HEADER_CHAIN_COMPACT[4663]).toBe('Robinhood')
    expect(HEADER_CHAIN_COMPACT[5042]).toBe('Arc')
    expect(headerChainLabel(4663)).toBe('Robinhood')
    expect(headerChainLabel(5042)).toBe('Arc')
    expect(headerChainTitle(4663)).toBe(MARCO_WAVE1_NETWORKS.robinhood.label)
    expect(headerChainTitle(5042)).toBe(MARCO_WAVE1_NETWORKS.arc.label)
    expect(isHeaderNetworkDanger(4663, true)).toBe(false)
    expect(isHeaderNetworkDanger(5042, true)).toBe(false)
    expect(isHeaderNetworkDanger(56, true)).toBe(true)
    expect(isHeaderNetworkDanger(56, false)).toBe(false)

    const switcher = load('components/NetworkSwitcher.tsx')
    expect(switcher).toContain('headerRecognized')
    expect(switcher).toContain('isMelegaRecognizedWalletChain')
    expect(switcher).toContain('isHeaderNetworkDanger')
    expect(switcher).toContain('headerDanger ? \'danger\'')
    expect(switcher).not.toMatch(/variant=\{isLoading \? 'pending' : isWrongNetwork \? 'danger'/)
    expect(switcher).toContain('foundChain')
    expect(switcher).toContain('headerRecognized && displayChainId')
    expect(switcher).toContain('data-testid="header-chain-label"')
    expect(switcher).toContain('data-header-danger')
    expect(switcher).toContain('data-header-chain-id')
  })

  it('useActiveChainId accepts recognized bridge wallet chains as walletTruth', () => {
    const src = load('hooks/useActiveChainId.ts')
    expect(src).toContain('isMelegaRecognizedWalletChain')
    expect(src).toContain('isWalletRecognizedChain')
    expect(src).toContain('walletTruth')
    expect(src).toMatch(/isChainSupported\(walletChainId\) \|\| isMelegaRecognizedWalletChain\(walletChainId\)|isWalletRecognizedChain\(walletChainId\)/)
    expect(src).toContain('isWalletRecognizedChain(+chainId)')
  })

  it('public selector lists stay TRADING 56/8453/137/1 and BRIDGE 4663/5042; ARB/AVAX hidden', () => {
    expect([...MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS]).toEqual([56, 8453, 137, 1])
    expect([...MELEGA_PUBLIC_BRIDGE_SWITCHER_CHAIN_IDS]).toEqual([4663, 5042])
    const modal = load('components/Menu/UserMenu/NetworkSwitchModal.tsx')
    expect(modal).toContain('filterMelegaPublicTradingSwitcherChains')
    expect(modal).toContain('getMelegaPublicBridgeSwitcherRows')
    expect(modal).toContain("t('TRADING')")
    expect(modal).toContain("t('BRIDGE')")
    expect(modal).toContain('onClick={openMarcoBridge}')
    const openBridge = modal.slice(modal.indexOf('const openMarcoBridge'), modal.indexOf('return ('))
    expect(openBridge).toContain('router.push(MARCO_BRIDGE_PUBLIC_PATH)')
    expect(openBridge).not.toContain('switchNetwork')
    expect(openBridge).not.toContain('safePick')
    expect(modal).not.toContain('data-testid="network-card-42161"')
    expect(modal).not.toContain('data-testid="network-card-43114"')
  })
})
