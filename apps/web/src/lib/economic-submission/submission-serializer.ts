import { resolveEconomicSubmissionReadModel } from './submission-read-model'
import { EconomicSubmissionManifest } from './submission-types'

export const ECONOMIC_SUBMISSION_MANIFEST_ID = 'manifest://melega/platform/economic-submission@0.1.0'

export const serializeEconomicSubmissionManifest = (): EconomicSubmissionManifest => {
  const model = resolveEconomicSubmissionReadModel()

  return {
    manifest: ECONOMIC_SUBMISSION_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    categories: model.categories,
    validation_rules: model.validationRules,
    review_gates: model.reviewGates,
    schema_examples: model.schemaExamples,
    live_submissions_indexed: model.liveSubmissionsIndexed,
    cross_links: model.crossLinks,
  }
}
