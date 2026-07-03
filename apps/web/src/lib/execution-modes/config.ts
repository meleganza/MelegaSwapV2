import {
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  MAINNET_CHAIN_IDS,
  TESTNET_CHAIN_IDS,
  type ExecutionMode,
} from './constants'

/**
 * Static execution configuration — preparation surface for future env-driven overrides.
 * This mission does NOT read process.env for mode activation.
 */
export interface ExecutionModeConfig {
  /** Configured mode — default OFF; never TESTNET or MAINNET without explicit harness + gates. */
  mode: ExecutionMode
  /** Future: set true only after constitutional authorization + env confirmation. */
  environmentAuthorized: boolean
  /** Future: explicit testnet execution arm — remains false in this mission. */
  testnetExecutionArmed: boolean
  /** Mainnet execution is forbidden until a future civilization milestone. */
  mainnetExecutionArmed: false
  /**
   * Civilization authorization for any live KERL execution.
   * Remains false after TESTNET preparation — enabling is a future configuration mission only.
   */
  kerlLiveExecutionAuthorized: boolean
}

const DEFAULT_CONFIG: ExecutionModeConfig = {
  mode: EXECUTION_MODE_OFF,
  environmentAuthorized: false,
  testnetExecutionArmed: false,
  mainnetExecutionArmed: false,
  kerlLiveExecutionAuthorized: false,
}

let runtimeConfig: ExecutionModeConfig = { ...DEFAULT_CONFIG }

export function getExecutionModeConfig(): Readonly<ExecutionModeConfig> {
  return runtimeConfig
}

export function getConfiguredExecutionMode(): ExecutionMode {
  return runtimeConfig.mode
}

/** @internal Harness and tests only — production must not call. */
export function setExecutionModeForHarness(mode: ExecutionMode): void {
  runtimeConfig = { ...runtimeConfig, mode }
}

/** @internal Harness and tests only. */
export function setEnvironmentAuthorizedForHarness(authorized: boolean): void {
  runtimeConfig = { ...runtimeConfig, environmentAuthorized: authorized }
}

/** @internal Harness and tests only — remains ineffective until all gates pass. */
export function setTestnetExecutionArmedForHarness(armed: boolean): void {
  runtimeConfig = { ...runtimeConfig, testnetExecutionArmed: armed }
}

/** @internal Test harness reset. */
export function resetExecutionModeConfig(): void {
  runtimeConfig = { ...DEFAULT_CONFIG }
}

export function isTestnetChainId(chainId: number | undefined): boolean {
  if (chainId === undefined) return false
  return (TESTNET_CHAIN_IDS as readonly number[]).includes(chainId)
}

export function isMainnetChainId(chainId: number | undefined): boolean {
  if (chainId === undefined) return false
  return (MAINNET_CHAIN_IDS as readonly number[]).includes(chainId)
}

export function isLiveExecutionMode(mode: ExecutionMode): boolean {
  return mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY || mode === EXECUTION_MODE_MAINNET_EXECUTION
}

export function isDryRunMode(mode: ExecutionMode): boolean {
  return mode === EXECUTION_MODE_DRY_RUN
}

export function isModeOff(mode: ExecutionMode): boolean {
  return mode === EXECUTION_MODE_OFF
}
