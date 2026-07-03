export type CommandCenterRuntimeErrorCode =
  | 'NO_WALLET'
  | 'NO_RUNTIME'
  | 'NO_ASSETS'
  | 'NO_LIQUIDITY'
  | 'NO_POOLS'
  | 'NO_FARMS'
  | 'NO_RADAR'
  | 'NO_PROJECTS'
  | 'NO_BUILD'
  | 'UNKNOWN'

export interface CommandCenterRuntimeError {
  code: CommandCenterRuntimeErrorCode
  message: string
}

const ERROR_CATALOG: Record<CommandCenterRuntimeErrorCode, string> = {
  NO_WALLET: 'Connect a wallet to view personal positions and balances.',
  NO_RUNTIME: 'Command Center runtime is unavailable on this network.',
  NO_ASSETS: 'No wallet assets detected from Trade runtime.',
  NO_LIQUIDITY: 'No liquidity positions found.',
  NO_POOLS: 'No staking pool positions found.',
  NO_FARMS: 'No farm positions found.',
  NO_RADAR: 'Radar runtime is unavailable.',
  NO_PROJECTS: 'No indexed projects in Projects runtime.',
  NO_BUILD: 'Build Studio infrastructure data is unavailable.',
  UNKNOWN: 'An unexpected error occurred in Command Center orchestration.',
}

export function createCommandCenterError(code: CommandCenterRuntimeErrorCode): CommandCenterRuntimeError {
  return { code, message: ERROR_CATALOG[code] }
}
