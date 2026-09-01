import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { describe, expect, it, vi } from 'vitest'
import { applyCanonicalBnbSolanaApplicationGate, CANONICAL_BNB_SOLANA_GATE } from '../canonicalBnbSolanaGate'
import { isRouteExecutable, localRouteActivationEnabled } from '../executableRoutes'
import { readOnlySolanaMarcoBridgeQuote } from '../solanaQuote'
import { SOLANA_SEND_COMPUTE_UNITS } from '../solanaOftSdk'
import { buildMarcoBridgePayload } from '../../../pages/api/marco-bridge/build'
import {
  LAYERZERO_SOLANA_V2_MAINNET_ALT,
  SOLANA_OFT_PROGRAM,
  SOLANA_OFT_STORE,
  assertSendMatchesQuote,
  createSolanaOftSendParam,
  requiredSolLamportsForBridge,
  solanaQuoteIdentity,
  type SolanaOftProtocol,
} from '../solanaOftProtocol'
import { SOLANA_OFT_ESCROW } from '../solanaUnpause'
import { trackingFromLayerZeroMessages } from '../tracking'
import { buildMarcoBridgeTransactions } from '../transactionBuilder'
import type { CanonicalMmnRouteState } from '../routeAuthority'
import { assertCanonicalRouteAuthority } from '../routeAuthority'
import type { MarcoBridgeQuote } from '../types'
import { destinationToBytes32 } from '../validation'
import {
  confirmSolanaSourceBroadcast,
  readConnectedSolanaAddress,
  solanaWalletConnectionLabel,
  submitMarcoBridgeFromWallet,
  submitSolanaMarcoBridgeFromWallet,
} from '../walletSubmit'
import { MARCO_WAVE1_NETWORKS, MARCO_WAVE1_ROUTE_ACTIVATION } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solanaOwner = '2LxBuA9o3AwNyFnXsqbZnKFzyuw9WarYydknQXQieRzb'
const tokenAccount = 'Ga2zsrDSs9TaCtUo1LVT3CoAmJQHpEVpSDk1E1C4mGSK'
const optionsHex = '0x'
const enforcedOptionsHex = '0x0003'
const nativeFeeLamports = '123456'
const solanaSignature = '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjz3BUj9u4Nq3fY6K3nQz6k4nY6k4nY6'
const serializedTx = (() => {
  const payer = new PublicKey(solanaOwner)
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N',
    instructions: [SystemProgram.transfer({ fromPubkey: payer, toPubkey: payer, lamports: 1 })],
  }).compileToV0Message()
  return Buffer.from(new VersionedTransaction(message).serialize()).toString('base64')
})()

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

const liveAuthority = (): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(staleEnvelope()), { solanaStorePaused: false })

function bindingFor(overrides: Partial<NonNullable<MarcoBridgeQuote['binding']>> = {}) {
  const base = {
    from: 'solana' as const,
    to: 'bnb' as const,
    sourceWallet: solanaOwner,
    destinationWallet: evm,
    amount: '0.000001',
    amountLD: '1000',
    dstEid: 30102,
    toBytes32: destinationToBytes32(evm, 'evm'),
    store: SOLANA_OFT_STORE,
    programId: SOLANA_OFT_PROGRAM,
    mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
    escrow: SOLANA_OFT_ESCROW,
    tokenAccount,
    optionsHex,
    enforcedOptionsHex,
    nativeFeeWei: nativeFeeLamports,
    lookupTable: LAYERZERO_SOLANA_V2_MAINNET_ALT,
  }
  return {
    ...base,
    ...overrides,
    expiresAt: overrides.expiresAt ?? '2026-09-01T12:01:00.000Z',
    identity: solanaQuoteIdentity({ ...base, ...overrides }),
  }
}

