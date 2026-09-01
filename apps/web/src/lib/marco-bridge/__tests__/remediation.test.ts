import { hexZeroPad } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { describe, expect, it, vi } from 'vitest'
import {
  BRIDGE_COPY,
  resolveSubmitCta,
} from '../bridgeActionState'
import {
  applyCanonicalBnbSolanaApplicationGate,
  CANONICAL_BNB_SOLANA_GATE,
  CANONICAL_SOLANA_OFT_STORE_PAUSED,
} from '../canonicalBnbSolanaGate'
import { isRouteExecutable } from '../executableRoutes'
import {
  evaluateNativeFunds,
  INSUFFICIENT_BNB_REASON,
  requiredNativeWeiForBridge,
} from '../nativeFunds'
import { assertMarcoBridgePreflight } from '../preflight'
import { assertCanonicalRouteAuthority, fetchCanonicalRouteAuthority, type CanonicalMmnRouteState } from '../routeAuthority'
import { readCanonicalSolanaStorePause, solanaStoreBlocksCanonicalRoute } from '../solanaStoreRead'
import { fetchLayerZeroTracking, trackingFromLayerZeroMessages } from '../tracking'
import { buildMarcoBridgeTransactions } from '../transactionBuilder'
import type { MarcoBridgeQuote, MarcoBridgeTracking } from '../types'
import { parseBridgeAmount } from '../validation'
import {
  submitMarcoApprovalFromWallet,
  submitMarcoBridgeFromWallet,
  waitForSubmittedReceipt,
  type WalletSubmitSigner,
} from '../walletSubmit'
import { localRouteActivationEnabled, MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solanaRecipient = CANONICAL_BNB_SOLANA_GATE.recipientExample
const gasPriceWei = '5000000000'
const nativeFeeWei = '72607980676756'

const UNPAUSED_STORE_HEX =
  'c3d76886b9c3f07200e80300000000000050d3851adc069482df20b05faf8841e614a9729223b552c3f265abe4170f4ffe02fa19808ef6991a81ed7786c4baa549d0687c48b0b684834cc3a23a0cffd7325aad76da514b6e1dcf11037e904dac3d375f525c9fbafcb19507b78907d8c18bff00000000000000009ae83ccef8e3f380108a1f8dc09c6a84161a477546b981040034b5a5c5d55128000000011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094'
const PAUSED_STORE_HEX =
  'c3d76886b9c3f07200e80300000000000050d3851adc069482df20b05faf8841e614a9729223b552c3f265abe4170f4ffe02fa19808ef6991a81ed7786c4baa549d0687c48b0b684834cc3a23a0cffd7325aad76da514b6e1dcf11037e904dac3d375f525c9fbafcb19507b78907d8c18bff00000000000000009ae83ccef8e3f380108a1f8dc09c6a84161a477546b981040034b5a5c5d55128000001011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094'

const staleEnvelope = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-12',
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
        paused: true,
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
      ['bnb', 'solana', true],
      ['solana', 'bnb', true],
      ['bnb', 'robinhood', false],
      ['robinhood', 'bnb', false],
    ].map(([from, to, paused]) => ({
      from,
      to,
      certified: true,
      publicly_active: false,
      execution_enabled: false,
      paused,
      reason: paused ? 'protective_pause' : 'public_activation_disabled',
    })),
  },
})

const staleAuthority = (): CanonicalMmnRouteState => assertCanonicalRouteAuthority(staleEnvelope())
const liveAuthority = (): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(staleAuthority(), { solanaStorePaused: false })

const liveQuote = (quotedAt = new Date().toISOString()): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei,
  nativeFeeSymbol: 'BNB',
  routeLabel: 'BNB → Solana',
  quotedAt,
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

const idleTracking = (): MarcoBridgeTracking => ({ status: 'review' })

const encodeWord = (value: string) => hexZeroPad(BigNumber.from(value).toHexString(), 32)

function mockSigner(input: {
  balanceWei: string
  gasPriceWei?: string
  marcoBalanceWei?: string
  wait?: () => Promise<{ status?: number | null } | null>
  waitForTransaction?: (hash: string) => Promise<{ status?: number | null } | null>
}): WalletSubmitSigner & { sendTransaction: ReturnType<typeof vi.fn> } {
  const sendTransaction = vi.fn().mockImplementation(async () => ({
    hash: '0xbridge',
    wait: input.wait,
  }))
  return {
    getAddress: async () => evm,
    sendTransaction,
    provider: {
      getBalance: async () => input.balanceWei,
      getGasPrice: async () => input.gasPriceWei ?? gasPriceWei,
      call: async () => encodeWord(input.marcoBalanceWei ?? parseUnits('10', 18).toString()),
      waitForTransaction: input.waitForTransaction,
    },
  }
}

