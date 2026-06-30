import { DecisionEventType, DecisionEventRoutingTarget } from './decision-event-types'

export const DECISION_EVENT_ROUTING: Record<
  DecisionEventType,
  { targets: DecisionEventRoutingTarget[]; notes: string }
> = {
  review_requested: {
    targets: ['/review', '/submit', '/orchestrator'],
    notes: 'Queue observation — orchestrator notified of pending review workload.',
  },
  review_started: {
    targets: ['/review', '/orchestrator', '/pipeline'],
    notes: 'Active review session — pipeline observes stage without registry sync.',
  },
  information_requested: {
    targets: ['/submit', '/review', '/orchestrator'],
    notes: 'Evidence gap — submission surface receives request_information signal.',
  },
  review_approved: {
    targets: [
      '/review',
      '/orchestrator',
      '/registry/intake/real-event-intake.json',
      '/registry/bridges/submission-review-intake.json',
    ],
    notes: 'Approved for intake handoff schema — intake family resolved via bridge mapping.',
  },
  review_rejected: {
    targets: ['/review', '/orchestrator', '/submit'],
    notes: 'Rejection halts intake propagation — orchestrator records blocked recommendation.',
  },
  review_blocked: {
    targets: ['/review', '/orchestrator', '/pipeline'],
    notes: 'Safety block — no downstream intake or registry effects permitted.',
  },
  review_deferred: {
    targets: ['/review', '/orchestrator', '/pipeline'],
    notes: 'Deferred review — item remains queued without approval or intake emission.',
  },
}

export const DECISION_EVENT_CROSS_LINKS = [
  { label: 'Review Queue', route: '/review' },
  { label: 'Submission', route: '/submit' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Intake Spec', route: '/registry/intake/real-event-intake.json' },
  { label: 'Bridge Manifest', route: '/registry/bridges/submission-review-intake.json' },
  { label: 'Decision Events Manifest', route: '/registry/review/decision-events.json' },
]

export const DECISION_EVENTS_MANIFEST_URI = '/registry/review/decision-events.json'
