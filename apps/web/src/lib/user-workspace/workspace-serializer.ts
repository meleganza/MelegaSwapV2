import { stripUndefinedDeep } from 'registry/venues/manifest'
import { USER_WORKSPACE_VERSION } from './workspace-constants'
import { resolveUserWorkspaceReadModel } from './workspace-read-model'
import { UserWorkspaceManifest } from './workspace-types'

export const serializeUserWorkspaceManifest = (): UserWorkspaceManifest => {
  const model = resolveUserWorkspaceReadModel()

  const manifest: UserWorkspaceManifest = {
    manifest: 'manifest://melega/platform/user-workspace@0.1.0',
    api_version: USER_WORKSPACE_VERSION,
    phase: 'user_workspace_read_model',
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    constitutional: model.constitutional,
    sections: model.sections.map((section) => ({
      section_id: section.id,
      label: section.label,
      module_href: section.moduleHref,
      indexed_count: section.indexedCount,
      has_activity: section.hasActivity,
      items: section.items,
    })),
    future_surfaces: model.futureSurfaces,
  }

  return stripUndefinedDeep(manifest) as UserWorkspaceManifest
}
