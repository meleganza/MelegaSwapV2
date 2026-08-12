import { BigNumber } from '@ethersproject/bignumber'
import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { canonicalizeBridgeAmount, formatDecimalAmount } from '../amounts'
import { validateDestinationWallet } from '../address'
import { bridgeStatusMessage, advanceBridgeTracking } from '../lifecycle'
import { assertBridgePreflight } from '../preflight'
import { requirePublicExecution, resolveCertifiedDirectRoute } from '../routePolicy'
import { assertFreshBridgeQuote, failClosedMarcoBridgeService } from '../service'
import {
  buildEvmApprovalCall,
  buildEvmQuoteCall,
  buildEvmSendCall,
  buildSolanaInstructionPlan,
  destinationWalletToBytes32,
} from '../transactions'
import type { MarcoBridgeIntent, MarcoBridgeQuote, MarcoBridgeTracking } from '../types'
import {
  MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED,
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_ROUTES,
  getMarcoBridgeRoute,
  isMarcoBridgeExecutionEnabled,
} from '../wave1Registry'

const EVM_WALLET = '0x000000000000000000000000000000000000dEaD'
const SOLANA_WALLET = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'

function quote(overrides: Partial<MarcoBridgeQuote> = {}): MarcoBridgeQuote {
  const amount = canonicalizeBridgeAmount('1', 18, 18)
  return {
    intent: { from: 'bnb', to: 'base', sourceWallet: EVM_WALLET, destinationWallet: EVM_WALLET, amount: '1' },
    amount,
    nativeFee: BigNumber.from(10),
    lzTokenFee: BigNumber.from(0),
    nativeFeeSymbol: 'BNB',
    quotedAt: 1_000,
    quoteId: 'quote-1',
    ...overrides,
  }
}

describe('MARCO Wave-1 canonical mainnet registry', () => {
  it('binds exact certified identities and chain metadata', () => {
    expect(MARCO_WAVE1_NETWORKS.bnb).toMatchObject({ chainId: 56, layerZeroEid: 30102, decimals: 18 })
    expect(MARCO_WAVE1_NETWORKS.bnb.identity).toEqual({
      consumerTokenOrMint: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      protocolContractOrStore: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E',
    })
    expect(MARCO_WAVE1_NETWORKS.base).toMatchObject({ chainId: 8453, layerZeroEid: 30184, decimals: 18 })
    expect(MARCO_WAVE1_NETWORKS.base.identity.consumerTokenOrMint).toBe('0xa2c8b941542AE0599774D1661CB7B773BC0e79C7')
    expect(MARCO_WAVE1_NETWORKS.solana).toMatchObject({
      chainId: null,
      layerZeroEid: 30168,
      decimals: 9,
      protectivePaused: true,
    })
    expect(MARCO_WAVE1_NETWORKS.solana.identity).toEqual({
      consumerTokenOrMint: '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF',
      protocolContractOrStore: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
    })
    expect(MARCO_WAVE1_NETWORKS.robinhood).toMatchObject({ chainId: 4663, layerZeroEid: 30416, decimals: 18 })
    expect(MARCO_WAVE1_NETWORKS.robinhood.identity.consumerTokenOrMint).toBe(
      '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
    )
  })

  it('rejects historical cross-chain identity aliases and wrong Robinhood chain', () => {
    expect(MARCO_WAVE1_NETWORKS.base.identity.consumerTokenOrMint.toLowerCase()).not.toBe(
      MARCO_WAVE1_NETWORKS.bnb.identity.protocolContractOrStore.toLowerCase(),
    )
    expect(MARCO_WAVE1_NETWORKS.robinhood.identity.consumerTokenOrMint.toLowerCase()).not.toBe(
      MARCO_WAVE1_NETWORKS.bnb.identity.protocolContractOrStore.toLowerCase(),
    )
    expect(Object.values(MARCO_WAVE1_NETWORKS).some((network) => network.chainId === 62831)).toBe(false)
  })

  it('exposes only six certified hub-and-spoke direct routes', () => {
    expect(MARCO_WAVE1_ROUTES.map((route) => route.id)).toEqual([
      'bnb-base',
      'base-bnb',
      'bnb-solana',
      'solana-bnb',
      'bnb-robinhood',
      'robinhood-bnb',
    ])
    expect(getMarcoBridgeRoute('base', 'solana')).toBeNull()
    expect(() => resolveCertifiedDirectRoute({ from: 'base', to: 'robinhood' })).toThrow(/through BNB/)
  })

  it('keeps every certified route fail-closed before explicit activation', () => {
    expect(MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED).toBe(false)
    expect(MARCO_WAVE1_ROUTES.every((route) => !isMarcoBridgeExecutionEnabled(route))).toBe(true)
    expect(() => requirePublicExecution(MARCO_WAVE1_ROUTES[0])).toThrow(/not publicly active/)
  })
})

