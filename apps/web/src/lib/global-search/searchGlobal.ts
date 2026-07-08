import type { GlobalSearchEntry, GlobalSearchResult } from './types'

const tokenize = (query: string): string[] =>
  query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)

const scoreEntry = (entry: GlobalSearchEntry, tokens: string[]): number => {
  if (!tokens.length) return 0

  const label = entry.label.toLowerCase()
  const haystack = entry.searchableText
  let matchScore = 0

  tokens.forEach((token) => {
    if (label === token) matchScore += 120
    else if (label.startsWith(token)) matchScore += 80
    else if (new RegExp(`\\b${escapeRegExp(token)}\\b`).test(haystack)) matchScore += 50
    else if (haystack.includes(token)) matchScore += 25
  })

  if (matchScore === 0) return 0
  return matchScore + (entry.scoreBoost ?? 0)
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const searchGlobal = (
  index: GlobalSearchEntry[],
  query: string,
  limit = 12,
): GlobalSearchResult[] => {
  const trimmed = query.trim()
  const tokens = tokenize(trimmed)
  if (!tokens.length) return []

  const results: GlobalSearchResult[] = []

  if (/^0x[a-fA-F0-9]{6,}$/.test(trimmed)) {
    const normalized = trimmed.toLowerCase()
    const contractHits = index.filter(
      (entry) =>
        entry.searchableText.includes(normalized) ||
        entry.label.toLowerCase() === normalized,
    )
    if (contractHits.length) {
      contractHits.forEach((entry) => {
        results.push({ ...entry, score: 200 })
      })
    } else {
      results.push({
        id: `wallet-${normalized}`,
        label: trimmed,
        subtitle: 'Wallet or contract address — open Radar intelligence',
        href: `/radar?contract=${encodeURIComponent(trimmed)}`,
        category: 'contract',
        searchableText: normalized,
        score: 150,
      })
    }
  }

  const scored = index
    .map((entry) => ({ ...entry, score: scoreEntry(entry, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))

  const seen = new Set<string>()
  const deduped: GlobalSearchResult[] = []

  for (const result of [...results, ...scored].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))) {
    const key = `${result.category}:${result.href}:${result.label}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(result)
    if (deduped.length >= limit) break
  }

  return deduped
}
