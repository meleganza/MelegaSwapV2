import { EXECUTION_MODE_TESTNET_EXECUTION_ONLY } from '../constants'

export const OPERATOR_ENV_KEYS = [
  'KERL_TESTNET_EXECUTOR_PRIVATE_KEY',
  'KERL_EXECUTION_MODE',
  'KERL_LIVE_EXECUTION_AUTHORIZED',
  'KERL_TESTNET_EXECUTION_ARMED',
  'KERL_GATEWAY_ENABLED',
  'KERL_INGRESS_ENABLED',
] as const

export type OperatorEnvKey = (typeof OPERATOR_ENV_KEYS)[number]

export interface OperatorEnvVerification {
  ok: boolean
  missing: OperatorEnvKey[]
  invalid: string[]
}

function isTruthy(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

/**
 * Verifies operator shell configuration for T3B genesis execution.
 * Never logs or returns private key material.
 */
export function verifyOperatorEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): OperatorEnvVerification {
  const missing = OPERATOR_ENV_KEYS.filter((key) => !env[key]?.trim())
  const invalid: string[] = []

  if (env.KERL_EXECUTION_MODE && env.KERL_EXECUTION_MODE !== EXECUTION_MODE_TESTNET_EXECUTION_ONLY) {
    invalid.push(
      `KERL_EXECUTION_MODE must be ${EXECUTION_MODE_TESTNET_EXECUTION_ONLY} (got: ${env.KERL_EXECUTION_MODE})`,
    )
  }

  for (const key of [
    'KERL_LIVE_EXECUTION_AUTHORIZED',
    'KERL_TESTNET_EXECUTION_ARMED',
    'KERL_GATEWAY_ENABLED',
    'KERL_INGRESS_ENABLED',
  ] as const) {
    if (env[key] && !isTruthy(env[key])) {
      invalid.push(`${key} must be "true"`)
    }
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  }
}
