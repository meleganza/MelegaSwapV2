import { ReviewDecisionExample, ReviewDecisionType, ReviewerType } from './review-types'

export const REVIEW_DECISION_TYPES: ReviewDecisionType[] = [
  'approve',
  'reject',
  'request_information',
  'defer',
  'blocked',
]

export const REVIEW_DECISION_RULES = [
  'Decisions are examples only — no execution, persistence, or registry mutation.',
  'approve does not write to registry in this build.',
  'reject halts propagation to event intake.',
  'request_information returns item to submission surface.',
  'defer keeps item queued without approval.',
  'blocked applies safety gate — no downstream routing.',
  'AI reviewer cannot issue approve without human governance in future missions.',
]

export const REVIEW_DECISION_EXAMPLES: ReviewDecisionExample[] = [
  {
    id: 'decision_approve_example',
    decision: 'approve',
    description: 'Human reviewer approves submission for event intake handoff — registry write still manual.',
    executesRegistryMutation: false,
    executesOnChain: false,
    reviewerType: 'human',
    notes: 'Schema example only — not applied to any live queue item.',
  },
  {
    id: 'decision_reject_example',
    decision: 'reject',
    description: 'Submission fails constitutional or evidence review.',
    executesRegistryMutation: false,
    executesOnChain: false,
    reviewerType: 'human',
    notes: 'Rejected items do not emit intake events.',
  },
  {
    id: 'decision_request_information_example',
    decision: 'request_information',
    description: 'Reviewer requests additional metadata, audit URI, or constitutional disclosure.',
    executesRegistryMutation: false,
    executesOnChain: false,
    reviewerType: 'human',
    notes: 'Moves item to Needs Information group when persistence exists.',
  },
  {
    id: 'decision_defer_example',
    decision: 'defer',
    description: 'Review deferred pending Labs runtime or governance timeline.',
    executesRegistryMutation: false,
    executesOnChain: false,
    reviewerType: 'governance',
    notes: 'Item remains queued — no fake approval.',
  },
  {
    id: 'decision_blocked_example',
    decision: 'blocked',
    description: 'Safety gate triggered — forbidden payload or canonical override attempt.',
    executesRegistryMutation: false,
    executesOnChain: false,
    reviewerType: 'human',
    notes: 'Blocked decisions prevent pipeline synchronization.',
  },
]

export const getDecisionExample = (decision: ReviewDecisionType): ReviewDecisionExample | undefined =>
  REVIEW_DECISION_EXAMPLES.find((example) => example.decision === decision)