describe('BNB native preflight', () => {
  const requiredApprove = requiredNativeWeiForBridge({
    nativeFeeWei,
    gasPriceWei,
    approvalRequired: true,
  })
  const requiredSend = requiredNativeWeiForBridge({
    nativeFeeWei,
    gasPriceWei,
    approvalRequired: false,
  })

  it('disables the CTA with INSUFFICIENT BNB when the signer cannot cover fee + gas', () => {
    const insufficient = requiredApprove.sub(1).toString()
    const verdict = evaluateNativeFunds({
      from: 'bnb',
      balanceWei: insufficient,
      nativeFeeWei,
      gasPriceWei,
      approvalRequired: true,
    })
    expect(verdict.ok).toBe(false)
    if (verdict.ok) throw new Error('expected insufficient')
    expect(verdict.reason).toBe(INSUFFICIENT_BNB_REASON)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: true,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.now(),
        nativeBlockReason: verdict.reason,
      }),
    ).toMatchObject({ disabled: true, reason: INSUFFICIENT_BNB_REASON, label: BRIDGE_COPY.approveMarco })
    expect(() =>
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        marcoBalance: '1',
        nativeGasBalance: '0',
        minimumNativeGas: '1',
        connectedEvmChainId: 56,
        destinationWallet: solanaRecipient,
        nativeFeeWei,
        nativeBalanceWei: insufficient,
        gasPriceWei,
        approvalRequired: true,
      }),
    ).toThrow(INSUFFICIENT_BNB_REASON)
  })

  it('allows approve/send when the signer covers nativeFeeWei plus the explicit gas margin', () => {
    const sufficient = requiredSend.add(1).toString()
    const verdict = evaluateNativeFunds({
      from: 'bnb',
      balanceWei: sufficient,
      nativeFeeWei,
      gasPriceWei,
      approvalRequired: false,
    })
    expect(verdict.ok).toBe(true)
    expect(BigNumber.from(verdict.requiredWei).gt(nativeFeeWei)).toBe(true)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: false,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.now(),
        nativeBlockReason: null,
      }),
    ).toMatchObject({ disabled: false, label: BRIDGE_COPY.bridgeMarco })
    expect(
      assertMarcoBridgePreflight({
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        marcoBalance: '1',
        nativeGasBalance: '1',
        minimumNativeGas: '0.001',
        connectedEvmChainId: 56,
        destinationWallet: solanaRecipient,
        nativeFeeWei,
        nativeBalanceWei: sufficient,
        gasPriceWei,
        approvalRequired: false,
      }),
    ).toBe(true)
  })

  it('rejects wallet approve and send when BNB is insufficient', async () => {
    const signer = mockSigner({ balanceWei: '1' })
    const request = {
      from: 'bnb' as const,
      to: 'solana' as const,
      amount: '0.000001',
      sourceWallet: evm,
      destinationWallet: solanaRecipient,
    }
    await expect(
      submitMarcoApprovalFromWallet({
        request,
        authority: liveAuthority(),
        signer,
        allowanceLD: '0',
        requestQuote: async () => liveQuote(),
      }),
    ).rejects.toThrow(INSUFFICIENT_BNB_REASON)
    await expect(
      submitMarcoBridgeFromWallet({
        request,
        authority: liveAuthority(),
        signer,
        allowanceLD: parseBridgeAmount('0.000001', 18)?.amountLD.toString(),
        requestQuote: async () => liveQuote(),
      }),
    ).rejects.toThrow(INSUFFICIENT_BNB_REASON)
    expect(signer.sendTransaction).not.toHaveBeenCalled()
  })
})

