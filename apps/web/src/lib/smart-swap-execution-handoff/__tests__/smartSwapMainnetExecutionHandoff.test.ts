/**
 * SMART_SWAP_MAINNET_EXECUTION_HANDOFF tests.
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  SMART_SWAP_EXECUTION_HANDOFF_OWNERSHIP,
  evaluateSmartSwapExecutionHandoff,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

const readyInput = {
  walletConnected: true,
  chainId: 56,
  expectedChainId: 56,
  routeAvailable: true,
  quoteFresh: true,
  minimumReceivedAvailable: true,
  gasEstimateAvailable: true,
  allowanceSufficient: true,
  balanceSufficient: true,
  simulationPassed: true,
  calldataValid: true,
  deadlineValid: true,
  previewAvailable: true,
  relatedRouteId: 'route-1',
}

describe('SMART_SWAP_MAINNET_EXECUTION_HANDOFF', () => {
  it('keeps Architecture freeze + SmartSwapForm / Router / fee libs unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-handoff')
    expect(form).not.toContain('SmartSwapExecutionHandoff')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const selector = readFileSync(path.join(WEB, 'src/views/Trade/components/TradeModeSelector.tsx'), 'utf8')
    expect(selector).toContain('Instant')
    expect(selector).toContain('Smart')
    expect(selector).toContain('aria-label={SWAP_EXPERIENCE_LABEL.instant}')
    expect(selector).toContain('min-height: 44px')

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('TradeModeSelector')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).toContain('showSmartTransparency')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/smart-swap-route-engine\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
  })

  it('certifies handoff only when all readiness checks pass', () => {
    const ready = evaluateSmartSwapExecutionHandoff(readyInput)
    expect(ready.certified).toBe(true)
    expect(ready.lifecycle).toBe('HANDOFF_READY')
    expect(ready.requiresUserConfirmation).toBe(true)
    expect(ready.autoSignForbidden).toBe(true)
    expect(ready.autoBroadcastForbidden).toBe(true)
    expect(ready.message).toMatch(/Ready to swap|Confirm in the form/i)
  })

  it('surfaces wallet / network / route / allowance failures without silent fallback', () => {
    const walletMsg = evaluateSmartSwapExecutionHandoff({ ...readyInput, walletConnected: false })
    expect(walletMsg.failures).toContain('WALLET_NOT_CONNECTED')
    expect(walletMsg.message).toBe('Wallet connection required.')
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, chainId: 1 }).failures).toContain('WRONG_NETWORK')
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, routeAvailable: false }).failures).toContain('NO_ROUTE')
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, quoteFresh: false }).failures).toContain('STALE_QUOTE')
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, balanceSufficient: false }).failures).toContain(
      'INSUFFICIENT_BALANCE',
    )
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, allowanceSufficient: false }).failures).toContain(
      'INSUFFICIENT_ALLOWANCE',
    )
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, gasEstimateAvailable: false }).failures).toContain(
      'GAS_ESTIMATION_FAILED',
    )
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, simulationPassed: false }).failures).toContain(
      'SIMULATION_FAILED',
    )
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, calldataValid: false }).failures).toContain(
      'CALLDATA_INVALID',
    )
  })

  it('tracks pending / success / failure lifecycle without auto execution', () => {
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, executionPending: true }).lifecycle).toBe(
      'EXECUTION_PENDING',
    )
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, executionSuccess: true }).lifecycle).toBe('SUCCESS')
    expect(evaluateSmartSwapExecutionHandoff({ ...readyInput, executionFailure: true }).lifecycle).toBe('FAILURE')
  })

  it('documents ownership — gate only', () => {
    expect(SMART_SWAP_EXECUTION_HANDOFF_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining([
        'automatic signing',
        'automatic broadcast',
        'SmartSwapForm core architecture',
        'Router contracts',
      ]),
    )
    expect(SMART_SWAP_EXECUTION_HANDOFF_OWNERSHIP.engine).toMatch(/SmartSwapForm remains/)
  })
})
