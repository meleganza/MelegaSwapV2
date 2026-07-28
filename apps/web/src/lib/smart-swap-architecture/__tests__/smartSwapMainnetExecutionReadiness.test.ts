/**
 * SMART_SWAP_MAINNET_EXECUTION_READINESS — freeze + evidence gates.
 * Read-only mission: no SmartSwapForm / economics edits.
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID, SMART_SWAP_CONTRACT_ANCHORS } from '../smartSwapArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/smart-swap-mainnet-execution-readiness')

const REQUIRED = [
  'recovery-state.json',
  'mainnet-contract-context.json',
  'router-validation.json',
  'route-live-validation.json',
  'quote-validation.json',
  'calldata-validation.json',
  'gas-validation.json',
  'simulation-validation.json',
  'approval-validation.json',
  'wallet-validation.json',
  'fee-path-validation.json',
  'failure-state-validation.json',
  'performance-validation.json',
  'mock-audit.json',
  'test-summary.json',
]

describe('SMART_SWAP_MAINNET_EXECUTION_READINESS', () => {
  it('keeps architecture freeze and forbidden surfaces untouched', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    expect(SMART_SWAP_CONTRACT_ANCHORS.bscSmartRouter.toLowerCase()).toBe(
      '0xc6665d98efd81f47b03801187eb46cbc63f328b0',
    )
    expect(SMART_SWAP_CONTRACT_ANCHORS.bscV2Router.toLowerCase()).toBe(
      '0xc25033218d181b27d4a2944fbb04fc055da4eab3',
    )

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/smart-swap-route-engine\//)
    expect(status).not.toMatch(/smart-swap-execution-preview\//)
    expect(status).not.toMatch(/smart-swap-fee-transparency\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
    expect(status).not.toMatch(/kerl/)
  })

  it('has complete evidence pack with READY verdict', () => {
    for (const f of REQUIRED) {
      expect(existsSync(path.join(EVIDENCE, f)), f).toBe(true)
    }
    expect(existsSync(path.join(WEB, 'docs/runtime/SMART_SWAP_MAINNET_EXECUTION_READINESS_REPORT.md'))).toBe(true)
    const summary = JSON.parse(readFileSync(path.join(EVIDENCE, 'test-summary.json'), 'utf8'))
    expect(summary.ready).toBe(true)
    expect(summary.verdict).toBe('SMART_SWAP_MAINNET_EXECUTION_READY')

    const mock = JSON.parse(readFileSync(path.join(EVIDENCE, 'mock-audit.json'), 'utf8'))
    expect(mock.mockedRoutes).toBe(false)
    expect(mock.broadcast).toBe(false)

    const router = JSON.parse(readFileSync(path.join(EVIDENCE, 'router-validation.json'), 'utf8'))
    expect(router.pass).toBe(true)
    expect(router.broadcast).toBe(false)

    const quotes = JSON.parse(readFileSync(path.join(EVIDENCE, 'quote-validation.json'), 'utf8'))
    expect(quotes.mockQuotes).toBe(false)
    expect(quotes.pass).toBe(true)

    const sha = createHash('sha256')
      .update(readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx')))
      .digest('hex')
    expect(sha.length).toBe(64)
  })
})
