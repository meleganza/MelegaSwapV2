import path from 'path'

/** Local registry root — static JSON only, no remote fetch. */
export const KERL_REGISTRY_RELATIVE_ROOT = 'public/registry/kerl'

export const KERL_REGISTRY_INDEX_FILE = 'index.json'

export const KERL_REGISTRY_HANDOFFS_DIR = 'handoffs'

export const KERL_REGISTRY_SEED_HANDOFF_FILE = 'rc1-certified-dry-run-handoff.json'

export const KERL_REGISTRY_SEED_HANDOFF_ID = 'kerl-rc1-offline-handoff-fixture-001'

export const KERL_REGISTRY_VERSION = '1.0.0' as const

export function resolveKerlRegistryRoot(cwd = process.cwd()): string {
  return path.resolve(cwd, KERL_REGISTRY_RELATIVE_ROOT)
}

export function resolveKerlRegistryHandoffPath(relativeHandoffPath: string, cwd = process.cwd()): string {
  const normalized = relativeHandoffPath.replace(/\\/g, '/')
  if (normalized.includes('..') || path.isAbsolute(normalized) || normalized.startsWith('/')) {
    throw new Error('REGISTRY_PATH_TRAVERSAL')
  }
  if (/^https?:\/\//i.test(normalized) || /^wss?:\/\//i.test(normalized)) {
    throw new Error('REGISTRY_NETWORK_URL_FORBIDDEN')
  }
  const root = resolveKerlRegistryRoot(cwd)
  const full = path.resolve(root, normalized)
  if (!full.startsWith(`${root}${path.sep}`) && full !== root) {
    throw new Error('REGISTRY_PATH_TRAVERSAL')
  }
  return full
}

export const REGISTRY_INTAKE_ERROR_CODES = {
  MALFORMED_JSON: 'REGISTRY_MALFORMED_JSON',
  NETWORK_URL_FORBIDDEN: 'REGISTRY_NETWORK_URL_FORBIDDEN',
  PATH_TRAVERSAL: 'REGISTRY_PATH_TRAVERSAL',
  ARTIFACT_NOT_FOUND: 'REGISTRY_ARTIFACT_NOT_FOUND',
  INVALID_ARTIFACT: 'REGISTRY_INVALID_ARTIFACT',
  NOT_OBJECT: 'REGISTRY_NOT_OBJECT',
} as const

/** Forbidden URL patterns anywhere in registry JSON string values. */
export const REGISTRY_FORBIDDEN_URL_PATTERN = /^(https?|wss?):\/\//i
