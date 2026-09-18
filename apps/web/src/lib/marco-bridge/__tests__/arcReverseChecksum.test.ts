import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { ethers } from 'ethers'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it, vi } from 'vitest'
import { normalizeCanonicalEvmAddress } from '../canonicalEvmAddress'
import { applyCanonicalBnbSolanaApplicationGate } from '../canonicalBnbSolanaGate'
import { isRouteExecutable } from '../executableRoutes'
import { readOnlyMarcoBridgeQuote } from '../quoteTransport'
import { assertCanonicalRouteAuthority, type CanonicalMmnNetwork, type CanonicalMmnRouteState } from '../routeAuthority'
import { buildMarcoBridgeTransactions } from '../transactionBuilder'
import type { MarcoBridgeQuote } from '../types'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

/** Exact invalid mixed-case Arc OFT emitted by marco.melega.ai. */
const PRODUCTION_INVALID_ARC = '0x30eB6f2878f60ba0Ed6418bfe7CaDcd0f475a265'
const CANONICAL_ARC = '0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a265'
const evm = '0x1111111111111111111111111111111111111111'
const LIB_ROOT = join(dirname(new URL(import.meta.url).pathname), '..')

const OFT_QUOTE_ABI = [
  'function quoteSend((uint32 dstEid,bytes32 to,uint256 amountLD,uint256 minAmountLD,bytes extraOptions,bytes composeMsg,bytes oftCmd) sendParam,bool payInLzToken) view returns ((uint256 nativeFee,uint256 lzTokenFee) msgFee)',
]

function mmnNetwork(
  id: keyof typeof MARCO_WAVE1_NETWORKS,
  overrides: Partial<CanonicalMmnNetwork> = {},
): CanonicalMmnNetwork {
  const network = MARCO_WAVE1_NETWORKS[id]
  return {
    id,
    name: network.label,
    family: network.walletFamily,
    chain_id: network.chainId,
    eid: network.layerZeroEid,
    model: id === 'bnb' ? 'evm_oft_adapter' : id === 'solana' ? 'solana_oft' : 'evm_oft',
    token: network.marcoIdentity,
    token_decimals: network.tokenDecimals,
    endpoint_contract: network.endpointContract,
    requires_approval: id === 'bnb',
    paused: false,
    ...overrides,
  }
}

