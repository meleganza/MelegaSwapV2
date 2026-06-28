import { ExecutionReason, ExecutionReasonKind } from './execution-types'

let reasonCounter = 0

const nextReasonId = (prefix: string): string => {
  reasonCounter += 1
  return `reason:${prefix}:${reasonCounter}`
}

export const buildReason = (
  kind: ExecutionReasonKind,
  message: string,
  candidateId?: string,
): ExecutionReason => ({
  id: nextReasonId(kind),
  kind,
  candidateId,
  message,
})

export const resetReasonCounter = (): void => {
  reasonCounter = 0
}
