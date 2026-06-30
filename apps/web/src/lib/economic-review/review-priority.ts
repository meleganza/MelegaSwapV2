import { ReviewPriority } from './review-types'

export const REVIEW_PRIORITY_ORDER: ReviewPriority[] = ['critical', 'high', 'normal', 'low']

export const priorityRank = (priority: ReviewPriority): number =>
  REVIEW_PRIORITY_ORDER.indexOf(priority)

export const REVIEW_PRIORITY_LABELS: Record<ReviewPriority, string> = {
  critical: 'Critical',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

export const categoryDefaultPriority = (category: string): ReviewPriority => {
  switch (category) {
    case 'project_narrative':
    case 'economic_presence_request':
      return 'high'
    case 'token_metadata':
    case 'launch_request':
      return 'normal'
    case 'future_ai_review':
      return 'low'
    default:
      return 'normal'
  }
}
