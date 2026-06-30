import { SubmissionReviewGate } from './submission-types'

export const SUBMISSION_REVIEW_GATES: SubmissionReviewGate[] = [
  {
    id: 'draft',
    status: 'draft',
    description: 'Submission not yet sent for review — local schema only in this build.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: false,
  },
  {
    id: 'submitted',
    status: 'submitted',
    description: 'Submission received — queued for review when persistence layer exists.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: true,
  },
  {
    id: 'under_review',
    status: 'under_review',
    description: 'Human reviewer examining submission against constitutional policy.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: true,
  },
  {
    id: 'approved',
    status: 'approved',
    description: 'Approved for event intake handoff — registry mutation still manual in this build.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: true,
  },
  {
    id: 'rejected',
    status: 'rejected',
    description: 'Submission rejected — no registry or intake propagation.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: true,
  },
  {
    id: 'blocked',
    status: 'blocked',
    description: 'Submission blocked by safety gate — unsafe or forbidden payload.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: true,
  },
  {
    id: 'not_indexed',
    status: 'not_indexed',
    description: 'No live submission indexed — schema example only.',
    allowsRegistryMutation: false,
    requiresHumanReviewer: false,
  },
]

export const SUBMISSION_REVIEW_RULES = [
  'No fake approval outcomes — schema examples use not_indexed or draft only.',
  'Human reviewer required for all paths except draft and not_indexed.',
  'Approved submissions emit event intake family mapping — never direct registry write.',
  'AI reviewer actions are advisory — cannot set approved status.',
  'Rejected submissions must include humanReviewerAction rationale in future persistence.',
  'Blocked submissions cannot proceed to event intake.',
]

export const getReviewGate = (status: string): SubmissionReviewGate | undefined =>
  SUBMISSION_REVIEW_GATES.find((gate) => gate.status === status)
