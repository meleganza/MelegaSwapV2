import { getAddress } from '@ethersproject/address'
import { readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it } from 'vitest'
import {
  ARC_CHAIN_ID,
  ARC_CHAIN_ID_HEX,
  ARC_EXPLORER_URL,
  ARC_LAYERZERO_EID,
  ARC_NATIVE_CURRENCY,
  ARC_RPC_URL,
  ARC_WALLET_NETWORK,
  FORBIDDEN_ARC_TESTNET_CHAIN_ID,
  FORBIDDEN_ARC_TESTNET_EID,
} from '../arcChain'
import {
  applyCanonicalBnbSolanaApplicationGate,
  CANONICAL_ARC_BNB_GATE_REASON,
  CANONICAL_BNB_ARC_GATE_REASON,
} from '../canonicalBnbSolanaGate'
import { isRouteExecutable, routeExecutionBlockers } from '../executableRoutes'
import { evaluateNativeFunds, isNativeFundsBlocked } from '../nativeFunds'
import { assertCanonicalRouteAuthority, type CanonicalMmnNetwork, type CanonicalMmnRouteState } from '../routeAuthority'
import { planMarcoBridgeRoute } from '../routePolicy'
import { buildMarcoBridgeTransactions, OFT_SEND_IFACE } from '../transactionBuilder'
import type { MarcoBridgeQuote } from '../types'
import { MARCO_WAVE1_NETWORKS, localRouteActivationEnabled } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const LIB_ROOT = join(dirname(new URL(import.meta.url).pathname), '..')

const mmnWithoutArc = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-26T00:00:00.000Z',
    hub: 'bnb' as const,
    global_execution_enabled: false,
    networks: [
      {
        id: 'bnb' as const,
        name: 'BNB Smart Chain',
        family: 'evm' as const,
        chain_id: 56,
        eid: 30102,
        model: 'evm_oft_adapter' as const,
        token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
        requires_approval: true,
        paused: false,
      },
      {
        id: 'base' as const,
        name: 'Base',
        family: 'evm' as const,
        chain_id: 8453,
        eid: 30184,
        model: 'evm_oft' as const,
        token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.base.endpointContract,
        requires_approval: false,
        paused: false,
      },
      {
        id: 'solana' as const,
        name: 'Solana',
        family: 'solana' as const,
        chain_id: null,
        eid: 30168,
        model: 'solana_oft' as const,
        token: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
        token_decimals: 9,
        endpoint_contract: MARCO_WAVE1_NETWORKS.solana.endpointContract,
        requires_approval: false,
        paused: false,
      },
      {
        id: 'robinhood' as const,
        name: 'Robinhood Chain',
        family: 'evm' as const,
        chain_id: 4663,
        eid: 30416,
        model: 'evm_oft' as const,
        token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.robinhood.endpointContract,
        requires_approval: false,
        paused: false,
      },
    ] as CanonicalMmnNetwork[],
    routes: [
      ['bnb', 'base'],
      ['base', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
    ].map(([from, to]) => ({
      from,
      to,
      certified: true,
      publicly_active: false,
      execution_enabled: false,
      paused: false,
      reason: 'certified',
    })),
  },
})

const overlay = (payload = mmnWithoutArc()): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(payload), { solanaStorePaused: false })

const quote = (label: string, symbol: 'BNB' | 'USDC' = 'BNB'): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei: '72607980676756',
  nativeFeeSymbol: symbol,
  routeLabel: label,
  quotedAt: '2026-09-18T00:00:00.000Z',
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

function listRuntimeFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue
      listRuntimeFiles(full, acc)
    } else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