describe('approval confirmation', () => {
  it('waits for a successful receipt before returning and does not auto-send the bridge', async () => {
    const order: string[] = []
    const signer = mockSigner({
      balanceWei: requiredNativeWeiForBridge({ nativeFeeWei, gasPriceWei, approvalRequired: true }).add(1).toString(),
      wait: async () => {
        order.push('wait')
        return { status: 1 }
      },
    })
    const hash = await submitMarcoApprovalFromWallet({
      request: {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
      },
      authority: liveAuthority(),
      signer,
      allowanceLD: '0',
      requestQuote: async () => liveQuote(),
    })
    order.push('returned')
    expect(hash).toBe('0xbridge')
    expect(order).toEqual(['wait', 'returned'])
    expect(signer.sendTransaction).toHaveBeenCalledTimes(1)
    expect(signer.sendTransaction.mock.calls[0][0].value).toBe('0x0')
  })

  it('treats a failed approval receipt as an error and keeps APPROVE MARCO', async () => {
    await expect(
      waitForSubmittedReceipt({
        sent: { hash: '0xdead', wait: async () => ({ status: 0 }) },
        failureCode: 'APPROVAL_FAILED',
        failureMessage: 'MARCO approval failed on-chain.',
      }),
    ).rejects.toThrow('MARCO approval failed on-chain.')
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: true,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.now(),
      }).label,
    ).toBe(BRIDGE_COPY.approveMarco)
  })

  it('moves 0 allowance → APPROVE MARCO → confirmed allowance → BRIDGE MARCO', () => {
    const amount = parseBridgeAmount('0.000001', 18)
    const builtZero = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
        allowanceLD: '0',
      },
      liveQuote(),
      liveAuthority(),
    )
    expect(builtZero.approvalRequired).toBe(true)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: true,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.now(),
      }).label,
    ).toBe(BRIDGE_COPY.approveMarco)
    const builtFunded = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
        allowanceLD: amount?.amountLD.toString(),
      },
      liveQuote(),
      liveAuthority(),
    )
    expect(builtFunded.approvalRequired).toBe(false)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: false,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.now(),
      }).label,
    ).toBe(BRIDGE_COPY.bridgeMarco)
  })
})

describe('tracker truth', () => {
  it('keeps empty and unknown tracker payloads at submitted with do-not-resend', () => {
    expect(trackingFromLayerZeroMessages('0xabc', [])).toMatchObject({
      status: 'submitted',
      sourceTx: '0xabc',
      message: BRIDGE_COPY.submitted,
    })
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: '' } }]).status).toBe('submitted')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'UNKNOWN' } }]).status).toBe('submitted')
    expect(BRIDGE_COPY.submitted).toMatch(/Do not resend/)
  })

  it('keeps HTTP errors and thrown scans at submitted', async () => {
    await expect(
      fetchLayerZeroTracking('0xabc', (async () => ({ ok: false, status: 503, json: async () => ({}) })) as typeof fetch),
    ).resolves.toMatchObject({ status: 'submitted', sourceTx: '0xabc', message: BRIDGE_COPY.submitted })
    await expect(
      fetchLayerZeroTracking('0xabc', (async () => {
        throw new Error('network down')
      }) as typeof fetch),
    ).resolves.toMatchObject({ status: 'submitted', sourceTx: '0xabc' })
  })

  it('advances the five steps only on real tracker statuses', () => {
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'CONFIRMING' } }]).status).toBe('source-confirmed')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'INFLIGHT' } }]).status).toBe('verifying')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'PAYLOAD_STORED' } }]).status).toBe(
      'destination-executing',
    )
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'DELIVERED' } }]).status).toBe('delivered')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'FAILED' } }]).status).toBe('source-failed')
  })
})

