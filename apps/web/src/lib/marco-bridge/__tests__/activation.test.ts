import { BigNumber } from '@ethersproject/bignumber'
import { describe, expect, it } from 'vitest'
import { assertCanonicalRouteAuthority } from '../routeAuthority'
import { assertRouteExecutable, isActivationRoute, isRouteExecutable } from '../executableRoutes'
import { sourceSucceeded, bridgeRecoveryMessage } from '../lifecycle'
import { RETIRED_ROBINHOOD_CHAIN_ID, ROBINHOOD_CHAIN_ID } from '../robinhoodChain'
import { simulateMarcoBridgeBuild } from '../simulate'
import {
  SOLANA_OFT_ADMIN,
  SOLANA_OFT_FALSE_AUTHORITIES,
  SOLANA_OFT_PROGRAM_ID,
  SOLANA_OFT_UNPAUSER,
  applyLiveSolanaPauseOverlay,
  assertSolanaUnpauseSigner,
  parseOftStoreAccount,
  solanaUnpauseOperatorMessage,
} from '../solanaUnpause'
import {
  OFT_SEND_IFACE,
  buildMarcoBridgeTransactions,
  buildMarcoSendParam,
} from '../transactionBuilder'
import { trackingFromLayerZeroMessages } from '../tracking'
import { isValidMarcoDestination, parseBridgeAmount } from '../validation'
import { MARCO_WAVE1_NETWORKS, localRouteActivationEnabled } from '../wave1Registry'
import type { CanonicalMmnRouteState } from '../routeAuthority'
import type { MarcoBridgeQuote } from '../types'

const evm = '0x1111111111111111111111111111111111111111'
const solana = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'
const OLD_RH_TOKEN = '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E'

const envelope = (overrides?: { solanaPaused?: boolean; rhPublic?: boolean }) => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-29T00:00:00.000Z',
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
        paused: overrides?.solanaPaused ?? true,
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
    ],
    routes: [
      ['bnb', 'base', false],
      ['base', 'bnb', false],
      ['bnb', 'solana', overrides?.solanaPaused ?? true],
      ['solana', 'bnb', overrides?.solanaPaused ?? true],
      ['bnb', 'robinhood', false],
      ['robinhood', 'bnb', false],
    ].map(([from, to, paused]) => ({
      from,
      to,
      certified: true,
      publicly_active: Boolean(overrides?.rhPublic && (from === 'bnb' || from === 'robinhood') && (to === 'bnb' || to === 'robinhood')),
      execution_enabled: Boolean(overrides?.rhPublic && (from === 'bnb' || from === 'robinhood') && (to === 'bnb' || to === 'robinhood')),
      paused,
      reason: paused ? 'protective_pause' : 'certified',
    })),
  },
})

const authority = (overrides?: { solanaPaused?: boolean; rhPublic?: boolean }): CanonicalMmnRouteState =>
  assertCanonicalRouteAuthority(envelope(overrides))

const quote = (label: string, paused = false, wei = '72607980676756'): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei: wei,
  nativeFeeSymbol: label.includes('Solana →') ? 'SOL' : label.includes('Robinhood →') ? 'ETH' : 'BNB',
  routeLabel: label,
  quotedAt: '2026-08-29T16:00:00.000Z',
  live: true,
  routePaused: paused,
  publiclyActive: !paused,
  executionEnabled: !paused,
})

