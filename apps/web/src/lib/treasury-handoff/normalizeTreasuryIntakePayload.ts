import type { ExecutionReceiptPayload } from './types'
import { assertPayloadDoesNotOwnSettlement } from './ownership'

/** Outbound shape expected by Treasury Runtime intake — not settlement truth. */
export interface TreasuryIntakePayload {
  schema: 'melega.dex-execution-receipt.v1'
  chain: string
  asset: string
  amount: number
  fee: number
  transactionHash: string
  wallet: string
  timestamp: string
  status: 'confirmed'
  operation: 'swap'
  originModule: 'trade'
  explorerUrl?: string
  originProject?: string
}

export type NormalizeTreasuryIntakeResult =
  | { ok: true; payload: TreasuryIntakePayload }
  | { ok: false; machine_code: 'INVALID_RECEIPT'; reason: string }

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return null
}

export function normalizeChainProvenance(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return String(id)
    if (typeof id === 'string' && id.trim()) return id.trim()
  }
  return null
}

export function normalizeAssetSymbol(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (value && typeof value === 'object') {
    const asset = value as Record<string, unknown>
    if (typeof asset.symbol === 'string' && asset.symbol.trim()) {
      return asset.symbol.trim()
    }
    if (typeof asset.address === 'string' && asset.address.trim()) {
      return asset.address.trim()
    }
  }
  return null
}

function resolveGrossAmount(source: Record<string, unknown>): number | null {
  for (const key of ['exactAmount', 'amount', 'inputAmount']) {
    const parsed = parsePositiveNumber(source[key])
    if (parsed != null) return parsed
  }
  return null
}

function resolveProtocolFee(source: Record<string, unknown>): number | null {
  return parsePositiveNumber(source.fee)
}

function resolveTransactionHash(source: Record<string, unknown>): string | null {
  const hash = source.transactionHash
  if (typeof hash === 'string' && hash.trim()) return hash.trim()
  return null
}

function resolveWallet(source: Record<string, unknown>): string | null {
  const wallet = source.wallet
  if (typeof wallet === 'string' && wallet.trim()) return wallet.trim()
  return null
}

function resolveExplorerUrl(source: Record<string, unknown>): string | undefined {
  const url = source.explorerUrl
  if (typeof url === 'string' && url.trim()) return url.trim()
  return undefined
}

/**
 * Maps DEX execution receipt fields to Treasury Runtime intake contract.
 * Does not compute waterfall splits or settlement identifiers.
 */
export function normalizeTreasuryIntakePayload(
  input: ExecutionReceiptPayload | Record<string, unknown>,
): NormalizeTreasuryIntakeResult {
  const source = input as Record<string, unknown>

  try {
    assertPayloadDoesNotOwnSettlement(source)
  } catch (error) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: error instanceof Error ? error.message : 'Forbidden settlement field',
    }
  }

  const status = source.status
  if (status !== 'confirmed') {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'Only confirmed execution receipts may be submitted to Treasury Runtime',
    }
  }

  const chain = normalizeChainProvenance(source.chain)
  if (!chain) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'Chain provenance is required for Treasury intake',
    }
  }

  const asset = normalizeAssetSymbol(source.asset)
  if (!asset) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'Asset attribution is required for Treasury intake',
    }
  }

  const amount = resolveGrossAmount(source)
  if (amount == null) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'Gross amount is required and must be positive — Treasury never estimates',
    }
  }

  const fee = resolveProtocolFee(source)
  if (fee == null) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'Protocol fee is required and must be positive — DEX must not estimate fees for Treasury',
    }
  }

  const transactionHash = resolveTransactionHash(source)
  if (!transactionHash) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'transactionHash is required',
    }
  }

  const wallet = resolveWallet(source)
  if (!wallet) {
    return {
      ok: false,
      machine_code: 'INVALID_RECEIPT',
      reason: 'wallet is required',
    }
  }

  const timestamp = typeof source.timestamp === 'string' && source.timestamp.trim()
    ? source.timestamp.trim()
    : new Date().toISOString()

  const payload: TreasuryIntakePayload = {
    schema: 'melega.dex-execution-receipt.v1',
    chain,
    asset,
    amount,
    fee,
    transactionHash,
    wallet,
    timestamp,
    status: 'confirmed',
    operation: 'swap',
    originModule: 'trade',
  }

  const explorerUrl = resolveExplorerUrl(source)
  if (explorerUrl) {
    payload.explorerUrl = explorerUrl
  }

  const originProject = source.originProject
  if (typeof originProject === 'string' && originProject.trim()) {
    payload.originProject = originProject.trim()
  }

  assertPayloadDoesNotOwnSettlement(payload as unknown as Record<string, unknown>)

  return { ok: true, payload }
}