describe('live Solana pause truth', () => {
  const accountPayload = (hex: string, owner = CANONICAL_BNB_SOLANA_GATE.programId) => ({
    jsonrpc: '2.0',
    result: {
      value: {
        data: [Buffer.from(hex, 'hex').toString('base64'), 'base64'],
        owner,
      },
    },
  })

  it('enables BNB→Solana only when the live store read is paused=false', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => accountPayload(UNPAUSED_STORE_HEX),
    })
    const live = await readCanonicalSolanaStorePause({ fetcher: fetcher as unknown as typeof fetch, timeoutMs: 50 })
    expect(live).toMatchObject({ ok: true, paused: false, mint: CANONICAL_BNB_SOLANA_GATE.mint })
    expect(solanaStoreBlocksCanonicalRoute(live)).toBe(false)
    const authority = applyCanonicalBnbSolanaApplicationGate(staleAuthority(), {
      solanaStorePaused: solanaStoreBlocksCanonicalRoute(live),
    })
    expect(isRouteExecutable('bnb', 'solana', authority)).toBe(true)
  })

  it('blocks BNB→Solana when the live store is paused, RPC fails, or identities mismatch', async () => {
    const paused = await readCanonicalSolanaStorePause({
      fetcher: (async () => ({ ok: true, json: async () => accountPayload(PAUSED_STORE_HEX) })) as unknown as typeof fetch,
      timeoutMs: 50,
    })
    expect(paused).toMatchObject({ ok: true, paused: true })
    expect(isRouteExecutable('bnb', 'solana', applyCanonicalBnbSolanaApplicationGate(staleAuthority(), { solanaStorePaused: true }))).toBe(
      false,
    )

    const rpcError = await readCanonicalSolanaStorePause({
      fetcher: (async () => {
        throw new Error('rpc down')
      }) as unknown as typeof fetch,
      timeoutMs: 50,
    })
    expect(rpcError.ok).toBe(false)
    expect(solanaStoreBlocksCanonicalRoute(rpcError)).toBe(true)

    const mismatch = await readCanonicalSolanaStorePause({
      fetcher: (async () => ({
        ok: true,
        json: async () => accountPayload(UNPAUSED_STORE_HEX, '11111111111111111111111111111111'),
      })) as unknown as typeof fetch,
      timeoutMs: 50,
    })
    expect(mismatch).toMatchObject({ ok: false, reason: 'mismatch' })
    expect(solanaStoreBlocksCanonicalRoute(mismatch)).toBe(true)
  })

  it('applies the overlay from live evidence, not the historical unpause snapshot', async () => {
    expect(CANONICAL_SOLANA_OFT_STORE_PAUSED).toBe(false)
    const mmnFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => staleEnvelope(),
    })
    const blocked = await fetchCanonicalRouteAuthority(mmnFetcher as unknown as typeof fetch, async () => ({
      ok: false,
      reason: 'rpc_error',
      detail: 'mocked',
    }))
    expect(isRouteExecutable('bnb', 'solana', blocked)).toBe(false)
    expect(isRouteExecutable('bnb', 'robinhood', blocked)).toBe(true)
    const enabled = await fetchCanonicalRouteAuthority(mmnFetcher as unknown as typeof fetch, async () => ({
      ok: true,
      paused: false,
      store: CANONICAL_BNB_SOLANA_GATE.store,
      owner: CANONICAL_BNB_SOLANA_GATE.programId,
      mint: CANONICAL_BNB_SOLANA_GATE.mint,
    }))
    expect(isRouteExecutable('bnb', 'solana', enabled)).toBe(true)
    expect(isRouteExecutable('solana', 'bnb', enabled)).toBe(false)
  })
})

describe('quote freshness and topology', () => {
  it('re-reads a live quote immediately before send and uses that nativeFeeWei', async () => {
    const freshWei = '88888888888888'
    const requestQuote = vi.fn().mockResolvedValue({ ...liveQuote(), nativeFeeWei: freshWei })
    const signer = mockSigner({
      balanceWei: requiredNativeWeiForBridge({
        nativeFeeWei: freshWei,
        gasPriceWei,
        approvalRequired: false,
      })
        .add(1)
        .toString(),
    })
    await submitMarcoBridgeFromWallet({
      request: {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
      },
      authority: liveAuthority(),
      signer,
      allowanceLD: parseBridgeAmount('0.000001', 18)?.amountLD.toString(),
      requestQuote,
    })
    expect(requestQuote).toHaveBeenCalledTimes(1)
    expect(requestQuote.mock.invocationCallOrder[0]).toBeLessThan(signer.sendTransaction.mock.invocationCallOrder[0])
    expect(signer.sendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ value: BigNumber.from(freshWei).toHexString() }),
    )
  })

  it('keeps BNB↔Robinhood open and every other Solana direct closed', () => {
    const live = liveAuthority()
    expect(isRouteExecutable('bnb', 'robinhood', live)).toBe(true)
    expect(isRouteExecutable('robinhood', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'solana', live)).toBe(true)
    expect(isRouteExecutable('solana', 'bnb', live)).toBe(false)
    expect(isRouteExecutable('base', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'base', live)).toBe(false)
    expect(isRouteExecutable('robinhood', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'robinhood', live)).toBe(false)
    expect(localRouteActivationEnabled('solana', 'bnb')).toBe(false)
    expect(live.global_execution_enabled).toBe(false)
  })
})
