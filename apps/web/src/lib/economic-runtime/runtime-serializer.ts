import { stripUndefinedDeep } from 'registry/venues/manifest'
import { getRuntimeVersion } from './activation-session'
import { ActivationRuntimeManifest, ActivationSession } from './runtime-types'

export const serializeActivationRuntime = (session: ActivationSession): ActivationRuntimeManifest => {
  const manifest: ActivationRuntimeManifest = {
    manifest: 'manifest://melega/platform/economic-runtime@0.1.0',
    api_version: getRuntimeVersion(),
    phase: 'labs_dex_runtime_read_model',
    session_id: session.sessionId,
    read_only: true,
    execution_enabled: false,
    as_of: session.asOf,
    progress: session.progress,
    stages: session.stages.map((stage) => ({
      stage_id: stage.id,
      state: stage.state,
      reason: stage.reason,
      next_requirement: stage.nextRequirement,
      evidence: stage.evidence,
    })),
    journal_tail: session.journal.slice(-6),
  }

  return stripUndefinedDeep(manifest) as ActivationRuntimeManifest
}
