import type { DryRunGatewayContext } from '../execution-gateway/types'
import type { ExecutionError } from '../execution-contract/types'
import {
  performCertifiedDryRunHandshake,
  type CertifiedHandshakeResult,
} from '../execution-handoff-consumer'
import { REGISTRY_INTAKE_ERROR_CODES } from './constants'
import { readLocalRegistryHandoffJson, readSeedRegistryHandoffJson } from './load-local-registry'
import { validateRegistryHandoffJson } from './validate-registry-json'

export type RegistryIntakeFailure = {
  ok: false
  stage: 'load' | 'registry_validate' | 'handshake'
  error: ExecutionError
  relativePath?: string
  packageId?: string
  executionId?: string
}

export type RegistryIntakeSuccess = CertifiedHandshakeResult & {
  ok: true
  relativePath: string
}

export type RegistryIntakeResult = RegistryIntakeSuccess | RegistryIntakeFailure

function intakeFailure(
  stage: RegistryIntakeFailure['stage'],
  error: ExecutionError,
  meta: Partial<Pick<RegistryIntakeFailure, 'relativePath' | 'packageId' | 'executionId'>> = {},
): RegistryIntakeFailure {
  return { ok: false, stage, error, ...meta }
}

/**
 * Intake a registry handoff artifact already parsed as JSON.
 * Terminates in performCertifiedDryRunHandshake() → dry-run gateway only.
 */
export function intakeRegistryHandoffJson(
  value: unknown,
  context: DryRunGatewayContext = {},
  relativePath = 'inline',
): RegistryIntakeResult {
  const registryValidation = validateRegistryHandoffJson(value)
  if (!registryValidation.ok) {
    return intakeFailure('registry_validate', registryValidation.error, { relativePath })
  }

  const handshake = performCertifiedDryRunHandshake(value, context)
  if (!handshake.ok) {
    return intakeFailure('handshake', handshake.error, {
      relativePath,
      packageId: handshake.packageId,
      executionId: handshake.executionId,
    })
  }

  return {
    ...handshake,
    ok: true,
    relativePath,
  }
}

/**
 * Load a local registry JSON artifact and intake through certified dry-run handshake.
 * Filesystem only — no fetch, no Swarm, no wallet, no adapter dispatch.
 */
export function intakeRegistryHandoffFromFile(
  relativeHandoffPath: string,
  context: DryRunGatewayContext = {},
  cwd = process.cwd(),
): RegistryIntakeResult {
  const loaded = readLocalRegistryHandoffJson(relativeHandoffPath, cwd)
  if (!loaded.ok) {
    return intakeFailure('load', loaded.error, { relativePath: loaded.relativePath })
  }

  return intakeRegistryHandoffJson(loaded.value, context, loaded.relativePath)
}

/** Intake the seeded RC1 certified dry-run registry artifact. */
export function intakeSeedRegistryHandoff(
  context: DryRunGatewayContext = {},
  cwd = process.cwd(),
): RegistryIntakeResult {
  const loaded = readSeedRegistryHandoffJson(cwd)
  if (!loaded.ok) {
    return intakeFailure('load', loaded.error, { relativePath: loaded.relativePath })
  }

  return intakeRegistryHandoffJson(loaded.value, context, loaded.relativePath)
}
