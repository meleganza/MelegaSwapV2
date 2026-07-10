import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'

const UNAVAILABLE_MARKERS = new Set(['—', '-', '0 MARCO', '0', 'No live pool'])

export const isUnavailableFarmMetric = (value?: string | null): boolean => {
  if (value === undefined || value === null) return true
  const trimmed = value.trim()
  if (!trimmed) return true
  if (UNAVAILABLE_MARKERS.has(trimmed)) return true
  if (/^0(\.0+)?\s*marco$/i.test(trimmed)) return true
  return false
}

export const displayFarmMetric = (value?: string | null): string => {
  if (isUnavailableFarmMetric(value)) return RUNTIME_UNAVAILABLE_LABEL
  return value!.trim()
}

export const stripTokenSymbol = (value: string, symbol = 'MARCO'): string =>
  value.replace(new RegExp(`\\s*${symbol}\\s*$`, 'i'), '').trim()

export const shortenContractAddress = (address?: string): string => {
  if (!address || address.length < 10 || address === 'On-chain') return address ?? RUNTIME_UNAVAILABLE_LABEL
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export const MARCO_EMITS_TODAY_LABEL = 'Marco Emits Today'

export const MARCO_EMISSION_UNAVAILABLE_REASON =
  'MasterChef regularCakePerBlock or active pool weight unavailable — emission cannot be read from chain.'
