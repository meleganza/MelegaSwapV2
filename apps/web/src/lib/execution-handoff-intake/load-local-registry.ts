import fs from 'fs'
import type { ExecutionError } from '../execution-contract/types'
import {
  KERL_REGISTRY_HANDOFFS_DIR,
  KERL_REGISTRY_SEED_HANDOFF_FILE,
  REGISTRY_INTAKE_ERROR_CODES,
  resolveKerlRegistryHandoffPath,
} from './constants'

export type RegistryLoadResult =
  | { ok: true; value: unknown; relativePath: string }
  | { ok: false; error: ExecutionError; relativePath?: string }

function loadError(code: string, message: string): ExecutionError {
  return { code, category: 'adapter_error', message }
}

/**
 * Reads a handoff JSON artifact from the local registry using filesystem only.
 * Never uses fetch or remote URLs.
 */
export function readLocalRegistryHandoffJson(
  relativeHandoffPath: string,
  cwd = process.cwd(),
): RegistryLoadResult {
  let absolutePath: string
  try {
    absolutePath = resolveKerlRegistryHandoffPath(relativeHandoffPath, cwd)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const code =
      message === 'REGISTRY_NETWORK_URL_FORBIDDEN'
        ? REGISTRY_INTAKE_ERROR_CODES.NETWORK_URL_FORBIDDEN
        : REGISTRY_INTAKE_ERROR_CODES.PATH_TRAVERSAL
    return { ok: false, error: loadError(code, message), relativePath: relativeHandoffPath }
  }

  if (!fs.existsSync(absolutePath)) {
    return {
      ok: false,
      error: loadError(
        REGISTRY_INTAKE_ERROR_CODES.ARTIFACT_NOT_FOUND,
        `registry artifact not found: ${relativeHandoffPath}`,
      ),
      relativePath: relativeHandoffPath,
    }
  }

  let raw: string
  try {
    raw = fs.readFileSync(absolutePath, 'utf8')
  } catch (error) {
    return {
      ok: false,
      error: loadError(
        REGISTRY_INTAKE_ERROR_CODES.ARTIFACT_NOT_FOUND,
        `unable to read registry artifact: ${relativeHandoffPath}`,
      ),
      relativePath: relativeHandoffPath,
    }
  }

  try {
    const value = JSON.parse(raw) as unknown
    return { ok: true, value, relativePath: relativeHandoffPath }
  } catch {
    return {
      ok: false,
      error: loadError(REGISTRY_INTAKE_ERROR_CODES.MALFORMED_JSON, 'registry artifact is not valid JSON'),
      relativePath: relativeHandoffPath,
    }
  }
}

/** Canonical seeded registry handoff relative path. */
export function getSeedRegistryHandoffRelativePath(): string {
  return `${KERL_REGISTRY_HANDOFFS_DIR}/${KERL_REGISTRY_SEED_HANDOFF_FILE}`
}

export function readSeedRegistryHandoffJson(cwd = process.cwd()): RegistryLoadResult {
  return readLocalRegistryHandoffJson(getSeedRegistryHandoffRelativePath(), cwd)
}
