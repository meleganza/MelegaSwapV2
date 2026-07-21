import { resolveProjectBySlug } from '../resolveProject'
import type { ProjectRoadmapDocument } from './schema'
import { PROJECT_ROADMAP_SCHEMA_VERSION } from './schema'

/**
 * Roadmap presentation model — no invented milestones.
 * Staging may later publish attested milestones via Control Center; until then show unpublished.
 */
export function buildProjectRoadmapDocument(
  slug: string,
  generatedAt = new Date().toISOString(),
): ProjectRoadmapDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null

  return {
    schemaVersion: PROJECT_ROADMAP_SCHEMA_VERSION,
    projectId: resolved.project.upi,
    slug: resolved.project.slug,
    published: false,
    milestones: [],
    unpublishedReason: 'Project roadmap milestones have not been published in the certified registry.',
    generatedAt,
  }
}