describe('Arc Mainnet public launch', () => {
  it('binds the certified Arc Mainnet identity and USDC-native wallet chain', () => {
    expect(MARCO_WAVE1_NETWORKS.arc).toMatchObject({
      id: 'arc',
      chainId: ARC_CHAIN_ID,
      layerZeroEid: ARC_LAYERZERO_EID,
      marcoIdentity: '0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a265',
      endpointContract: '0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a265',
      nativeFeeSymbol: 'USDC',
      walletFamily: 'evm',
      explorerUrl: ARC_EXPLORER_URL,
    })
    expect(ARC_CHAIN_ID).toBe(5042)
    expect(ARC_CHAIN_ID_HEX).toBe('0x13b2')
    expect(ARC_LAYERZERO_EID).toBe(30417)
    expect(ARC_RPC_URL).toBe('https://rpc.mainnet.arc.io')
    expect(ARC_NATIVE_CURRENCY).toEqual({ name: 'USDC', symbol: 'USDC', decimals: 18 })
    expect(ARC_WALLET_NETWORK).toMatchObject({
      chainId: '0x13b2',
      chainName: 'Arc',
      nativeCurrency: { symbol: 'USDC', decimals: 18 },
      rpcUrls: ['https://rpc.mainnet.arc.io'],
      blockExplorerUrls: ['https://explorer.arc.io'],
    })
    expect(ARC_WALLET_NETWORK.nativeCurrency.symbol).not.toBe('ETH')
  })

  it('preserves the already-live BNB, Base, Solana, and Robinhood bindings', () => {
    expect(MARCO_WAVE1_NETWORKS.bnb).toMatchObject({
      chainId: 56,
      layerZeroEid: 30102,
      marcoIdentity: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      endpointContract: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E',
    })
    expect(MARCO_WAVE1_NETWORKS.base).toMatchObject({ chainId: 8453, layerZeroEid: 30184 })
    expect(MARCO_WAVE1_NETWORKS.solana).toMatchObject({ chainId: null, layerZeroEid: 30168 })
    expect(MARCO_WAVE1_NETWORKS.robinhood).toMatchObject({ chainId: 4663, layerZeroEid: 30416 })
  })

  it('activates only BNB↔Arc when live MMN has not published Arc yet', () => {
    const accepted = assertCanonicalRouteAuthority(mmnWithoutArc())
    expect(accepted.networks.some((network) => network.id === 'arc')).toBe(false)

    const live = overlay()
    const forward = live.routes.find((route) => route.from === 'bnb' && route.to === 'arc')
    const reverse = live.routes.find((route) => route.from === 'arc' && route.to === 'bnb')
    expect(live.networks.find((network) => network.id === 'arc')).toMatchObject({
      chain_id: 5042,
      eid: 30417,
      token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
      endpoint_contract: MARCO_WAVE1_NETWORKS.arc.endpointContract,
      requires_approval: false,
    })
    expect(forward).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
      reason: CANONICAL_BNB_ARC_GATE_REASON,
    })
    expect(reverse).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
      reason: CANONICAL_ARC_BNB_GATE_REASON,
    })
    expect(isRouteExecutable('bnb', 'arc', live)).toBe(true)
    expect(isRouteExecutable('arc', 'bnb', live)).toBe(true)
    expect(routeExecutionBlockers('bnb', 'arc', live)).toEqual([])
    expect(isRouteExecutable('bnb', 'robinhood', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'solana', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    expect(isRouteExecutable('arc', 'base', live)).toBe(false)
    expect(isRouteExecutable('arc', 'solana', live)).toBe(false)
    expect(isRouteExecutable('arc', 'robinhood', live)).toBe(false)
    expect(isRouteExecutable('base', 'arc', live)).toBe(false)
    expect(localRouteActivationEnabled('bnb', 'arc')).toBe(true)
    expect(localRouteActivationEnabled('arc', 'base')).toBe(false)
    expect(planMarcoBridgeRoute('bnb', 'arc')).toMatchObject({ kind: 'direct', legs: ['bnb', 'arc'] })
    expect(planMarcoBridgeRoute('base', 'arc')).toMatchObject({ kind: 'via-bnb', enabled: false })
  })

  it('builds BNB→Arc and Arc→BNB through the existing unsigned send path', () => {
    const live = overlay()
    const forward = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'arc', amount: '0.000001', sourceWallet: evm, destinationWallet: evm, allowanceLD: '0' },
      quote('BNB → Arc'),
      live,
    )
    expect(forward.executable).toBe(true)
    expect(forward.sendParam.dstEid).toBe(30417)
    expect(forward.transactions[0]).toMatchObject({ purpose: 'approve', chainId: 56 })
    expect(forward.transactions[1]).toMatchObject({
      purpose: 'oft_send',
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      nativeFeeSymbol: 'BNB',
    })
    const decodedForward = OFT_SEND_IFACE.decodeFunctionData('send', (forward.transactions[1] as { data: string }).data)
    expect(decodedForward.sendParam.dstEid).toBe(30417)

    const reverse = buildMarcoBridgeTransactions(
      { from: 'arc', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
      quote('Arc → BNB', 'USDC'),
      live,
    )
    expect(reverse.executable).toBe(true)
    expect(reverse.approvalRequired).toBe(false)
    expect(reverse.sendParam.dstEid).toBe(30102)
    expect(reverse.transactions).toHaveLength(1)
    expect(reverse.transactions[0]).toMatchObject({
      purpose: 'oft_send',
      chainId: 5042,
      to: getAddress(MARCO_WAVE1_NETWORKS.arc.endpointContract),
      nativeFeeSymbol: 'USDC',
    })
    const decodedReverse = OFT_SEND_IFACE.decodeFunctionData('send', (reverse.transactions[0] as { data: string }).data)
    expect(decodedReverse.sendParam.dstEid).toBe(30102)
  })

  it('labels Arc native shortfalls as USDC, not ETH', () => {
    const shortfall = evaluateNativeFunds({
      from: 'arc',
      balanceWei: '1',
      nativeFeeWei: '72607980676756',
      gasPriceWei: '1000000000',
      approvalRequired: false,
    })
    expect(isNativeFundsBlocked(shortfall)).toBe(true)
    if (isNativeFundsBlocked(shortfall)) {
      expect(shortfall.code).toBe('INSUFFICIENT_GAS')
      expect(shortfall.reason).toBe('Insufficient native USDC gas on Arc.')
      expect(shortfall.reason).not.toMatch(/ETH/)
    }
  })

  it('fails closed on Arc testnet leakage and wrong Arc bindings', () => {
    const testnet = mmnWithoutArc()
    testnet.data.networks.push({
      id: 'arc' as const,
      name: 'Arc',
      family: 'evm' as const,
      chain_id: FORBIDDEN_ARC_TESTNET_CHAIN_ID,
      eid: FORBIDDEN_ARC_TESTNET_EID,
      model: 'evm_oft' as const,
      token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.arc.endpointContract,
      requires_approval: false,
      paused: false,
    })
    expect(() => assertCanonicalRouteAuthority(testnet)).toThrow(/5042002|40434/)

    const wrongToken = mmnWithoutArc()
    wrongToken.data.networks.push({
      id: 'arc' as const,
      name: 'Arc',
      family: 'evm' as const,
      chain_id: 5042,
      eid: 30417,
      model: 'evm_oft' as const,
      token: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      requires_approval: false,
      paused: false,
    })
    expect(() => assertCanonicalRouteAuthority(wrongToken)).toThrow(/mismatch|Retired BNB adapter/)
  })

  it('reuses the same workspace for /bridge and the homepage widget', () => {
    const workspace = readFileSync(join(LIB_ROOT, '../../views/MarcoBridge/MarcoBridgeWorkspace.tsx'), 'utf8')
    const homepage = readFileSync(join(LIB_ROOT, '../../views/HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    const bridgePage = readFileSync(join(LIB_ROOT, '../../pages/bridge/index.tsx'), 'utf8')
    expect(bridgePage).toContain('views/MarcoBridge/MarcoBridgeWorkspace')
    expect(homepage).toContain("import('views/MarcoBridge/MarcoBridgeWorkspace')")
    expect(homepage).toContain('module.MarcoBridgePanel')
    expect(workspace).toContain('ensureArcWalletNetwork')
    expect(workspace.replace(/\{' '\}/g, ' ').replace(/\s+/g, ' ')).toContain(
      'native gas {MARCO_WAVE1_NETWORKS.arc.nativeFeeSymbol}',
    )
    expect(workspace).toContain('Object.values(MARCO_WAVE1_NETWORKS)')
  })

  it('keeps testnet 5042002 / EID 40434 out of production marco-bridge paths', () => {
    const files = [
      ...listRuntimeFiles(LIB_ROOT),
      join(LIB_ROOT, '../../views/MarcoBridge/MarcoBridgeWorkspace.tsx'),
      join(LIB_ROOT, '../../pages/api/marco-bridge/quote.ts'),
      join(LIB_ROOT, '../../pages/api/marco-bridge/simulate.ts'),
    ]
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      if (file.endsWith('arcChain.ts') || file.endsWith('routeAuthority.ts')) {
        expect(source).toContain(String(FORBIDDEN_ARC_TESTNET_CHAIN_ID))
        expect(source).toMatch(/forbidden/i)
        continue
      }
      expect(source, file).not.toContain(String(FORBIDDEN_ARC_TESTNET_CHAIN_ID))
      expect(source, file).not.toContain(String(FORBIDDEN_ARC_TESTNET_EID))
      expect(source, file).not.toContain('rpc.testnet.arc.io')
      expect(source, file).not.toMatch(/DeadDVN/)
    }
  })
})
