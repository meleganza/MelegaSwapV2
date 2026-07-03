export type BuildRuntimeErrorCode =
  | 'PROJECT_NOT_FOUND'
  | 'NO_CONTRACT'
  | 'POOL_RUNTIME_UNAVAILABLE'
  | 'FARM_RUNTIME_UNAVAILABLE'
  | 'INFRASTRUCTURE_INCOMPLETE'
  | 'PROJECT_ALREADY_IMPORTED'
  | 'NETWORK_UNAVAILABLE'
  | 'UNKNOWN'

export interface BuildRuntimeError {
  code: BuildRuntimeErrorCode
  message: string
}

const ERROR_CATALOG: Record<BuildRuntimeErrorCode, string> = {
  PROJECT_NOT_FOUND: 'No project matches this contract in the Melega registry.',
  NO_CONTRACT: 'Paste a valid contract address to begin import analysis.',
  POOL_RUNTIME_UNAVAILABLE: 'Pools runtime is unavailable on this network.',
  FARM_RUNTIME_UNAVAILABLE: 'Farms runtime is unavailable on this network.',
  INFRASTRUCTURE_INCOMPLETE: 'Core infrastructure checks are incomplete for this project.',
  PROJECT_ALREADY_IMPORTED: 'This project is already indexed in the Melega registry.',
  NETWORK_UNAVAILABLE: 'Switch to a supported network to continue.',
  UNKNOWN: 'An unexpected error occurred during infrastructure orchestration.',
}

export function createBuildRuntimeError(code: BuildRuntimeErrorCode): BuildRuntimeError {
  return { code, message: ERROR_CATALOG[code] }
}
