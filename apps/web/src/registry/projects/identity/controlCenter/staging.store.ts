import type {
  StagedDeveloperDraft,
  StagedEcosystemDraft,
  StagedProfileDraft,
  StagedResourceDraft,
  StagedUpdateDraft,
} from './types'

export interface ProjectStagingBucket {
  profile: StagedProfileDraft | null
  resources: Map<string, StagedResourceDraft>
  updates: Map<string, StagedUpdateDraft>
  ecosystem: Map<string, StagedEcosystemDraft>
  developer: Map<string, StagedDeveloperDraft>
}

const globalKey = '__melega_pp012_control_center_staging__'

function getRoot(): Map<string, ProjectStagingBucket> {
  const g = globalThis as typeof globalThis & { [globalKey]?: Map<string, ProjectStagingBucket> }
  if (!g[globalKey]) g[globalKey] = new Map()
  return g[globalKey]!
}

function emptyBucket(): ProjectStagingBucket {
  return {
    profile: null,
    resources: new Map(),
    updates: new Map(),
    ecosystem: new Map(),
    developer: new Map(),
  }
}

export function getStagingBucket(slug: string): ProjectStagingBucket {
  const root = getRoot()
  let bucket = root.get(slug)
  if (!bucket) {
    bucket = emptyBucket()
    root.set(slug, bucket)
  }
  return bucket
}

export function resetStagingForTests(): void {
  getRoot().clear()
}

export function listStagedResources(slug: string): StagedResourceDraft[] {
  return [...getStagingBucket(slug).resources.values()].sort((a, b) => a.resourceKey.localeCompare(b.resourceKey))
}

export function listStagedUpdates(slug: string): StagedUpdateDraft[] {
  return [...getStagingBucket(slug).updates.values()].sort((a, b) => a.stableKey.localeCompare(b.stableKey))
}

export function listStagedEcosystem(slug: string): StagedEcosystemDraft[] {
  return [...getStagingBucket(slug).ecosystem.values()].sort((a, b) => a.serviceKey.localeCompare(b.serviceKey))
}

export function listStagedDeveloper(slug: string): StagedDeveloperDraft[] {
  return [...getStagingBucket(slug).developer.values()].sort((a, b) => a.resourceKey.localeCompare(b.resourceKey))
}