describe('MARCO bridge amounts, wallets and transaction binding', () => {
  it('converts 18-decimal EVM to 9-decimal Solana without shared-decimal dust', () => {
    const amount = canonicalizeBridgeAmount('1.123456789123456789', 18, 9)
    expect(amount.amountSD.toString()).toBe('1123456')
    expect(formatDecimalAmount(amount.receiveLD, 9, 9)).toBe('1.123456')
    expect(amount.dustLD.toString()).toBe('789123456789')
  })

  it('converts 9-decimal Solana to 18-decimal EVM without minting dust', () => {
    const amount = canonicalizeBridgeAmount('4.987654321', 9, 18)
    expect(amount.amountSD.toString()).toBe('4987654')
    expect(formatDecimalAmount(amount.receiveLD, 18)).toBe('4.987654')
    expect(amount.dustLD.toString()).toBe('321')
  })

  it('requires wallet-family-correct explicit destinations', () => {
    expect(validateDestinationWallet(EVM_WALLET, 'evm')).toBe(EVM_WALLET)
    expect(validateDestinationWallet(SOLANA_WALLET, 'solana')).toBe(SOLANA_WALLET)
    expect(() => validateDestinationWallet(EVM_WALLET, 'solana')).toThrow(/Solana/)
    expect(() => validateDestinationWallet(SOLANA_WALLET, 'evm')).toThrow(/EVM/)
  })

  it('constructs EVM quote, BNB approval and send against canonical contracts', () => {
    const bridgeQuote = quote()
    expect(buildEvmQuoteCall('bnb', 'base', EVM_WALLET, bridgeQuote.amount)).toMatchObject({
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.identity.protocolContractOrStore,
    })
    expect(buildEvmApprovalCall('bnb', bridgeQuote.amount.sendLD)).toMatchObject({
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.identity.consumerTokenOrMint,
    })
    expect(buildEvmApprovalCall('base', bridgeQuote.amount.sendLD)).toBeNull()
    expect(buildEvmSendCall(bridgeQuote)).toMatchObject({
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.identity.protocolContractOrStore,
      value: BigNumber.from(10),
    })
  })

  it('binds Base and Robinhood source calls to their canonical OFTs', () => {
    const amount = canonicalizeBridgeAmount('1', 18, 18)
    expect(buildEvmQuoteCall('base', 'bnb', EVM_WALLET, amount)).toMatchObject({
      chainId: 8453,
      to: MARCO_WAVE1_NETWORKS.base.identity.protocolContractOrStore,
    })
    expect(buildEvmQuoteCall('robinhood', 'bnb', EVM_WALLET, amount)).toMatchObject({
      chainId: 4663,
      to: MARCO_WAVE1_NETWORKS.robinhood.identity.protocolContractOrStore,
    })
    const robinhoodQuote = quote({
      intent: { from: 'robinhood', to: 'bnb', sourceWallet: EVM_WALLET, destinationWallet: EVM_WALLET, amount: '1' },
    })
    expect(buildEvmSendCall(robinhoodQuote)).toMatchObject({
      chainId: 4663,
      to: MARCO_WAVE1_NETWORKS.robinhood.identity.protocolContractOrStore,
    })
  })

  it('encodes EVM and Solana destinations as explicit bytes32 recipients', () => {
    expect(destinationWalletToBytes32('base', EVM_WALLET)).toHaveLength(66)
    expect(destinationWalletToBytes32('solana', SOLANA_WALLET)).toHaveLength(66)
    expect(destinationWalletToBytes32('base', EVM_WALLET)).not.toBe(destinationWalletToBytes32('solana', SOLANA_WALLET))
  })

  it('binds Solana plans to the canonical OFT Store without claiming an executable program', () => {
    const amount = canonicalizeBridgeAmount('1.5', 9, 18)
    const solanaQuote = quote({
      intent: { from: 'solana', to: 'bnb', sourceWallet: SOLANA_WALLET, destinationWallet: EVM_WALLET, amount: '1.5' },
      amount,
      nativeFeeSymbol: 'SOL',
    })
    expect(buildSolanaInstructionPlan(solanaQuote)).toMatchObject({
      oftStore: MARCO_WAVE1_NETWORKS.solana.identity.protocolContractOrStore,
      destinationEid: 30102,
      quoteId: 'quote-1',
    })
  })

  it('fails closed on wrong source network, insufficient gas and MARCO', () => {
    const bridgeQuote = quote()
    const basePreflight = {
      connectedWalletFamily: 'evm' as const,
      connectedChainId: 8453,
      nativeBalance: BigNumber.from(100),
      marcoBalance: bridgeQuote.amount.sendLD,
    }
    expect(() => assertBridgePreflight(bridgeQuote, basePreflight)).toThrow(/Switch/)
    expect(() =>
      assertBridgePreflight(bridgeQuote, { ...basePreflight, connectedChainId: 56, nativeBalance: BigNumber.from(0) }),
    ).toThrow(/Insufficient BNB/)
    expect(() =>
      assertBridgePreflight(bridgeQuote, { ...basePreflight, connectedChainId: 56, marcoBalance: BigNumber.from(0) }),
    ).toThrow(/Insufficient MARCO/)
  })

  it('requires a fresh quote and a bound delivery transport', async () => {
    expect(() => assertFreshBridgeQuote(quote(), 31_001)).toThrow(/expired/)
    await expect(failClosedMarcoBridgeService.track('0xguid')).rejects.toThrow(/not publicly bound/)
  })
})

