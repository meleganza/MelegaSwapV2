import type { PendingProjectRecord } from './types'

const REVIEW_READY_THRESHOLD = 40

export function computePendingReadinessScore(record: Pick<
  PendingProjectRecord,
  'contract' | 'chain' | 'name' | 'symbol' | 'logo' | 'website' | 'socials' | 'category' | 'description_ai' | 'description_owner' | 'sources'
>): PendingProjectRecord['health'] {
  const missing: string[] = []
  let score = 0

  if (record.contract) score += 20
  else missing.push('contract')

  if (record.chain) score += 10
  else missing.push('chain')

  if (record.name.available) score += 15
  else missing.push('name')

  if (record.symbol.available) score += 15
  else missing.push('symbol')

  if (record.website.available) score += 10
  else missing.push('website')

  const socialCount = Object.values(record.socials).filter((s) => s?.available).length
  if (socialCount > 0) score += Math.min(10, socialCount * 3)
  else missing.push('socials')

  if (record.logo.available) score += 5
  else missing.push('logo')

  if (record.category.available) score += 5
  else missing.push('category')

  if (record.description_ai.available || record.description_owner.available) score += 10
  else missing.push('description')

  if (record.sources.available) score += 5
  else missing.push('sources')

  const identityFields = [
    record.name.available,
    record.symbol.available,
    record.website.available,
    socialCount > 0,
    record.logo.available,
  ]
  const identityCompleteness = Math.round(
    (identityFields.filter(Boolean).length / identityFields.length) * 100,
  )

  return {
    readiness_score: Math.min(100, score),
    identity_completeness: identityCompleteness,
    review_ready: score >= REVIEW_READY_THRESHOLD,
    missing_fields: missing,
  }
}