function liveSolanaQuote(quotedAt = new Date().toISOString()): MarcoBridgeQuote {
  const binding = bindingFor({ expiresAt: new Date(Date.now() + 60_000).toISOString() })
  return {
    amount: '0.000001',
    expectedReceive: '0.000001',
    nativeFee: '0.000123456',
    nativeFeeWei: nativeFeeLamports,
    nativeFeeSymbol: 'SOL',
    routeLabel: 'Solana → BNB',
    quotedAt,
    expiresAt: binding.expiresAt,
    live: true,
    routePaused: false,
    publiclyActive: true,
    executionEnabled: true,
    binding,
  }
}

function mockProtocol(overrides: Partial<SolanaOftProtocol> = {}): SolanaOftProtocol & {
  quote: ReturnType<typeof vi.fn>
  buildSend: ReturnType<typeof vi.fn>
} {
  const quote = vi.fn().mockImplementation(async (input) => ({
    nativeFeeLamports,
    amountSentLd: input.sendParam.amountLd,
    amountReceivedLd: input.sendParam.amountLd,
  }))
  const buildSend = vi.fn().mockImplementation(async (input) => ({
    serializedTransaction: serializedTx,
    feePayer: input.payer,
    tokenSource: input.tokenSource,
    sendParam: input.sendParam,
    nativeFeeLamports: input.nativeFeeLamports,
    store: SOLANA_OFT_STORE,
    programId: input.programId,
    mint: input.tokenMint,
    escrow: input.tokenEscrow,
    lookupTable: input.lookupTable,
  }))
  const { quote: quoteOverride, buildSend: buildSendOverride, ...otherOverrides } = overrides
  return {
    fetchStore: async () => ({
      store: SOLANA_OFT_STORE,
      programId: SOLANA_OFT_PROGRAM,
      tokenMint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
      tokenEscrow: SOLANA_OFT_ESCROW,
      paused: false,
      decimals: 9,
    }),
    fetchOwnerAccounts: async () => ({
      owner: solanaOwner,
      tokenAccount,
      tokenBalanceLd: '1000000',
      solLamports: requiredSolLamportsForBridge(nativeFeeLamports),
    }),
    getEnforcedOptions: async () => ({ sendHex: enforcedOptionsHex }),
    ...otherOverrides,
    quote: quoteOverride ? vi.fn(quoteOverride) : quote,
    buildSend: buildSendOverride ? vi.fn(buildSendOverride) : buildSend,
  }
}