describe('BNB↔Robinhood and BNB↔Solana activation', () => {
  it('quotes/builds/sims BNB -> Robinhood with approval when allowance is zero', () => {
    const state = authority()
    const built = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'robinhood', amount: '0.000001', sourceWallet: evm, destinationWallet: evm, allowanceLD: '0' },
      quote('BNB → Robinhood'),
      state,
    )
    expect(built.executable).toBe(true)
    expect(built.approvalRequired).toBe(true)
    expect(built.sendParam.dstEid).toBe(30416)
    expect(built.transactions[0]).toMatchObject({ purpose: 'approve', chainId: 56 })
    expect(built.transactions[1]).toMatchObject({ purpose: 'oft_send', chainId: 56, to: MARCO_WAVE1_NETWORKS.bnb.endpointContract })
    const decoded = OFT_SEND_IFACE.decodeFunctionData('send', (built.transactions[1] as { data: string }).data)
    expect(decoded.sendParam.dstEid).toBe(30416)
  })

  it('quotes/builds/sims Robinhood -> BNB without adapter approval', async () => {
    const state = authority()
    const built = buildMarcoBridgeTransactions(
      { from: 'robinhood', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
      quote('Robinhood → BNB'),
      state,
    )
    expect(built.executable).toBe(true)
    expect(built.approvalRequired).toBe(false)
    expect(built.sendParam.dstEid).toBe(30102)
    expect(built.transactions).toHaveLength(1)
    expect(built.transactions[0]).toMatchObject({ purpose: 'oft_send', chainId: ROBINHOOD_CHAIN_ID })
    const simulation = await simulateMarcoBridgeBuild(built, {
      async ethCall() {
        return { ok: false, reverted: true, reason: 'execution reverted: ERC20: transfer amount exceeds balance' }
      },
    })
    expect(simulation.executable).toBe(true)
    expect(simulation.ok).toBe(false)
    expect(simulation.steps[0].reason).toContain('No balances were fabricated')
  })

  it('quotes/builds/sims BNB -> Solana and fail-closes while paused', async () => {
    const paused = authority({ solanaPaused: true })
    const built = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'solana', amount: '0.000001', sourceWallet: evm, destinationWallet: solana },
      quote('BNB → Solana', true),
      paused,
    )
    expect(built.sendParam.dstEid).toBe(30168)
    expect(built.executable).toBe(false)
    expect(built.transactions).toEqual([])
    await expect(async () => assertRouteExecutable('bnb', 'solana', paused)).rejects.toThrow(/paused/i)
    const simulation = await simulateMarcoBridgeBuild(built, {})
    expect(simulation.ok).toBe(false)
    expect(simulation.blockers.join(' ')).toMatch(/paused/i)
  })

  it('executes public BNB↔Solana and BNB↔Robinhood when the live store is unpaused', () => {
    const live = authority({ solanaPaused: false })
    expect(isRouteExecutable('bnb', 'solana', live)).toBe(true)
    expect(isRouteExecutable('solana', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'robinhood', live)).toBe(true)
    expect(isRouteExecutable('robinhood', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    const overlaid = applyLiveSolanaPauseOverlay(authority({ solanaPaused: true }), false)
    expect(overlaid.networks.find((network) => network.id === 'solana')?.paused).toBe(false)
    expect(isRouteExecutable('bnb', 'solana', overlaid)).toBe(true)
    expect(parseBridgeAmount('1234567.123456', 18)?.amountLD.toString()).toBe('1234567123456000000000000')
    expect(parseBridgeAmount('1234567.123456', 9)?.amountLD.toString()).toBe('1234567123456000')
    const failClosed = applyLiveSolanaPauseOverlay(authority({ solanaPaused: false }), true)
    expect(failClosed.networks.find((network) => network.id === 'solana')?.paused).toBe(true)
    expect(isRouteExecutable('bnb', 'solana', failClosed)).toBe(false)
    expect(isRouteExecutable('solana', 'bnb', failClosed)).toBe(false)
    expect(isRouteExecutable('bnb', 'robinhood', failClosed)).toBe(true)
    expect(isRouteExecutable('robinhood', 'bnb', failClosed)).toBe(true)
  })

  it('quotes/builds/sims Solana -> BNB after unpause representation', () => {
    const live = authority({ solanaPaused: false })
    const built = buildMarcoBridgeTransactions(
      { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solana, destinationWallet: evm },
      quote('Solana → BNB', false, '5000'),
      live,
    )
    expect(isRouteExecutable('solana', 'bnb', live)).toBe(true)
    expect(built.executable).toBe(true)
    expect(built.transactions[0]).toMatchObject({
      family: 'solana',
      dstEid: 30102,
      mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
      store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
    })
  })

  it('requires approval on BNB consumer -> adapter when allowance is below amountLD', () => {
    const amount = parseBridgeAmount('0.000001', 18)
    expect(amount?.amountLD.toString()).toBe('1000000000000')
    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'robinhood',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: evm,
        allowanceLD: '1',
      },
      quote('BNB → Robinhood'),
      authority(),
    )
    expect(built.approvalRequired).toBe(true)
    const funded = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'robinhood',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: evm,
        allowanceLD: amount?.amountLD.toString(),
      },
      quote('BNB → Robinhood'),
      authority(),
    )
    expect(funded.approvalRequired).toBe(false)
    expect(funded.transactions).toHaveLength(1)
  })

  it('uses integer sharedDecimals 18/9/6 conversions only', () => {
    expect(parseBridgeAmount('0.000001', 18)?.amountLD.toString()).toBe('1000000000000')
    expect(parseBridgeAmount('0.000001', 9)?.amountLD.toString()).toBe('1000')
    expect(parseBridgeAmount('0.0000001', 18)).toBeNull()
    expect(buildMarcoSendParam('bnb', 'solana', '0.000001', solana).amountLD.eq(BigNumber.from('1000000000000'))).toBe(true)
  })

  it('rejects invalid EVM destinations and invalid Solana public keys', () => {
    expect(isValidMarcoDestination('0x1234', 'evm')).toBe(false)
    expect(isValidMarcoDestination(solana, 'evm')).toBe(false)
    expect(isValidMarcoDestination('0OIl-not-base58', 'solana')).toBe(false)
    expect(isValidMarcoDestination(evm, 'solana')).toBe(false)
    expect(() => buildMarcoSendParam('bnb', 'robinhood', '0.000001', '0x1234')).toThrow()
    expect(() => buildMarcoSendParam('bnb', 'solana', '0.000001', evm)).toThrow()
  })

  it('fails closed when a route is inactive or Base is requested', () => {
    expect(isActivationRoute('bnb', 'base')).toBe(false)
    expect(localRouteActivationEnabled('bnb', 'base')).toBe(false)
    expect(() =>
      buildMarcoBridgeTransactions(
        { from: 'bnb', to: 'base', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
        quote('BNB → Base'),
        authority(),
      ),
    ).toThrow('BNB↔Robinhood and BNB↔Solana')
  })

  it('fails closed while Solana is paused and names the admin set_oft_config path', () => {
    expect(isRouteExecutable('bnb', 'solana', authority({ solanaPaused: true }))).toBe(false)
    expect(solanaUnpauseOperatorMessage()).toContain(SOLANA_OFT_ADMIN)
    expect(solanaUnpauseOperatorMessage()).toContain('set_oft_config')
    expect(solanaUnpauseOperatorMessage()).toContain('Paused(false)')
    expect(solanaUnpauseOperatorMessage()).toContain(SOLANA_OFT_UNPAUSER)
    expect(solanaUnpauseOperatorMessage()).toMatch(/off-curve PDA/)
    expect(solanaUnpauseOperatorMessage()).not.toContain(SOLANA_OFT_FALSE_AUTHORITIES[1])
  })

  it('parses the live OFT store Option layout and refuses misaligned signer windows', () => {
    const raw = Buffer.from(
      'c3d76886b9c3f07200e80300000000000050d3851adc069482df20b05faf8841e614a9729223b552c3f265abe4170f4ffe02fa19808ef6991a81ed7786c4baa549d0687c48b0b684834cc3a23a0cffd7325aad76da514b6e1dcf11037e904dac3d375f525c9fbafcb19507b78907d8c18bff00000000000000009ae83ccef8e3f380108a1f8dc09c6a84161a477546b981040034b5a5c5d55128000001011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094',
      'hex',
    )
    const store = parseOftStoreAccount(raw, SOLANA_OFT_PROGRAM_ID)
    expect(store.paused).toBe(true)
    expect(store.admin).toBe(SOLANA_OFT_ADMIN)
    expect(store.pauser).toBe(SOLANA_OFT_UNPAUSER)
    expect(store.unpauser).toBe(SOLANA_OFT_UNPAUSER)
    expect(store.mint).toBe(MARCO_WAVE1_NETWORKS.solana.marcoIdentity)
    expect(store.ld2sdRate).toBe(1000)
    expect(assertSolanaUnpauseSigner(store)).toBe(SOLANA_OFT_ADMIN)
    expect(SOLANA_OFT_FALSE_AUTHORITIES).not.toContain(store.unpauser)
  })

  it('keeps source-confirmed delivery pending on the same GUID', () => {
    const tracking = trackingFromLayerZeroMessages('0xabc', [
      { guid: 'guid-1', status: { name: 'INFLIGHT' }, source: { tx: { txHash: '0xabc' } } },
    ])
    expect(tracking.guid).toBe('guid-1')
    expect(sourceSucceeded(tracking)).toBe(true)
    expect(bridgeRecoveryMessage(tracking)).toContain('do not resend')
    expect(trackingFromLayerZeroMessages('0xdef', [{ status: { name: 'FAILED' } }]).status).toBe('source-failed')
  })

  it('has no active 62831 and no old Robinhood canonical token', () => {
    expect(MARCO_WAVE1_NETWORKS.robinhood.chainId).toBe(4663)
    expect(MARCO_WAVE1_NETWORKS.robinhood.chainId).not.toBe(RETIRED_ROBINHOOD_CHAIN_ID)
    expect(MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity.toLowerCase()).not.toBe(OLD_RH_TOKEN.toLowerCase())
    const retired = envelope()
    retired.data.networks[3].chain_id = 62831
    expect(() => assertCanonicalRouteAuthority(retired)).toThrow('62831')
    const oldToken = envelope()
    oldToken.data.networks[3].token = OLD_RH_TOKEN
    expect(() => assertCanonicalRouteAuthority(oldToken)).toThrow(/mismatch|Retired BNB adapter/)
  })

  it('keeps Solana mint/store canonical', () => {
    expect(MARCO_WAVE1_NETWORKS.solana.marcoIdentity).toBe('6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF')
    expect(MARCO_WAVE1_NETWORKS.solana.endpointContract).toBe('7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW')
  })
})
