import { FEATURED_OFFER, FEATURED_PAYMENT_TOKENS, type FeaturedPayAsset } from './constants'
import { isQuoteExpired } from './quote'

const ERC20_TRANSFER_SELECTOR = '0xa9059cbb'

export type PreparedFeaturedPayment = {
  chainId: 56
  paymentAsset: FeaturedPayAsset
  to: string
  valueHex: string
  data: string
  tokenAddress: string | null
  tokenAmount: string
  tokenAmountRaw: string
  usdReferenceAmount: number
  quoteExpiration: string
  kind: 'native' | 'erc20'
}

function padAddress(addr: string): string {
  return addr.replace(/^0x/i, '').toLowerCase().padStart(64, '0')
}

function padUint256(raw: string): string {
  return BigInt(raw).toString(16).padStart(64, '0')
}

/** Build wallet tx request for Featured payment to MELEGA TREASURY WALLET. */
export function prepareFeaturedPayment(input: {
  paymentAsset: FeaturedPayAsset
  tokenAmountRaw: string
  tokenAmount: string
  quoteExpiration: string
}): PreparedFeaturedPayment {
  if (isQuoteExpired(input.quoteExpiration)) {
    throw new Error('QUOTE_EXPIRED')
  }
  const meta = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  const treasury = FEATURED_OFFER.treasuryWallet

  if (meta.kind === 'native') {
    return {
      chainId: 56,
      paymentAsset: input.paymentAsset,
      to: treasury,
      valueHex: `0x${BigInt(input.tokenAmountRaw).toString(16)}`,
      data: '0x',
      tokenAddress: null,
      tokenAmount: input.tokenAmount,
      tokenAmountRaw: input.tokenAmountRaw,
      usdReferenceAmount: FEATURED_OFFER.usdPrice,
      quoteExpiration: input.quoteExpiration,
      kind: 'native',
    }
  }

  if (!meta.address) throw new Error('TOKEN_ADDRESS_MISSING')
  const data = `${ERC20_TRANSFER_SELECTOR}${padAddress(treasury)}${padUint256(input.tokenAmountRaw)}`
  return {
    chainId: 56,
    paymentAsset: input.paymentAsset,
    to: meta.address,
    valueHex: '0x0',
    data: data as `0x${string}`,
    tokenAddress: meta.address,
    tokenAmount: input.tokenAmount,
    tokenAmountRaw: input.tokenAmountRaw,
    usdReferenceAmount: FEATURED_OFFER.usdPrice,
    quoteExpiration: input.quoteExpiration,
    kind: 'erc20',
  }
}

export type ReceiptValidation = {
  ok: boolean
  reason?: string
  destinationOk?: boolean
  amountOk?: boolean
  tokenOk?: boolean
  statusOk?: boolean
}

/**
 * Validate a confirmed receipt for Featured payment.
 * Native: tx.to === treasury and value >= quoted raw.
 * ERC-20: log Transfer(from, treasury, amount) on the payment token.
 */
export function validateFeaturedReceipt(input: {
  paymentAsset: FeaturedPayAsset
  tokenAmountRaw: string
  txTo: string | null
  txValueHex: string | null
  txStatus: string | number | null
  logs?: Array<{ address: string; topics: string[]; data: string }>
}): ReceiptValidation {
  const statusOk =
    input.txStatus === '0x1' || input.txStatus === 1 || input.txStatus === '1' || input.txStatus === 'success'
  if (!statusOk) return { ok: false, reason: 'TX_FAILED', statusOk: false }

  const treasury = FEATURED_OFFER.treasuryWallet.toLowerCase()
  const meta = FEATURED_PAYMENT_TOKENS[input.paymentAsset]
  const needed = BigInt(input.tokenAmountRaw)

  if (meta.kind === 'native') {
    const toOk = (input.txTo || '').toLowerCase() === treasury
    const value = BigInt(input.txValueHex || '0x0')
    const amountOk = value >= needed
    return {
      ok: toOk && amountOk,
      destinationOk: toOk,
      amountOk,
      tokenOk: true,
      statusOk: true,
      reason: !toOk ? 'BAD_DESTINATION' : !amountOk ? 'BAD_AMOUNT' : undefined,
    }
  }

  const token = (meta.address || '').toLowerCase()
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  const match = (input.logs || []).find((log) => {
    if (log.address.toLowerCase() !== token) return false
    if ((log.topics[0] || '').toLowerCase() !== transferTopic) return false
    const toTopic = (log.topics[2] || '').toLowerCase()
    if (!toTopic.endsWith(treasury.slice(2))) return false
    const amount = BigInt(log.data || '0x0')
    return amount >= needed
  })

  return {
    ok: Boolean(match),
    destinationOk: Boolean(match),
    amountOk: Boolean(match),
    tokenOk: Boolean(match),
    statusOk: true,
    reason: match ? undefined : 'TRANSFER_NOT_FOUND',
  }
}

export function assertNoTreasuryRuntime(source: string): boolean {
  return !/treasury[_-]?runtime|TreasuryRuntime|treasury-runtime/i.test(source)
}