describe('Solana → BNB official OFT path', () => {
  it('a) enables only the canonical reverse hub route solana:bnb', () => {
    const enabled = Object.entries(MARCO_WAVE1_ROUTE_ACTIVATION)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .sort()
    expect(enabled).toEqual(['bnb:robinhood', 'bnb:solana', 'robinhood:bnb', 'solana:bnb'])
    expect(localRouteActivationEnabled('solana', 'base')).toBe(false)
    expect(localRouteActivationEnabled('solana', 'robinhood')).toBe(false)
  })

  it('b) keeps live Solana paused=false instead of rewriting the route to paused', () => {
    const live = liveAuthority()
    const solana = live.networks.find((network) => network.id === 'solana')
    const route = live.routes.find((item) => item.from === 'solana' && item.to === 'bnb')
    expect(solana?.paused).toBe(false)
    expect(route?.paused).toBe(false)
    expect(route?.publicly_active).toBe(true)
    expect(route?.execution_enabled).toBe(true)
    expect(route?.reason).not.toMatch(/Solana OFT store is paused/)
    expect(isRouteExecutable('solana', 'bnb', live)).toBe(true)
  })

  it('c) quotes successfully and fail-closes on store, account, option, and destination errors', async () => {
    const protocol = mockProtocol()
    const quote = await readOnlySolanaMarcoBridgeQuote(
      { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
      liveAuthority(),
      protocol,
      '2026-09-01T12:00:00.000Z',
    )
    expect(quote).toMatchObject({
      live: true,
      nativeFeeSymbol: 'SOL',
      nativeFeeWei: nativeFeeLamports,
      routeLabel: 'Solana → BNB',
      publiclyActive: true,
    })
    expect(quote.binding?.dstEid).toBe(30102)
    expect(quote.binding?.toBytes32).toBe(destinationToBytes32(evm, 'evm'))
    expect(quote.binding?.optionsHex).toBe('0x')
    expect(quote.binding?.enforcedOptionsHex).toBe(enforcedOptionsHex)
    expect(quote.binding?.identity).toBe(solanaQuoteIdentity(quote.binding!))
    expect(protocol.quote).toHaveBeenCalledWith(
      expect.objectContaining({
        payer: solanaOwner,
        tokenMint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
        tokenEscrow: SOLANA_OFT_ESCROW,
        sendParam: createSolanaOftSendParam({ amountLD: '1000', destinationWallet: evm, optionsHex: '0x' }),
        lookupTable: LAYERZERO_SOLANA_V2_MAINNET_ALT,
      }),
    )

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(staleEnvelope()), {
          solanaStorePaused: true,
        }),
        protocol,
      ),
    ).rejects.toThrow('Solana OFT store is paused.')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'base' as never, amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        liveAuthority(),
        protocol,
      ),
    ).rejects.toThrow('Only the certified Solana → BNB route')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        liveAuthority(),
        mockProtocol({
          fetchStore: async () => ({
            store: SOLANA_OFT_STORE,
            programId: SOLANA_OFT_PROGRAM,
            tokenMint: '11111111111111111111111111111111',
            tokenEscrow: SOLANA_OFT_ESCROW,
            paused: false,
            decimals: 9,
          }),
        }),
      ),
    ).rejects.toThrow('tokenMint')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        liveAuthority(),
        mockProtocol({
          fetchOwnerAccounts: async () => ({
            owner: solanaOwner,
            tokenAccount,
            tokenBalanceLd: '1',
            solLamports: '1000000000',
          }),
        }),
      ),
    ).rejects.toThrow('Insufficient MARCO')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        liveAuthority(),
        mockProtocol({
          fetchOwnerAccounts: async () => ({
            owner: solanaOwner,
            tokenAccount,
            tokenBalanceLd: '1000000',
            solLamports: '1',
          }),
        }),
      ),
    ).rejects.toThrow('Insufficient SOL')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
        liveAuthority(),
        mockProtocol({ getEnforcedOptions: async () => ({ sendHex: '0x' }) }),
      ),
    ).rejects.toThrow('enforced options')

    await expect(
      readOnlySolanaMarcoBridgeQuote(
        { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: solanaOwner },
        liveAuthority(),
        protocol,
      ),
    ).rejects.toThrow('valid BNB Smart Chain destination')
  })

  it('does not duplicate configured enforced options into caller extra options', async () => {
    const protocol = mockProtocol()
    const quote = await readOnlySolanaMarcoBridgeQuote(
      { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
      liveAuthority(),
      protocol,
      '2026-09-01T12:00:00.000Z',
    )
    expect(quote.binding).toMatchObject({
      optionsHex: '0x',
      enforcedOptionsHex,
    })
    expect(protocol.quote).toHaveBeenCalledWith(
      expect.objectContaining({ sendParam: expect.objectContaining({ optionsHex: '0x' }) }),
    )
  })

  it('server build revalidates a fresh canonical quote and rejects forged or stale bindings', async () => {
    const now = new Date('2026-09-01T12:00:00.000Z')
    const canonicalProtocol = mockProtocol()
    const canonicalQuote = await readOnlySolanaMarcoBridgeQuote(
      { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
      liveAuthority(),
      canonicalProtocol,
      now.toISOString(),
    )
    const body = {
      from: 'solana',
      to: 'bnb',
      amount: '0.000001',
      sourceWallet: solanaOwner,
      destinationWallet: evm,
      quote: canonicalQuote,
    }
    const successProtocol = mockProtocol()
    const simulateSolanaSend = vi.fn().mockResolvedValue(undefined)
    const built = await buildMarcoBridgePayload(body, {
      fetchAuthority: async () => liveAuthority(),
      createSolanaProtocol: () => successProtocol,
      simulateSolanaSend,
      now: () => now,
    })
    expect(built.transactions[0]).toMatchObject({
      family: 'solana',
      serializedTransaction: serializedTx,
      quoteIdentity: canonicalQuote.binding?.identity,
    })
    expect(successProtocol.buildSend).toHaveBeenCalledTimes(1)
    expect(simulateSolanaSend).toHaveBeenCalledWith(serializedTx)

    const preparedProtocol = mockProtocol()
    const prepared = await buildMarcoBridgePayload(
      { ...body, quote: undefined, prepare: true },
      {
        fetchAuthority: async () => liveAuthority(),
        createSolanaProtocol: () => preparedProtocol,
        simulateSolanaSend,
        now: () => now,
      },
    )
    expect(prepared).toMatchObject({
      executable: true,
      quote: expect.objectContaining({ live: true, routeLabel: 'Solana → BNB' }),
      transactions: [expect.objectContaining({ family: 'solana', serializedTransaction: serializedTx })],
    })

    const forgedCases: Array<{ name: string; mutate: (quote: MarcoBridgeQuote) => void }> = [
      {
        name: 'program',
        mutate: (quote) => {
          quote.binding!.programId = '11111111111111111111111111111111'
        },
      },
      {
        name: 'escrow',
        mutate: (quote) => {
          quote.binding!.escrow = '11111111111111111111111111111111'
        },
      },
      {
        name: 'ATA',
        mutate: (quote) => {
          quote.binding!.tokenAccount = '11111111111111111111111111111111'
        },
      },
      {
        name: 'dstEid',
        mutate: (quote) => {
          quote.binding!.dstEid = 30184
        },
      },
      {
        name: 'enforced config',
        mutate: (quote) => {
          quote.binding!.enforcedOptionsHex = '0x9999'
        },
      },
      {
        name: 'native fee',
        mutate: (quote) => {
          quote.nativeFeeWei = '1'
          quote.binding!.nativeFeeWei = '1'
        },
      },
    ]
    for (const testCase of forgedCases) {
      const forged = JSON.parse(JSON.stringify(canonicalQuote)) as MarcoBridgeQuote
      testCase.mutate(forged)
      forged.binding!.identity = solanaQuoteIdentity(forged.binding!)
      const protocol = mockProtocol()
      await expect(
        buildMarcoBridgePayload(
          { ...body, quote: forged },
          {
            fetchAuthority: async () => liveAuthority(),
            createSolanaProtocol: () => protocol,
            now: () => now,
          },
        ),
        testCase.name,
      ).rejects.toThrow('no longer matches live canonical configuration')
      expect(protocol.buildSend, testCase.name).not.toHaveBeenCalled()
    }

    const stale = JSON.parse(JSON.stringify(canonicalQuote)) as MarcoBridgeQuote
    stale.expiresAt = '2026-09-01T11:59:59.000Z'
    stale.binding!.expiresAt = stale.expiresAt
    const staleProtocol = mockProtocol()
    await expect(
      buildMarcoBridgePayload(
        { ...body, quote: stale },
        {
          fetchAuthority: async () => liveAuthority(),
          createSolanaProtocol: () => staleProtocol,
          now: () => now,
        },
      ),
    ).rejects.toThrow('live quote expired')
    expect(staleProtocol.buildSend).not.toHaveBeenCalled()
  })

  it('d) uses the exact quote send parameters and accounts for construction', async () => {
    const protocol = mockProtocol()
    const quote = liveSolanaQuote()
    const request = {
      from: 'solana' as const,
      to: 'bnb' as const,
      amount: '0.000001',
      sourceWallet: solanaOwner,
      destinationWallet: evm,
    }
    await submitSolanaMarcoBridgeFromWallet({
      request,
      authority: liveAuthority(),
      wallet: {
        publicKey: { toString: () => solanaOwner },
        signAndSendTransaction: async () => solanaSignature,
      },
      protocol,
      confirmSource: async () => undefined,
      requestQuote: async () => quote,
    })
    expect(protocol.buildSend).toHaveBeenCalledWith({
      payer: solanaOwner,
      tokenMint: quote.binding?.mint,
      tokenEscrow: quote.binding?.escrow,
      tokenSource: quote.binding?.tokenAccount,
      sendParam: {
        dstEid: 30102,
        toBytes32: quote.binding?.toBytes32,
        amountLd: '1000',
        minAmountLd: '1000',
        optionsHex: '0x',
        payInLzToken: false,
      },
      programId: SOLANA_OFT_PROGRAM,
      lookupTable: LAYERZERO_SOLANA_V2_MAINNET_ALT,
      nativeFeeLamports,
    })
    const built = await protocol.buildSend.mock.results[0].value
    assertSendMatchesQuote({ quote, request, send: built })
  })

  it('e) shows a connected Solana address as Connected, not Connect', () => {
    expect(solanaWalletConnectionLabel('')).toBe('Connect')
    expect(solanaWalletConnectionLabel(solanaOwner)).toBe('Connected')
    expect(readConnectedSolanaAddress({ publicKey: { toString: () => solanaOwner } })).toBe(solanaOwner)
    expect(readConnectedSolanaAddress({})).toBe('')
    const workspace = readFileSync(
      join(dirname(new URL(import.meta.url).pathname), '../../../views/MarcoBridge/MarcoBridgeWorkspace.tsx'),
      'utf8',
    )
    expect(workspace).toContain('solanaWalletConnectionLabel')
    expect(workspace).toContain('data-testid="solana-wallet-connected"')
    expect(workspace).toMatch(/sourceWallet \? \([\s\S]*solanaWalletConnectionLabel\(sourceWallet\)/)
  })

  it('f) preserves the Solana signature in sourceTx and LayerZero tracking', async () => {
    const tracking = await submitSolanaMarcoBridgeFromWallet({
      request: {
        from: 'solana',
        to: 'bnb',
        amount: '0.000001',
        sourceWallet: solanaOwner,
        destinationWallet: evm,
      },
      authority: liveAuthority(),
      wallet: {
        publicKey: { toString: () => solanaOwner },
        signAndSendTransaction: async () => ({ signature: solanaSignature }),
      },
      protocol: mockProtocol(),
      confirmSource: async () => undefined,
      requestQuote: async () => liveSolanaQuote(),
    })
    expect(tracking.sourceTx).toBe(solanaSignature)
    expect(tracking.status).toBe('submitted')
    const delivered = trackingFromLayerZeroMessages(solanaSignature, [
      { guid: 'guid-sol', status: { name: 'DELIVERED' }, destination: { tx: { txHash: '0xdef' } } },
    ])
    expect(delivered).toMatchObject({
      status: 'delivered',
      sourceTx: solanaSignature,
      guid: 'guid-sol',
    })
  })

  it('g) leaves BNB→Solana executable and approval-free of Solana ATA approval', () => {
    const live = liveAuthority()
    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: CANONICAL_BNB_SOLANA_GATE.recipientExample,
        allowanceLD: '1000000000000',
      },
      {
        amount: '0.000001',
        expectedReceive: '0.000001',
        nativeFee: '0.000072607980676756',
        nativeFeeWei: '72607980676756',
        nativeFeeSymbol: 'BNB',
        routeLabel: 'BNB → Solana',
        quotedAt: '2026-09-01T12:00:00.000Z',
        live: true,
        routePaused: false,
        publiclyActive: true,
        executionEnabled: true,
      },
      live,
    )
    expect(isRouteExecutable('bnb', 'solana', live)).toBe(true)
    expect(built.executable).toBe(true)
    expect(built.approvalRequired).toBe(false)
    expect(built.transactions[0]).toMatchObject({ family: 'evm', purpose: 'oft_send', chainId: 56 })
    const solanaBuild = buildMarcoBridgeTransactions(
      { from: 'solana', to: 'bnb', amount: '0.000001', sourceWallet: solanaOwner, destinationWallet: evm },
      liveSolanaQuote(),
      live,
    )
    expect(solanaBuild.approvalRequired).toBe(false)
    expect(solanaBuild.transactions.some((tx) => tx.purpose === 'approve')).toBe(false)
  })

  it('h) keeps Base and Robinhood direct Solana routes disabled', () => {
    const live = liveAuthority()
    expect(isRouteExecutable('solana', 'base', live)).toBe(false)
    expect(isRouteExecutable('base', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'robinhood', live)).toBe(false)
    expect(isRouteExecutable('robinhood', 'solana', live)).toBe(false)
  })

  it('i) never broadcasts from tests and fail-closes submit without a wallet signature helper', async () => {
    const transport = { sendRawTransaction: vi.fn() }
    const signAndSendTransaction = vi.fn(async () => solanaSignature)
    await submitMarcoBridgeFromWallet({
      request: {
        from: 'solana',
        to: 'bnb',
        amount: '0.000001',
        sourceWallet: solanaOwner,
        destinationWallet: evm,
      },
      authority: liveAuthority(),
      solanaWallet: {
        publicKey: { toString: () => solanaOwner },
        signAndSendTransaction,
      },
      solanaProtocol: mockProtocol(),
      solanaTransport: transport,
      confirmSolanaSource: async () => undefined,
      requestQuote: async () => liveSolanaQuote(),
    })
    expect(transport.sendRawTransaction).not.toHaveBeenCalled()
    expect(signAndSendTransaction).toHaveBeenCalledTimes(1)

    await expect(
      submitSolanaMarcoBridgeFromWallet({
        request: {
          from: 'solana',
          to: 'bnb',
          amount: '0.000001',
          sourceWallet: solanaOwner,
          destinationWallet: evm,
        },
        authority: liveAuthority(),
        wallet: { publicKey: { toString: () => 'DifferentWallet111111111111111111111111111' } },
        protocol: mockProtocol(),
        confirmSource: async () => undefined,
        requestQuote: async () => liveSolanaQuote(),
      }),
    ).rejects.toThrow('does not match the quoted Solana source wallet')

    const browserOnlyRpcRead = vi.fn(async () => {
      throw new Error('Browser RPC must not be used for the submission preflight.')
    })
    const browserProtocol = mockProtocol({ fetchOwnerAccounts: browserOnlyRpcRead })
    await submitSolanaMarcoBridgeFromWallet({
      request: {
        from: 'solana',
        to: 'bnb',
        amount: '0.000001',
        sourceWallet: solanaOwner,
        destinationWallet: evm,
      },
      authority: liveAuthority(),
      wallet: {
        publicKey: { toString: () => solanaOwner },
        signAndSendTransaction: async () => solanaSignature,
      },
      protocol: browserProtocol,
      confirmSource: async () => undefined,
      requestQuote: async () => liveSolanaQuote(),
    })
    expect(browserOnlyRpcRead).not.toHaveBeenCalled()
  })

  it('uses enough compute headroom for the canonical OFT send', () => {
    expect(SOLANA_SEND_COMPUTE_UNITS).toBeGreaterThan(253_000)
    expect(SOLANA_SEND_COMPUTE_UNITS).toBeLessThanOrEqual(1_400_000)
  })

  it('does not report submitted until Solana observes the wallet signature', async () => {
    const confirmed = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'confirmed' }),
    })
    await expect(confirmSolanaSourceBroadcast(solanaSignature, confirmed as unknown as typeof fetch, 1)).resolves.toBe(
      undefined,
    )

    const missing = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'not-found' }),
    })
    await expect(confirmSolanaSourceBroadcast(solanaSignature, missing as unknown as typeof fetch, 1)).rejects.toThrow(
      'Solana did not observe the broadcast',
    )
  })
})
