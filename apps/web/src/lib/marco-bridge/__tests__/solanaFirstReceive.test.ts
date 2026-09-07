import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Keypair } from '@solana/web3.js'
import { BigNumber } from '@ethersproject/bignumber'
import { describe, expect, it } from 'vitest'
import { applyCanonicalBnbSolanaApplicationGate } from '../canonicalBnbSolanaGate'
import { assertCanonicalRouteAuthority, type CanonicalMmnRouteState } from '../routeAuthority'
import {
  EXISTING_20M_RECOVERY,
  FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS,
  SPL_ATA_RENT_LAMPORTS,
  encodeExecutorLzReceiveOption,
  existing20mAtaCreatePlan,
  planSolanaFirstReceive,
  resolveSolanaFirstReceive,
} from '../solanaFirstReceive'
import { findAssociatedMarcoTokenAccount } from '../solanaWalletAccounts'
import { readOnlyMarcoBridgeQuote } from '../quoteTransport'
import { buildMarcoBridgeTransactions, OFT_SEND_IFACE } from '../transactionBuilder'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const mint = MARCO_WAVE1_NETWORKS.solana.marcoIdentity

const envelope = {
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-12',
    hub: 'bnb' as const,
    global_execution_enabled: false,
    networks: Object.values(MARCO_WAVE1_NETWORKS).map((network) => ({
      id: network.id,
      name: network.label,
      family: network.walletFamily,
      chain_id: network.chainId,
      eid: network.layerZeroEid,
      model: network.id === 'bnb' ? 'evm_oft_adapter' : network.id === 'solana' ? 'solana_oft' : 'evm_oft',
      token: network.marcoIdentity,
      token_decimals: network.tokenDecimals,
      endpoint_contract: network.endpointContract,
      requires_approval: network.id === 'bnb',
      paused: false,
    })),
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
}

const liveAuthority = (): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(envelope), { solanaStorePaused: false })

