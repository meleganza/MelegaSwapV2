import { resolveEconomicReviewReadModel } from './review-read-model'
import { EconomicReviewManifest } from './review-types'

export const ECONOMIC_REVIEW_MANIFEST_ID = 'manifest://melega/platform/economic-review@0.1.0'

export const serializeEconomicReviewManifest = (): EconomicReviewManifest => {
  const model = resolveEconomicReviewReadModel()

  return {
    manifest: ECONOMIC_REVIEW_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    live_review_queue: model.liveReviewQueue,
    queue_summary: model.queueSummary,
    groups: model.groups,
    decision_examples: model.decisionExamples,
    cross_links: model.crossLinks,
  }
}
