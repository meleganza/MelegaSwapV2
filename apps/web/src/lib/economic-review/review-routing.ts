import { ReviewQueueGroupId } from './review-types'

export const REVIEW_ROUTING_TARGETS = {
  submission: '/submit',
  pipeline: '/pipeline',
  orchestrator: '/orchestrator',
  workspace: '/command-center',
  review: '/review',
  intake: '/registry/intake/real-event-intake.json',
} as const

export const REVIEW_QUEUE_GROUP_ROUTING: Record<
  ReviewQueueGroupId,
  { primarySurface: string; notes: string }
> = {
  waiting_review: {
    primarySurface: '/review',
    notes: 'Items await human reviewer assignment when persistence layer exists.',
  },
  needs_information: {
    primarySurface: '/submit',
    notes: 'Return to submission surface to supply missing evidence.',
  },
  blocked: {
    primarySurface: '/review',
    notes: 'Blocked items do not propagate to pipeline or orchestrator.',
  },
  future_review: {
    primarySurface: '/orchestrator',
    notes: 'Future AI or governance review paths — not active in this build.',
  },
  completed: {
    primarySurface: '/pipeline',
    notes: 'Schema examples only — no live completed reviews indexed.',
  },
}

export const REVIEW_CROSS_LINKS = [
  { label: 'Submission', route: '/submit' },
  { label: 'Labs Pipeline', route: '/pipeline' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Workspace', route: '/command-center' },
  { label: 'Event Intake', route: '/registry/intake/real-event-intake.json' },
]