describe('BNB→Solana first-receive ATA', () => {
  it('encodes exact SPL ATA rent as lzReceive extraOptions and leaves existing ATA at 0', () => {
    expect(encodeExecutorLzReceiveOption(0, SPL_ATA_RENT_LAMPORTS)).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
    expect(encodeExecutorLzReceiveOption(200000, 0)).toBe(
      `0x000301001101${BigInt(200000).toString(16).padStart(32, '0')}`,
    )
    const fresh = Keypair.generate().publicKey.toBase58()
    const missing = planSolanaFirstReceive({ destinationWallet: fresh, ataExists: false })
    const present = planSolanaFirstReceive({ destinationWallet: fresh, ataExists: true })
    expect(missing.ata).toBe(findAssociatedMarcoTokenAccount(fresh, mint))
    expect(missing.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
    expect(missing.ataRentLamports).toBe(2_039_280)
    expect(present.extraOptions).toBe('0x')
    expect(present.ataRentLamports).toBe(0)
    expect(present.ata).toBe(missing.ata)
  })

  it('quotes and builds extraOptions for an arbitrary new wallet with no ATA', async () => {
    const fresh = Keypair.generate().publicKey.toBase58()
    const plan = await resolveSolanaFirstReceive({ destinationWallet: fresh, readAta: async () => false })
    expect(plan.ataExists).toBe(false)
    const quoteSend = async (_endpoint: string, sendParam: { extraOptions: string }) => {
      expect(sendParam.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
      return { nativeFee: BigNumber.from('90000000000000') }
    }
    const quote = await readOnlyMarcoBridgeQuote(
      { from: 'bnb', to: 'solana', amount: '1', destinationWallet: fresh, firstReceive: plan },
      liveAuthority(),
      { quoteSend, quoteOft: async () => ({ amountReceivedLD: BigNumber.from('1000000000000000000') }) },
    )
    expect(quote.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
    expect(quote.destinationAtaExists).toBe(false)
    expect(quote.ataRentLamports).toBe('2039280')
    expect(quote.destinationAta).toBe(plan.ata)
    const built = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'solana', amount: '1', sourceWallet: evm, destinationWallet: fresh, allowanceLD: '1000000000000000000' },
      quote,
      liveAuthority(),
    )
    expect(built.sendParam.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
    const decoded = OFT_SEND_IFACE.decodeFunctionData('send', (built.transactions[0] as { data: string }).data)
    expect(decoded.sendParam.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
  })

  it('keeps extraOptions 0x for an arbitrary wallet whose ATA already exists', async () => {
    const existing = Keypair.generate().publicKey.toBase58()
    const plan = await resolveSolanaFirstReceive({ destinationWallet: existing, readAta: async () => true })
    const quote = await readOnlyMarcoBridgeQuote(
      { from: 'bnb', to: 'solana', amount: '1', destinationWallet: existing, firstReceive: plan },
      liveAuthority(),
      {
        quoteSend: async (_endpoint, sendParam) => {
          expect(sendParam.extraOptions).toBe('0x')
          return { nativeFee: BigNumber.from('72607980676756') }
        },
        quoteOft: async () => ({ amountReceivedLD: BigNumber.from('1000000000000000000') }),
      },
    )
    expect(quote.extraOptions).toBe('0x')
    expect(quote.destinationAtaExists).toBe(true)
    expect(quote.ataRentLamports).toBe('0')
    const built = buildMarcoBridgeTransactions(
      { from: 'bnb', to: 'solana', amount: '1', sourceWallet: evm, destinationWallet: existing, allowanceLD: '1000000000000000000' },
      quote,
      liveAuthority(),
    )
    expect(built.sendParam.extraOptions).toBe('0x')
  })

  it('treats ATA read failure as missing so first-receive still funds rent', async () => {
    const fresh = Keypair.generate().publicKey.toBase58()
    const plan = await resolveSolanaFirstReceive({
      destinationWallet: fresh,
      readAta: async () => {
        throw new Error('rpc down')
      },
    })
    expect(plan.ataExists).toBe(false)
    expect(plan.extraOptions).toBe(FIRST_RECEIVE_LZ_RECEIVE_EXTRA_OPTIONS)
  })

  it('prepares the existing 20M recovery ATA without broadcasting or resending', () => {
    const recovery = existing20mAtaCreatePlan()
    expect(recovery.sourceTx).toBe(EXISTING_20M_RECOVERY.sourceTx)
    expect(recovery.guid).toBe(EXISTING_20M_RECOVERY.guid)
    expect(recovery.destinationWallet).toBe('bBpaFvmGvGmYGwuvXRb6ZXNHYzra4ed6tt7qRp3WK7Y')
    expect(recovery.ata).toBe(
      findAssociatedMarcoTokenAccount('bBpaFvmGvGmYGwuvXRb6ZXNHYzra4ed6tt7qRp3WK7Y', mint),
    )
    expect(recovery.ata).toBe('65VwbdJcJw7Ln4xEFDtmB1K7YfutmMf7iFcPcP6JDTV5')
    expect(recovery.broadcast).toBe(false)
    expect(recovery.doNot).toEqual(['resend', 'skip', 'nilify', 'burn'])
    expect(recovery.afterAtaExists).toMatch(/SAME LayerZero message/)
  })

  it('pins the Mac operator helper to the same 20M ATA identity', () => {
    const html = readFileSync(
      resolve(__dirname, '../../../../scripts/recover-20m-ata-operator/index.html'),
      'utf8',
    )
    expect(html).toContain(EXISTING_20M_RECOVERY.sourceTx)
    expect(html).toContain(EXISTING_20M_RECOVERY.guid)
    expect(html).toContain(EXISTING_20M_RECOVERY.destinationWallet)
    expect(html).toContain(EXISTING_20M_RECOVERY.mint)
    expect(html).toContain('65VwbdJcJw7Ln4xEFDtmB1K7YfutmMf7iFcPcP6JDTV5')
    expect(html).toContain('CreateIdempotent')
    expect(html).toContain('Do not resend')
    expect(html).not.toMatch(/oft_send|quoteSend|setPeer|set_oft_config/)
  })
})
