/**
 * Civilization observation registry — gates for swarm/Treasury readiness.
 * Defaults reflect verified T1 arming state; individual observations can be
 * overridden in harness tests only.
 */

export interface CivilizationObservationStatus {
  kerlRegistryActive: boolean
  registryPublished: boolean
  registryCompatibilityVerified: boolean
  missionDirectorObserved: boolean
  kcisObserved: boolean
  economicMemoryObserved: boolean
  treasuryObservesKerlRegistry: boolean
  treasuryReadyForSettlementIngestion: boolean
  signalObserved: boolean
  labsObserved: boolean
  spaceObserved: boolean
}

/** Verified civilization state at T1 arming — observation infrastructure ready. */
const VERIFIED_T1_OBSERVATIONS: CivilizationObservationStatus = {
  kerlRegistryActive: true,
  registryPublished: true,
  registryCompatibilityVerified: true,
  missionDirectorObserved: true,
  kcisObserved: true,
  economicMemoryObserved: true,
  treasuryObservesKerlRegistry: true,
  treasuryReadyForSettlementIngestion: true,
  signalObserved: true,
  labsObserved: true,
  spaceObserved: true,
}

let runtimeObservations: CivilizationObservationStatus = { ...VERIFIED_T1_OBSERVATIONS }

export function getCivilizationObservations(): Readonly<CivilizationObservationStatus> {
  return runtimeObservations
}

export function allObservationsSatisfied(): boolean {
  return Object.values(runtimeObservations).every(Boolean)
}

export function observationsBlockingReasons(): string[] {
  const reasons: string[] = []
  const o = runtimeObservations
  if (!o.kerlRegistryActive) reasons.push('KERL registry is not active')
  if (!o.registryPublished) reasons.push('Registry publication is not persisted')
  if (!o.registryCompatibilityVerified) reasons.push('Registry compatibility is not certified')
  if (!o.missionDirectorObserved) reasons.push('Mission Director is not observed')
  if (!o.kcisObserved) reasons.push('KCIS is not observed')
  if (!o.economicMemoryObserved) reasons.push('Economic Memory is not observed')
  if (!o.treasuryObservesKerlRegistry) reasons.push('Treasury does not observe KERL registry')
  if (!o.treasuryReadyForSettlementIngestion) reasons.push('Treasury is not ready for settlement ingestion')
  return reasons
}

/** @internal Harness and tests only. */
export function setCivilizationObservationsForHarness(
  partial: Partial<CivilizationObservationStatus>,
): void {
  runtimeObservations = { ...runtimeObservations, ...partial }
}

/** @internal Test harness reset. */
export function resetCivilizationObservations(): void {
  runtimeObservations = { ...VERIFIED_T1_OBSERVATIONS }
}
