import { DecisionEventTypeDefinition } from './decision-event-types'

export const DECISION_EVENT_TYPES: DecisionEventTypeDefinition[] = [
  {
    type: 'review_requested',
    label: 'Review Requested',
    description: 'Submission entered review queue — no approval implied.',
    mapsToDecisionType: 'lifecycle',
    defaultReviewerType: 'human',
    defaultSafety: 'human_review_required',
  },
  {
    type: 'review_started',
    label: 'Review Started',
    description: 'Reviewer assigned and review session opened — observation only.',
    mapsToDecisionType: 'lifecycle',
    defaultReviewerType: 'human',
    defaultSafety: 'human_review_required',
  },
  {
    type: 'information_requested',
    label: 'Information Requested',
    description: 'Reviewer requests additional evidence — returns flow to submission surface.',
    mapsToDecisionType: 'request_information',
    defaultReviewerType: 'human',
    defaultSafety: 'human_review_required',
  },
  {
    type: 'review_approved',
    label: 'Review Approved',
    description: 'Human reviewer approves for intake handoff — registry write still manual.',
    mapsToDecisionType: 'approve',
    defaultReviewerType: 'human',
    defaultSafety: 'human_review_required',
  },
  {
    type: 'review_rejected',
    label: 'Review Rejected',
    description: 'Submission fails review — intake propagation halted.',
    mapsToDecisionType: 'reject',
    defaultReviewerType: 'human',
    defaultSafety: 'human_review_required',
  },
  {
    type: 'review_blocked',
    label: 'Review Blocked',
    description: 'Safety gate triggered — constitutional or forbidden payload block.',
    mapsToDecisionType: 'blocked',
    defaultReviewerType: 'human',
    defaultSafety: 'blocked',
  },
  {
    type: 'review_deferred',
    label: 'Review Deferred',
    description: 'Review deferred pending governance or Labs timeline — no fake approval.',
    mapsToDecisionType: 'defer',
    defaultReviewerType: 'governance',
    defaultSafety: 'human_review_required',
  },
]

export const getDecisionEventTypeDefinition = (
  type: DecisionEventTypeDefinition['type'],
): DecisionEventTypeDefinition | undefined =>
  DECISION_EVENT_TYPES.find((definition) => definition.type === type)
