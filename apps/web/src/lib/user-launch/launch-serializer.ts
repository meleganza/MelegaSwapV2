import { stripUndefinedDeep } from 'registry/venues/manifest'
import { USER_LAUNCH_VERSION } from './launch-capabilities'
import { LaunchManifest, LaunchReadModel } from './launch-types'

export const serializeUserLaunchManifest = (model: LaunchReadModel): LaunchManifest => {
  const manifest: LaunchManifest = {
    manifest: 'manifest://melega/platform/user-launch@0.1.0',
    api_version: USER_LAUNCH_VERSION,
    phase: 'user_launch_read_model',
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    constitutional: model.constitutional,
    summary: model.summary,
    capabilities: model.capabilities.map((capability) => ({
      capability_id: capability.id,
      label: capability.label,
      status: capability.status,
      availability: capability.availability,
      wallet_requirement: capability.walletRequirement,
      existing_flow_href: capability.existingFlowHref,
      registry_href: capability.registryHref,
      machine_manifest: capability.machineManifest,
      warnings: capability.warnings,
    })),
  }

  return stripUndefinedDeep(manifest) as LaunchManifest
}
