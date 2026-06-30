import { resolveCivilizationDryRunReadModel } from './dry-run-read-model'
import { CivilizationDryRunManifest } from './dry-run-types'

export const CIVILIZATION_DRY_RUN_MANIFEST_ID =
  'manifest://melega/platform/civilization-dry-run@0.1.0'

export const serializeCivilizationDryRunManifest = (): CivilizationDryRunManifest => {
  const model = resolveCivilizationDryRunReadModel()

  return {
    manifest: CIVILIZATION_DRY_RUN_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    live_dry_runs: model.liveDryRuns,
    flow: model.flow,
    scenarios: model.scenarios,
    validation_rules: model.validationRules,
    cross_links: model.crossLinks,
  }
}
