import { ReviewQueueStatus } from './review-types'

export const REVIEW_STATUS_ORDER: ReviewQueueStatus[] = [
  'draft',
  'submitted',
  'queued',
  'under_review',
  'approved',
  'rejected',
  'blocked',
  'not_indexed',
]

export const REVIEW_STATUS_LABELS: Record<ReviewQueueStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  queued: 'Queued',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  blocked: 'Blocked',
  not_indexed: 'Not Indexed',
}

export const isTerminalReviewStatus = (status: ReviewQueueStatus): boolean =>
  status === 'approved' || status === 'rejected' || status === 'blocked'

export const isActiveReviewStatus = (status: ReviewQueueStatus): boolean =>
  status === 'queued' || status === 'under_review' || status === 'submitted'
