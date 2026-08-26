export type PublicPairTrade = {
  id: string
  timestamp: number
  txHash: string
  wallet: string
  direction: 'buy' | 'sell'
  amountUsd: number | null
  selectedTokenAmount: string
  selectedTokenAddress: string
  selectedTokenSymbol: string
  baseTokenAddress: string
  baseTokenSymbol: string
  quoteTokenAddress: string
  quoteTokenSymbol: string
}

export type GeckoTradeRow = {
  id?: unknown
  attributes?: {
    tx_hash?: unknown
    tx_from_address?: unknown
    from_token_amount?: unknown
    to_token_amount?: unknown
    block_timestamp?: unknown
    volume_in_usd?: unknown
    from_token_address?: unknown
    to_token_address?: unknown
  }
}

const EVM_ADDRESS = /^0x[a-f0-9]{40}$/

function normalizeAddress(value: unknown): string | null {
  const address = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return EVM_ADDRESS.test(address) ? address : null
}

function positiveDecimalString(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const text = String(value).trim()
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null
  const parsed = Number(text)
  return Number.isFinite(parsed) && parsed > 0 ? text : null
}

function finiteNonNegative(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function normalizeGeckoPairTrades(input: {
  rows: GeckoTradeRow[]
  selectedTokenAddress: string
  baseTokenAddress: string
  baseTokenSymbol: string
  quoteTokenAddress: string
  quoteTokenSymbol: string
}): PublicPairTrade[] {
  const selected = normalizeAddress(input.selectedTokenAddress)
  const base = normalizeAddress(input.baseTokenAddress)
  const quote = normalizeAddress(input.quoteTokenAddress)
  if (!selected || !base || !quote || (selected !== base && selected !== quote)) return []

  const poolTokens = new Set([base, quote])
  return input.rows
    .map((row): PublicPairTrade | null => {
      const attributes = row?.attributes
      const from = normalizeAddress(attributes?.from_token_address)
      const to = normalizeAddress(attributes?.to_token_address)
      const txHash = typeof attributes?.tx_hash === 'string' ? attributes.tx_hash.trim().toLowerCase() : ''
      const wallet = normalizeAddress(attributes?.tx_from_address)
      const timestampMs =
        typeof attributes?.block_timestamp === 'string' ? Date.parse(attributes.block_timestamp) : Number.NaN
      if (
        !from ||
        !to ||
        from === to ||
        !poolTokens.has(from) ||
        !poolTokens.has(to) ||
        !/^0x[a-f0-9]{64}$/.test(txHash) ||
        !wallet ||
        !Number.isFinite(timestampMs)
      ) {
        return null
      }

      const buysSelected = to === selected
      const sellsSelected = from === selected
      if (!buysSelected && !sellsSelected) return null
      const selectedAmount = positiveDecimalString(
        buysSelected ? attributes?.to_token_amount : attributes?.from_token_amount,
      )
      if (!selectedAmount) return null

      return {
        id: typeof row.id === 'string' && row.id.trim() ? row.id : txHash,
        timestamp: Math.floor(timestampMs / 1000),
        txHash,
        wallet,
        direction: buysSelected ? 'buy' : 'sell',
        amountUsd: finiteNonNegative(attributes?.volume_in_usd),
        selectedTokenAmount: selectedAmount,
        selectedTokenAddress: selected,
        selectedTokenSymbol: selected === base ? input.baseTokenSymbol : input.quoteTokenSymbol,
        baseTokenAddress: base,
        baseTokenSymbol: input.baseTokenSymbol,
        quoteTokenAddress: quote,
        quoteTokenSymbol: input.quoteTokenSymbol,
      }
    })
    .filter((row): row is PublicPairTrade => Boolean(row))
    .sort((a, b) => b.timestamp - a.timestamp)
}
