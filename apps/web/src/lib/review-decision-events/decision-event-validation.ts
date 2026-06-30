import { ReviewDecisionType } from 'lib/economic-review/review-types'
import {
  AllowedDownstreamEffect,
  DecisionEventType,
  ReviewDecisionEventRecord,
} from './decision-event-types'
import { FORBIDDEN_DECISION_EVENT_PAYLOAD_KEYS } from './decision-event-safety'

export const DECISION_EVENT_VALIDATION_RULES = [
  'Decision events are schema examples only — liveDecisionEvents remains 0.',
  'No persistence, registry mutation, or blockchain interaction from decision events.',
  'review_approved does not write to registry — intake handoff is manual.',
  'review_blocked and review_rejected halt intake propagation.',
  'information_requested routes to /submit — no automatic re-queue.',
  'AI reviewer cannot emit review_approved without human governance in future missions.',
  'Forbidden payloads (signed_tx, router_execute, deploy_contract) invalidate event emission.',
  'All blocked downstream effects are always enforced — no exceptions in this build.',
]

export interface DecisionEventValidationResult {
  valid: boolean
  blockedReason?: string
}

const allowedEffectsForType = (type: DecisionEventType): AllowedDownstreamEffect[] => {
  switch (type) {
    case 'review_requested':
    case 'review_started':
      return ['notify_orchestrator', 'update_read_model']
    case 'information_requested':
      return ['notify_orchestrator', 'request_information', 'update_read_model']
    case 'review_approved':
      return ['notify_orchestrator', 'update_read_model', 'mark_as_reviewed_schema_only']
    case 'review_rejected':
    case 'review_blocked':
      return ['notify_orchestrator', 'update_read_model', 'mark_as_reviewed_schema_only']
    case 'review_deferred':
      return ['notify_orchestrator', 'update_read_model']
    default:
      return ['notify_orchestrator']
  }
}

export const validateDecisionEvent = (
  event: Pick<ReviewDecisionEventRecord, 'decisionEventType' | 'allowedDownstreamEffects'>,
  payloadKeys: string[] = [],
): DecisionEventValidationResult => {
  const forbidden = payloadKeys.filter((key) =>
    FORBIDDEN_DECISION_EVENT_PAYLOAD_KEYS.includes(key),
  )
  if (forbidden.length > 0) {
    return {
      valid: false,
      blockedReason: `Forbidden payload keys: ${forbidden.join(', ')}`,
    }
  }

  const permitted = allowedEffectsForType(event.decisionEventType)
  const invalidEffects = event.allowedDownstreamEffects.filter(
    (effect) => !permitted.includes(effect),
  )
  if (invalidEffects.length > 0) {
    return {
      valid: false,
      blockedReason: `Disallowed downstream effects for ${event.decisionEventType}: ${invalidEffects.join(', ')}`,
    }
  }

  if (event.decisionEventType === 'review_approved') {
    return {
      valid: true,
    }
  }

  return { valid: true }
}

export const mapDecisionTypeToEventType = (
  decision: ReviewDecisionType,
): DecisionEventType | undefined => {
  const map: Partial<Record<ReviewDecisionType, DecisionEventType>> = {
    approve: 'review_approved',
    reject: 'review_rejected',
    request_information: 'information_requested',
    defer: 'review_deferred',
    blocked: 'review_blocked',
  }
  return map[decision]
}
