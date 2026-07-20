import { resolveProjectBySlug } from '../resolveProject'
import { normalizeProjectDocument } from '../normalizeProject'
import { buildProjectEvidencePack } from './buildProjectEvidence'
import type { ProjectEvidencePack } from './types'
import type { CanonicalProjectDocument } from '../types'

export function loadProjectEvidencePack(
  rawSlug: unknown,
  options?: { generatedAt?: string; asOf?: string; origin?: string },
): { document: CanonicalProjectDocument; evidencePack: ProjectEvidencePack } | null {
  const resolved = resolveProjectBySlug(rawSlug)
  if (!resolved.ok) return null
  const generatedAt = options?.generatedAt ?? new Date().toISOString()
  const document = normalizeProjectDocument(resolved.project, {
    generatedAt,
    origin: options?.origin,
  })
  const evidencePack = buildProjectEvidencePack(document, resolved.project, {
    generatedAt,
    asOf: options?.asOf ?? generatedAt,
  })
  return { document, evidencePack }
}
