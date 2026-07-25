import type { StaticProjectRecord } from 'registry/projects/types'
import { fetchSpaceProfessionalProfile } from './fetchSpaceProfile'
import { resolveSpaceProfileReference } from './linkPolicy'
import { toSpaceProfessionalProfileApiSummary } from './toApiSummary'
import type { SpaceProfessionalProfileApiSummary, SpaceProfessionalProfileSnapshot } from './types'

export async function resolveProjectSpaceProfessionalProfile(
  project: StaticProjectRecord,
): Promise<{
  snapshot: SpaceProfessionalProfileSnapshot
  summary: SpaceProfessionalProfileApiSummary
  linkReason: string
}> {
  const link = resolveSpaceProfileReference(project)
  const snapshot = await fetchSpaceProfessionalProfile(link.reference)
  return {
    snapshot,
    summary: toSpaceProfessionalProfileApiSummary(snapshot),
    linkReason: link.reason,
  }
}
