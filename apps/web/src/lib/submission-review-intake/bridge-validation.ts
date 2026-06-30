import { ReviewDecisionType } from 'lib/economic-review/review-types'
import { SUBMISSION_CATEGORY_IDS } from 'lib/economic-submission/submission-categories'
import { SubmissionReviewIntakeBridgeMapping } from './bridge-types'

export const BRIDGE_VALIDATION_RULES = [
  'Bridge is read-only — no persistence, approval execution, or registry mutation.',
  'approve decision does not emit live intake events in this build.',
  'reject and blocked decisions halt intake propagation.',
  'request_information returns flow to /submit — no automatic re-queue.',
  'All bridge mappings are schema examples — liveBridgeEvents remains 0.',
  'Forbidden payloads (signed_tx, router_execute, deploy_contract) block bridge handoff.',
  'Canonical economy MARCO on BNB Chain cannot be overridden via presence submissions.',
  'AI reviewer cannot issue approve without human governance in future missions.',
]

export const FORBIDDEN_BRIDGE_PAYLOAD_KEYS = [
  'signed_tx',
  'router_execute',
  'deploy_contract',
  'private_key',
  'swap_route',
  'masterchef_deposit',
]

export interface BridgeValidationResult {
  valid: boolean
  blockedReason?: string
}

export const validateBridgeHandoff = (
  mapping: SubmissionReviewIntakeBridgeMapping,
  decision: ReviewDecisionType,
  payloadKeys: string[] = [],
): BridgeValidationResult => {
  const forbidden = payloadKeys.filter((key) => FORBIDDEN_BRIDGE_PAYLOAD_KEYS.includes(key))
  if (forbidden.length > 0) {
    return {
      valid: false,
      blockedReason: `Forbidden payload keys detected: ${forbidden.join(', ')}`,
    }
  }

  if (!mapping.allowedReviewDecisions.includes(decision)) {
    return {
      valid: false,
      blockedReason: `Decision "${decision}" not allowed for safety ${mapping.safetyClassification}`,
    }
  }

  if (decision === 'approve' && mapping.safetyClassification === 'blocked') {
    return {
      valid: false,
      blockedReason: mapping.blockedReason ?? 'Blocked safety classification — approve not permitted.',
    }
  }

  if (decision === 'blocked' || decision === 'reject') {
    return { valid: false, blockedReason: mapping.blockedReason ?? 'Review decision halted intake handoff.' }
  }

  if (decision === 'request_information' || decision === 'defer') {
    return { valid: false, blockedReason: 'Handoff paused — intake not emitted until review completes.' }
  }

  return { valid: true }
}

export const assertBridgeValidationCoverage = (): void => {
  if (SUBMISSION_CATEGORY_IDS.length === 0) {
    throw new Error('No submission categories to validate bridge against')
  }
}
