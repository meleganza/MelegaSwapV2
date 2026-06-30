import {
  EXECUTION_CONSTRAINTS,
  MATERIAL_QUALITY_GAP,
  MINIMUM_VENUE_HEALTH,
  SMART_EXECUTION_AS_OF,
} from './execution-constraints'
import { getSampleCandidates, getSmartExecutionConstitutional, getSmartExecutionDisclaimer } from './execution-candidates'
import { buildReason, resetReasonCounter } from './execution-reasons'
import {
  computeAllScoreBreakdowns,
  computeCivilizationBenefitScore,
  computeExecutionQualityScore,
  getVenueHealthScore,
} from './execution-score'
import {
  AlternativeExecution,
  ExecutionCandidate,
  ExecutionReason,
  ExecutionRecommendation,
  RejectedExecution,
  SmartExecutionReadModel,
} from './execution-types'

const findCandidate = (candidates: ExecutionCandidate[], id: string): ExecutionCandidate => {
  const candidate = candidates.find((entry) => entry.id === id)
  if (!candidate) throw new Error(`Unknown candidate: ${id}`)
  return candidate
}

const buildRejectionReasons = (
  candidate: ExecutionCandidate,
  bestQuality: number,
  qualityScore: number,
  civilizationScore: number,
  bestCivilization: number,
): ExecutionReason[] => {
  const reasons: ExecutionReason[] = []
  const venueHealth = getVenueHealthScore(candidate)

  if (venueHealth < MINIMUM_VENUE_HEALTH) {
    reasons.push(
      buildReason(
        'rejection',
        `Venue health ${venueHealth} below floor ${MINIMUM_VENUE_HEALTH} — rejected regardless of civilization benefit (${civilizationScore}).`,
        candidate.id,
      ),
    )
  }

  const qualityGap = bestQuality - qualityScore
  if (qualityGap >= MATERIAL_QUALITY_GAP) {
    reasons.push(
      buildReason(
        'rejection',
        `Execution quality ${qualityScore} trails recommended ${bestQuality} by ${qualityGap} points — materially worse for user.`,
        candidate.id,
      ),
    )

    if (civilizationScore > bestCivilization) {
      reasons.push(
        buildReason(
          'constraint',
          `Civilization benefit ${civilizationScore} exceeds recommended ${bestCivilization} but cannot override material quality gap.`,
          candidate.id,
        ),
      )
    }
  }

  if (reasons.length === 0) {
    reasons.push(
      buildReason(
        'rejection',
        `Execution quality ${qualityScore} does not meet recommendation threshold.`,
        candidate.id,
      ),
    )
  }

  return reasons
}

export const resolveSmartExecutionReadModel = (): SmartExecutionReadModel => {
  resetReasonCounter()

  const candidates = getSampleCandidates()
  const scores = computeAllScoreBreakdowns(candidates)
  const constitutional = getSmartExecutionConstitutional()

  const ranked = [...candidates].sort(
    (left, right) => computeExecutionQualityScore(right) - computeExecutionQualityScore(left),
  )

  const recommendedCandidate = ranked[0]
  const recommendedQuality = computeExecutionQualityScore(recommendedCandidate)
  const recommendedCivilization = computeCivilizationBenefitScore(recommendedCandidate)

  const recommendationReasons: ExecutionReason[] = [
    buildReason(
      'constitutional',
      `Canonical economy: ${constitutional.canonicalAsset} on ${constitutional.canonicalChain} (${constitutional.status}).`,
    ),
    buildReason(
      'recommendation',
      `Highest execution quality score ${recommendedQuality} among illustrative candidates.`,
      recommendedCandidate.id,
    ),
    buildReason(
      'constraint',
      'Civilization benefit evaluated separately — never overrides execution quality.',
      recommendedCandidate.id,
    ),
  ]

  const recommendation: ExecutionRecommendation = {
    candidateId: recommendedCandidate.id,
    label: recommendedCandidate.label,
    venue: recommendedCandidate.venue,
    chain: recommendedCandidate.chain,
    executionQualityScore: recommendedQuality,
    civilizationBenefitScore: recommendedCivilization,
    reasons: recommendationReasons,
  }

  const rejections: RejectedExecution[] = []
  const alternatives: AlternativeExecution[] = []

  ranked.slice(1).forEach((candidate) => {
    const qualityScore = computeExecutionQualityScore(candidate)
    const civilizationScore = computeCivilizationBenefitScore(candidate)
    const qualityGap = recommendedQuality - qualityScore
    const venueHealth = getVenueHealthScore(candidate)

    const isRejected =
      venueHealth < MINIMUM_VENUE_HEALTH || qualityGap >= MATERIAL_QUALITY_GAP

    if (isRejected) {
      rejections.push({
        candidateId: candidate.id,
        label: candidate.label,
        reasons: buildRejectionReasons(
          candidate,
          recommendedQuality,
          qualityScore,
          civilizationScore,
          recommendedCivilization,
        ),
      })
      return
    }

    const altReasons: ExecutionReason[] = [
      buildReason(
        'alternative',
        `Execution quality ${qualityScore} — within ${MATERIAL_QUALITY_GAP} points of recommended.`,
        candidate.id,
      ),
    ]

    if (civilizationScore > recommendedCivilization) {
      altReasons.push(
        buildReason(
          'constraint',
          `Higher civilization benefit (${civilizationScore}) noted but does not change ranking.`,
          candidate.id,
        ),
      )
    }

    alternatives.push({
      candidateId: candidate.id,
      label: candidate.label,
      rank: alternatives.length + 2,
      executionQualityScore: qualityScore,
      civilizationBenefitScore: civilizationScore,
      gapFromRecommended: qualityGap,
      reasons: altReasons,
    })
  })

  const reasons: ExecutionReason[] = [
    ...EXECUTION_CONSTRAINTS.map((constraint) =>
      buildReason('constraint', `${constraint.label}: ${constraint.rule}`),
    ),
    ...recommendation.reasons,
    ...alternatives.flatMap((alternative) => alternative.reasons),
    ...rejections.flatMap((rejection) => rejection.reasons),
  ]

  return {
    asOf: SMART_EXECUTION_AS_OF,
    disclaimer: getSmartExecutionDisclaimer(),
    illustrative: true,
    constitutional,
    constraints: EXECUTION_CONSTRAINTS.map((constraint) => ({ ...constraint })),
    candidates,
    scores,
    recommendation,
    alternatives,
    rejections,
    reasons,
  }
}

export const getRecommendedCandidate = (): ExecutionCandidate => {
  const model = resolveSmartExecutionReadModel()
  return findCandidate(model.candidates, model.recommendation.candidateId)
}