const mmnWithProductionArc = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-09-18T00:00:00.000Z',
    hub: 'bnb' as const,
    global_execution_enabled: false,
    networks: [
      mmnNetwork('bnb'),
      mmnNetwork('base'),
      mmnNetwork('solana'),
      mmnNetwork('robinhood'),
      mmnNetwork('arc', {
        token: PRODUCTION_INVALID_ARC,
        endpoint_contract: PRODUCTION_INVALID_ARC,
        requires_approval: false,
      }),
    ],
    routes: [
      ['bnb', 'base'],
      ['base', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
      ['bnb', 'arc'],
      ['arc', 'bnb'],
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

const liveAuthority = (payload = mmnWithProductionArc()): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(payload), { solanaStorePaused: false })

const quote = (label: string, symbol: 'BNB' | 'ETH' | 'USDC' = 'BNB'): MarcoBridgeQuote => ({
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

describe('Arc→BNB invalid mixed-case checksum P0', () => {
  it('reproduces the production ethers checksum throw on the exact mixed-case Arc address', () => {
    expect(PRODUCTION_INVALID_ARC).toBe('0x30eB6f2878f60ba0Ed6418bfe7CaDcd0f475a265')
    expect(PRODUCTION_INVALID_ARC.toLowerCase()).toBe(CANONICAL_ARC)
    expect(() => getAddress(PRODUCTION_INVALID_ARC)).toThrow(/bad address checksum/)
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:9')
    const unresolved = new ethers.Contract(PRODUCTION_INVALID_ARC, OFT_QUOTE_ABI, provider)
    expect(unresolved.address).toBe(PRODUCTION_INVALID_ARC)
    expect(() => getAddress(unresolved.address)).toThrow(/bad address checksum/)
  })

  it('keeps case-insensitive identity validation and does not rewrite the MMN payload', () => {
    const accepted = assertCanonicalRouteAuthority(mmnWithProductionArc())
    const arc = accepted.networks.find((network) => network.id === 'arc')
    expect(arc?.token).toBe(PRODUCTION_INVALID_ARC)
    expect(arc?.endpoint_contract).toBe(PRODUCTION_INVALID_ARC)

    const wrong = mmnWithProductionArc()
    const arcRow = wrong.data.networks.find((network) => network.id === 'arc')
    if (!arcRow) throw new Error('expected Arc row')
    arcRow.token = '0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a266'
    arcRow.endpoint_contract = '0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a266'
    expect(() => assertCanonicalRouteAuthority(wrong)).toThrow(/binding mismatch/)
  })

  it('normalizes the exact mixed-case Arc address for quote reader and ethers.Contract', async () => {
    const checksummed = normalizeCanonicalEvmAddress(PRODUCTION_INVALID_ARC)
    expect(checksummed).toBe(getAddress(CANONICAL_ARC))
    expect(checksummed).toBe('0x30Eb6f2878f60Ba0eD6418BFE7CAdCd0F475A265')
    const readerContract = new ethers.Contract(checksummed, OFT_QUOTE_ABI)
    expect(readerContract.address).toBe(checksummed)

    const quoteSend = vi.fn().mockResolvedValue({ nativeFee: BigNumber.from('72607980676756') })
    const quoteOft = vi.fn().mockResolvedValue({ amountReceivedLD: BigNumber.from('1000000000000') })
    const live = await readOnlyMarcoBridgeQuote(
      { from: 'arc', to: 'bnb', amount: '0.000001', destinationWallet: evm },
      liveAuthority(),
      { quoteSend, quoteOft },
      '2026-09-18T00:00:00.000Z',
    )

    expect(quoteSend).toHaveBeenCalledWith(checksummed, expect.objectContaining({ dstEid: 30102 }))
    expect(quoteOft).toHaveBeenCalledWith(checksummed, expect.objectContaining({ dstEid: 30102 }))
    expect(live).toMatchObject({
      live: true,
      nativeFeeSymbol: 'USDC',
      routeLabel: 'Arc → BNB',
      publiclyActive: true,
      executionEnabled: true,
    })
  })

  it('builds Arc→BNB without a checksum throw and leaves BNB / Base / Robinhood unchanged', () => {
    const live = liveAuthority()
    const checksummed = normalizeCanonicalEvmAddress(PRODUCTION_INVALID_ARC)

    expect(() =>
      buildMarcoBridgeTransactions(
        { from: 'arc', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
        quote('Arc → BNB', 'USDC'),
        live,
      ),
    ).not.toThrow()

    const reverse = buildMarcoBridgeTransactions(
      { from: 'arc', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
      quote('Arc → BNB', 'USDC'),
      live,
    )
    expect(reverse.executable).toBe(true)
    expect(reverse.approvalRequired).toBe(false)
    expect(reverse.sendParam.dstEid).toBe(30102)
    expect(reverse.transactions[0]).toMatchObject({
      purpose: 'oft_send',
      chainId: 5042,
      to: checksummed,
      nativeFeeSymbol: 'USDC',
    })

    const bnbRobinhood = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'robinhood', amount: '0.000001', sourceWallet: evm, destinationWallet: evm, allowanceLD: '0' },
      quote('BNB → Robinhood'),
      live,
    )
    expect(bnbRobinhood.executable).toBe(true)
    expect(bnbRobinhood.transactions[0]).toMatchObject({
      purpose: 'approve',
      to: getAddress(MARCO_WAVE1_NETWORKS.bnb.marcoIdentity),
    })
    expect(bnbRobinhood.transactions[1]).toMatchObject({
      purpose: 'oft_send',
      chainId: 56,
      to: getAddress(MARCO_WAVE1_NETWORKS.bnb.endpointContract),
    })

    const robinhoodBnb = buildMarcoBridgeTransactions(
      { from: 'robinhood', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
      quote('Robinhood → BNB', 'ETH'),
      live,
    )
    expect(robinhoodBnb.executable).toBe(true)
    expect(robinhoodBnb.transactions[0]).toMatchObject({
      purpose: 'oft_send',
      chainId: 4663,
      to: getAddress(MARCO_WAVE1_NETWORKS.robinhood.endpointContract),
    })

    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    expect(isRouteExecutable('base', 'bnb', live)).toBe(false)
    expect(live.networks.find((network) => network.id === 'base')).toMatchObject({
      token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
      endpoint_contract: MARCO_WAVE1_NETWORKS.base.endpointContract,
    })
    expect(live.networks.find((network) => network.id === 'bnb')).toMatchObject({
      token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
      endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
    })
    expect(live.networks.find((network) => network.id === 'robinhood')).toMatchObject({
      token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
      endpoint_contract: MARCO_WAVE1_NETWORKS.robinhood.endpointContract,
    })
    expect(normalizeCanonicalEvmAddress(MARCO_WAVE1_NETWORKS.bnb.endpointContract)).toBe(
      MARCO_WAVE1_NETWORKS.bnb.endpointContract,
    )
    expect(normalizeCanonicalEvmAddress(MARCO_WAVE1_NETWORKS.base.endpointContract)).toBe(
      MARCO_WAVE1_NETWORKS.base.endpointContract,
    )
    expect(normalizeCanonicalEvmAddress(MARCO_WAVE1_NETWORKS.robinhood.endpointContract)).toBe(
      MARCO_WAVE1_NETWORKS.robinhood.endpointContract,
    )
  })

  it('wires the shared helper at quote / tx consumption and leaves Solana identity byte-exact', () => {
    const helper = readFileSync(join(LIB_ROOT, 'canonicalEvmAddress.ts'), 'utf8')
    const quoteApi = readFileSync(join(LIB_ROOT, '../../pages/api/marco-bridge/quote.ts'), 'utf8')
    const quoteTransport = readFileSync(join(LIB_ROOT, 'quoteTransport.ts'), 'utf8')
    const txBuilder = readFileSync(join(LIB_ROOT, 'transactionBuilder.ts'), 'utf8')
    const authority = readFileSync(join(LIB_ROOT, 'routeAuthority.ts'), 'utf8')

    expect(helper).toContain('address.trim().toLowerCase()')
    expect(quoteApi).toContain('normalizeCanonicalEvmAddress')
    expect(quoteTransport).toContain('normalizeCanonicalEvmAddress')
    expect(txBuilder).toContain('normalizeCanonicalEvmAddress')
    expect(authority).not.toContain('normalizeCanonicalEvmAddress')
    expect(authority).toContain("family === 'evm' ? left.toLowerCase() === right.toLowerCase() : left === right")

    const accepted = assertCanonicalRouteAuthority(mmnWithProductionArc())
    const solana = accepted.networks.find((network) => network.id === 'solana')
    expect(solana?.token).toBe(MARCO_WAVE1_NETWORKS.solana.marcoIdentity)
    expect(solana?.endpoint_contract).toBe(MARCO_WAVE1_NETWORKS.solana.endpointContract)
  })
})
