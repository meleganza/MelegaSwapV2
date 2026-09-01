import { MarcoBridgeError } from './types'
import type { MarcoBridgeBuild, UnsignedEvmBridgeTx } from './transactionBuilder'

export type MarcoBridgeSimulation = {
  from: MarcoBridgeBuild['from']
  to: MarcoBridgeBuild['to']
  amount: string
  executable: boolean
  ok: boolean
  blockers: string[]
  steps: Array<{
    purpose: string
    family: 'evm' | 'solana'
    ok: boolean
    reverted: boolean
    reason: string
  }>
}

export type EvmCallResult = {
  ok: boolean
  reverted: boolean
  reason: string
}

export interface MarcoBridgeSimulator {
  ethCall?(tx: UnsignedEvmBridgeTx): Promise<EvmCallResult>
}

const BALANCE_REVERT = /insufficient|transfer amount exceeds|ERC20:|execution reverted/i

export function classifySimulationRevert(reason: string): string {
  if (!reason) return 'eth_call reverted without a reason.'
  if (BALANCE_REVERT.test(reason)) {
    return 'Simulation reverted on the provided wallet. No balances were fabricated.'
  }
  return reason
}

export async function simulateMarcoBridgeBuild(
  build: MarcoBridgeBuild,
  simulator: MarcoBridgeSimulator,
): Promise<MarcoBridgeSimulation> {
  if (!build.executable) {
    return {
      from: build.from,
      to: build.to,
      amount: build.amount,
      executable: false,
      ok: false,
      blockers: build.blockers,
      steps: [],
    }
  }

  const steps: MarcoBridgeSimulation['steps'] = []
  for (const tx of build.transactions) {
    if (tx.family === 'solana') {
      steps.push({
        purpose: tx.purpose,
        family: 'solana',
        ok: false,
        reverted: false,
        reason: 'Solana source submission is not publicly activated. Use BNB Smart Chain as the source.',
      })
      continue
    }
    if (!simulator.ethCall) {
      throw new MarcoBridgeError('QUOTE_FAILED', 'EVM simulation transport is missing.')
    }
    const result = await simulator.ethCall(tx)
    steps.push({
      purpose: tx.purpose,
      family: 'evm',
      ok: result.ok,
      reverted: result.reverted,
      reason: result.ok ? 'eth_call succeeded.' : classifySimulationRevert(result.reason),
    })
  }

  return {
    from: build.from,
    to: build.to,
    amount: build.amount,
    executable: true,
    ok: steps.every((step) => step.ok),
    blockers: steps.filter((step) => !step.ok).map((step) => `${step.purpose}: ${step.reason}`),
    steps,
  }
}
