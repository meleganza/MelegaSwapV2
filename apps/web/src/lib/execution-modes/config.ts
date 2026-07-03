import {
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  MAINNET_CHAIN_IDS,
  TESTNET_CHAIN_IDS,
  type ExecutionMode,
} from './constants'
import {
  ACTIVATION_LIFECYCLE_OFF,
  type ActivationLifecycleState,
} from './activation-lifecycle'

/**
 * Static execution configuration — preparation surface for future env-driven overrides.
 * This mission does NOT read process.env for mode activation.
 * Civilization authorization requires explicit harness setter — never env alone.
 */
export interface ExecutionModeConfig {
  /** Configured mode — default OFF; never TESTNET or MAINNET without explicit harness + gates. */
  mode: ExecutionMode
  /** Canonical activation lifecycle — default OFF; execution requires TESTNET_EXECUTION_ENABLED. */
  activationLifecycleState: ActivationLifecycleState
  /** Future: set true only after constitutional authorization + explicit activation mission. */
  environmentAuthorized: boolean
  /** Testnet arm engaged — lifecycle TESTNET_ARMED; does not alone permit execution. */
  testnetExecutionArmed: boolean
  /** Mainnet execution is forbidden until a future civilization milestone. */
  mainnetExecutionArmed: false
  /**
   * Civilization authorization for any live KERL execution.
   * Remains false after T1 arming — enabling requires explicit Civilization authorization only.
   */
  kerlLiveExecutionAuthorized: boolean
}

const DEFAULT_CONFIG: ExecutionModeConfig = {
  mode: EXECUTION_MODE_OFF,
  activationLifecycleState: ACTIVATION_LIFECYCLE_OFF,
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

/** @internal Harness and tests only — Civilization authorization; never env-driven in T1. */
export function setCivilizationAuthorizationForHarness(authorized: boolean): void {
  runtimeConfig = { ...runtimeConfig, kerlLiveExecutionAuthorized: authorized }
}

/** @internal Harness and tests only — lifecycle progression. */
export function setActivationLifecycleForHarness(state: ActivationLifecycleState): void {
  runtimeConfig = { ...runtimeConfig, activationLifecycleState: state }
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
