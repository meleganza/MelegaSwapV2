import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  assessPaymentWalletChain,
  parsePaymentWalletChainId,
  PAYMENT_SETTLEMENT_CHAIN_ID,
  readPaymentWalletChainId,
  resolvePaymentWalletForSettlement,
} from '../paymentWalletChain'
import { RC_COPY } from '../copy'

const CHECKOUT = path.resolve(__dirname, '../../../views/shared/monetization/CommercialCheckoutModal.tsx')

describe('payment wallet chain source of truth', () => {
  it('parses EIP-1193 hex and decimal chain ids', () => {
    expect(parsePaymentWalletChainId('0x38')).toBe(56)
    expect(parsePaymentWalletChainId('0x1')).toBe(1)
    expect(parsePaymentWalletChainId(56)).toBe(56)
    expect(parsePaymentWalletChainId('56')).toBe(56)
    expect(parsePaymentWalletChainId(null)).toBeNull()
  })

  it('reads the injected payment wallet chain, not a browsing-context RPC', async () => {
    const request = vi.fn(async () => '0x38')
    await expect(readPaymentWalletChainId({ request })).resolves.toBe(56)
    expect(request).toHaveBeenCalledWith({ method: 'eth_chainId', params: [] })
  })

  it('accepts MetaMask BNB 56 even when the DEX browsing context is Ethereum', async () => {
    const browsingSigner = {
      getChainId: async () => 1,
      sendTransaction: vi.fn(),
    }
    const resolved = await resolvePaymentWalletForSettlement({
      preferredProvider: { request: async () => '0x38' },
      fallbackSigner: browsingSigner,
    })
    expect(resolved.chainId).toBe(PAYMENT_SETTLEMENT_CHAIN_ID)
    expect(resolved.source).toBe('payment_wallet')
    expect(assessPaymentWalletChain(resolved.chainId).ok).toBe(true)
    expect(resolved.signer).not.toBe(browsingSigner)
  })

  it('asks to switch when the payment wallet is on Ethereum', async () => {
    const resolved = await resolvePaymentWalletForSettlement({
      preferredProvider: { request: async () => '0x1' },
      fallbackSigner: { getChainId: async () => 1, sendTransaction: vi.fn() },
    })
    const gate = assessPaymentWalletChain(resolved.chainId)
    expect(gate.ok).toBe(false)
    expect(gate.stage).toBe('switch_network')
    expect(gate.message).toBe(RC_COPY.wrongNetwork)
  })

  it('clears the false wrong-network state after the payment wallet reports 56', async () => {
    const stale = assessPaymentWalletChain(1)
    expect(stale.ok).toBe(false)
    const afterSwitch = assessPaymentWalletChain(56)
    expect(afterSwitch.ok).toBe(true)
    expect(afterSwitch.message).toBeNull()
  })

  it('falls back to the supplied signer only when no payment wallet provider exists', async () => {
    const fallback = { getChainId: async () => 56, sendTransaction: vi.fn() }
    const resolved = await resolvePaymentWalletForSettlement({ fallbackSigner: fallback })
    expect(resolved.chainId).toBe(56)
    expect(resolved.source).toBe('fallback_signer')
    expect(resolved.signer).toBe(fallback)
  })

  it('checkout pays from the payment-wallet helper instead of signer.getChainId()', () => {
    const checkout = readFileSync(CHECKOUT, 'utf8')
    expect(checkout).toContain('resolvePaymentWalletForSettlement')
    expect(checkout).toContain('assessPaymentWalletChain')
    expect(checkout).not.toMatch(/const connectedChainId = await signer\.getChainId\(\)/)
  })
})
