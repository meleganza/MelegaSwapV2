import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { validateTestnetExecutionHandoff } from '../validate-testnet-handoff'

const HANDOFF_PATH = resolve(
  __dirname,
  '../../../../public/registry/kerl/handoffs/genesis-testnet-execution-handoff.json',
)

describe('validate-testnet-handoff', () => {
  it('accepts genesis testnet handoff fixture', () => {
    const pkg = JSON.parse(readFileSync(HANDOFF_PATH, 'utf8'))
    const result = validateTestnetExecutionHandoff(pkg)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.package.routingMetadataSummary.chainId).toBe(97)
      expect(result.package.proposalEligibility.executionPermitted).toBe(true)
    }
  })

  it('rejects mainnet chainId', () => {
    const pkg = JSON.parse(readFileSync(HANDOFF_PATH, 'utf8'))
    pkg.routingMetadataSummary.chainId = 56
    const result = validateTestnetExecutionHandoff(pkg)
    expect(result.ok).toBe(false)
  })
})
