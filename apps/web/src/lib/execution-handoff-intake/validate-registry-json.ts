import type { ExecutionError } from '../execution-contract/types'
import { REGISTRY_FORBIDDEN_URL_PATTERN, REGISTRY_INTAKE_ERROR_CODES } from './constants'

export type RegistryJsonValidateResult = { ok: true } | { ok: false; error: ExecutionError }

function registryError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectNetworkUrlViolations(value: unknown, path = 'artifact', violations: string[] = []): string[] {
  if (typeof value === 'string') {
    if (REGISTRY_FORBIDDEN_URL_PATTERN.test(value.trim())) {
      violations.push(`${path} contains forbidden network URL`)
    }
    return violations
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectNetworkUrlViolations(item, `${path}[${index}]`, violations))
    return violations
  }

  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectNetworkUrlViolations(child, `${path}.${key}`, violations)
    }
  }

  return violations
}

/**
 * Registry-layer validation before certified handshake.
 * Complements handoff consumer validators — blocks network URLs in static artifacts.
 */
export function validateRegistryHandoffJson(value: unknown): RegistryJsonValidateResult {
  if (!isRecord(value)) {
    return {
      ok: false,
      error: registryError(REGISTRY_INTAKE_ERROR_CODES.NOT_OBJECT, 'registry artifact must be a JSON object'),
    }
  }

  const urlViolations = collectNetworkUrlViolations(value)
  if (urlViolations.length > 0) {
    return {
      ok: false,
      error: registryError(REGISTRY_INTAKE_ERROR_CODES.NETWORK_URL_FORBIDDEN, urlViolations[0]),
    }
  }

  return { ok: true }
}
