import { LABS_RUNTIME_ENDPOINT, LABS_RUNTIME_SESSION_ID } from './runtime-session'
import { LabsRuntimeSession, RuntimeEventType, RuntimeStatus } from './runtime-types'

export interface LabsObservationResult {
  labsConnected: boolean
  connectionStatus: RuntimeStatus
  lastObserved: string | null
  lastEvent: RuntimeEventType | null
  unavailableReason: string | null
}

/**
 * Observation-only Labs runtime probe.
 * No fake connection — returns disconnected when Labs endpoint is not indexed.
 */
export const observeLabsRuntime = (): LabsObservationResult => {
  const labsConnected = false

  return {
    labsConnected,
    connectionStatus: labsConnected ? 'connected' : 'waiting',
    lastObserved: null,
    lastEvent: null,
    unavailableReason: labsConnected
      ? null
      : `Labs runtime endpoint ${LABS_RUNTIME_ENDPOINT} is not indexed in this build — observation layer waiting.`,
  }
}

export const resolveLabsRuntimeSession = (): LabsRuntimeSession => {
  const observation = observeLabsRuntime()

  return {
    sessionId: LABS_RUNTIME_SESSION_ID,
    labsConnected: observation.labsConnected,
    connectionStatus: observation.connectionStatus,
    labsEndpoint: LABS_RUNTIME_ENDPOINT,
    lastObserved: observation.lastObserved,
    lastEvent: observation.lastEvent,
    observedNarrativeCount: 0,
  }
}