describe('same-GUID delivery lifecycle', () => {
  const initial: MarcoBridgeTracking = {
    guid: '0xguid',
    status: 'SOURCE_CONFIRMED',
    sourceTransactionHash: '0xsource',
    updatedAt: 1,
  }

  it('advances the same GUID and never suggests resubmission while pending', () => {
    const next = advanceBridgeTracking(initial, { guid: '0xguid', status: 'CROSS_CHAIN_VERIFICATION' }, 2)
    expect(next.status).toBe('CROSS_CHAIN_VERIFICATION')
    expect(bridgeStatusMessage(next)).toContain('Do not resend')
    expect(advanceBridgeTracking(next, { guid: '0xguid', status: 'SOURCE_CONFIRMED' }, 3)).toEqual(next)
  })

  it('rejects a tracker response that changes GUID', () => {
    expect(() => advanceBridgeTracking(initial, { guid: 'other', status: 'MARCO_DELIVERED' })).toThrow(/GUID changed/)
  })

  it('reaches delivered only on the same source GUID', () => {
    const delivered = advanceBridgeTracking(
      initial,
      {
        guid: '0xguid',
        status: 'MARCO_DELIVERED',
        destinationTransactionHash: '0xdestination',
      },
      4,
    )
    expect(delivered).toMatchObject({
      guid: '0xguid',
      sourceTransactionHash: '0xsource',
      destinationTransactionHash: '0xdestination',
      status: 'MARCO_DELIVERED',
    })
    expect(bridgeStatusMessage(delivered)).toBe('MARCO delivered.')
  })
})

describe('shared responsive MARCO Bridge product shell', () => {
  const readSource = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8')

  it('keeps exactly the approved SMART SWAP and BRIDGE folder tabs', () => {
    const source = readSource('src/views/MarcoBridge/SmartSwapBridgeTabs.tsx')
    expect(source).toContain("export type TradeWorkspaceTab = 'swap' | 'bridge'")
    expect(source).toContain('SMART SWAP')
    expect(source).toContain('BRIDGE')
    expect(source).not.toContain('EARN')
  })

  it('reuses the same bridge workspace in Home, Trade and Project surfaces', () => {
    for (const relativePath of [
      'src/views/HomeTrade/HomeSwapPanel.tsx',
      'src/views/Trade/TradeCockpit.tsx',
      'src/views/ProjectPage/v1/ProjectTradingEmbed.tsx',
    ]) {
      const source = readSource(relativePath)
      expect(source).toContain("import('views/MarcoBridge/MarcoBridgeWorkspace')")
      expect(source).toContain('<MarcoBridgeWorkspace />')
    }
  })

  it('collapses the route selector on mobile and keeps destination wallet explicit', () => {
    const source = readSource('src/views/MarcoBridge/MarcoBridgeWorkspace.tsx')
    expect(source).toContain('@media (max-width: 575px)')
    expect(source).toContain('grid-template-columns: 1fr')
    expect(source).toContain('Destination wallet')
    expect(source).toContain('Use connected destination wallet')
  })
})
