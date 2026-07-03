/**
 * KERL execution mode architecture — preparation for TESTNET_EXECUTION_ONLY.
 * Modes are explicit; activation is gated separately (see activation-gates.ts).
 */

/** No KERL execution path is permitted. Default at process start. */
export const EXECUTION_MODE_OFF = 'OFF' as const

/** Dry-run only — suppression manifest, no wallet or adapter dispatch. */
export const EXECUTION_MODE_DRY_RUN = 'DRY_RUN' as const

/** Testnet on-chain execution — architecture only; remains disabled until all gates pass. */
export const EXECUTION_MODE_TESTNET_EXECUTION_ONLY = 'TESTNET_EXECUTION_ONLY' as const

/** Mainnet on-chain execution — permanently disabled in current civilization phase. */
export const EXECUTION_MODE_MAINNET_EXECUTION = 'MAINNET_EXECUTION' as const

export const EXECUTION_MODES = [
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  EXECUTION_MODE_MAINNET_EXECUTION,
] as const

export type ExecutionMode = (typeof EXECUTION_MODES)[number]

/** Legacy manifest value — dry-run gateway output remains DRY_RUN_ONLY for handoff compatibility. */
export const EXECUTION_MODE_DRY_RUN_ONLY_LEGACY = 'DRY_RUN_ONLY' as const

export const TESTNET_CHAIN_IDS = [97] as const

export const MAINNET_CHAIN_IDS = [56, 1, 137, 8453] as const

export const MODE_ERROR_CODES = {
  MODE_OFF: 'EXECUTION_MODE_OFF',
  MODE_NOT_DRY_RUN: 'EXECUTION_MODE_NOT_DRY_RUN',
  LIVE_GATES_NOT_SATISFIED: 'EXECUTION_LIVE_GATES_NOT_SATISFIED',
  MAINNET_FORBIDDEN: 'EXECUTION_MAINNET_FORBIDDEN',
  TESTNET_NOT_ACTIVATED: 'EXECUTION_TESTNET_NOT_ACTIVATED',
} as const
