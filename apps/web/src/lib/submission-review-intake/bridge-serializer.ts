import { resolveSubmissionReviewIntakeReadModel } from './bridge-read-model'
import { SubmissionReviewIntakeManifest } from './bridge-types'

export const SUBMISSION_REVIEW_INTAKE_MANIFEST_ID =
  'manifest://melega/platform/submission-review-intake@0.1.0'

export const serializeSubmissionReviewIntakeManifest = (): SubmissionReviewIntakeManifest => {
  const model = resolveSubmissionReviewIntakeReadModel()

  return {
    manifest: SUBMISSION_REVIEW_INTAKE_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    live_bridge_events: model.liveBridgeEvents,
    flow: model.flow,
    mappings: model.mappings,
    flow_examples: model.flowExamples,
    validation_rules: model.validationRules,
    cross_links: model.crossLinks,
  }
}
