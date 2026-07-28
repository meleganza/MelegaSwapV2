/**
 * SMART_SWAP_MODULE_005 — History tests (read-only memory).
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  SMART_SWAP_HISTORY_OWNERSHIP,
  SMART_SWAP_HISTORY_MAX_ENTRIES,
  buildSmartSwapHistory,
  normalizeSmartSwapHistoryEntry,
  paginateSmartSwapHistory,
  type SmartSwapHistoryTxSnapshot,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

function tx(overrides: Partial<SmartSwapHistoryTxSnapshot> = {}): SmartSwapHistoryTxSnapshot {
  return {
    hash: '0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890',
    type: 'swap',
    from: '0xwallet',
    summary: 'Swap 100 USDT for 0.98 BNB',
    addedTime: Date.UTC(2026, 6, 26, 1, 0, 0),
    confirmedTime: Date.UTC(2026, 6, 26, 1, 0, 30),
    receipt: { status: 1 },
    settlementHandoffContext: {
      amount: '100',
      fee: '0.3',
      asset: { symbol: 'USDT', address: '0xusdt' },
      kerlConstitutional: null,
      smartRouter: { protocolFeeBps: 30 },
    },
    ...overrides,
  }
}

describe('SMART_SWAP_MODULE_005 History', () => {
  it('keeps Architecture freeze + SmartSwapForm unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-history')
    expect(form).not.toContain('SmartSwapHistory')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('SmartSwapHistoryModule')
    expect(cockpit).toContain('data-smart-swap-history-mount')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
    expect(status).not.toMatch(/kerl/)
    expect(status).not.toMatch(/melega-smart-router\//)
  })

  it('normalizes a successful swap with fee + no invented gas', () => {
    const entry = normalizeSmartSwapHistoryEntry(tx())
    expect(entry).toBeTruthy()
    expect(entry!.executionStatus).toBe('SUCCESS')
    expect(entry!.inputAmount).toBe('100')
    expect(entry!.inputToken.symbol).toBe('USDT')
    expect(entry!.outputAmount).toBe('0.98')
    expect(entry!.outputToken.symbol).toBe('BNB')
    expect(entry!.protocolFee).toBe('0.3 USDT')
    expect(entry!.feeState).toBe('AVAILABLE')
    expect(entry!.gasUsed).toBeNull()
    expect(entry!.gasState).toBe('UNAVAILABLE')
    expect(entry!.economicAttributionState).toBe('PENDING')
  })

  it('keeps failed and pending swaps visible without marking pending as completed', () => {
    const failed = normalizeSmartSwapHistoryEntry(
      tx({
        hash: '0xfail',
        receipt: { status: 0 },
        failureReason: 'Transaction reverted',
      }),
    )
    expect(failed!.executionStatus).toBe('FAILED')
    expect(failed!.failureReason).toBe('Transaction reverted')
    expect(failed!.failureReason).not.toMatch(/0x08c379a0/)

    const pending = normalizeSmartSwapHistoryEntry(tx({ hash: '0xpend', receipt: null, confirmedTime: undefined }))
    expect(pending!.executionStatus).toBe('PENDING')
    expect(pending!.executionStatus).not.toBe('SUCCESS')
  })

  it('supports partial and unavailable fee data without reconstruction', () => {
    const partial = normalizeSmartSwapHistoryEntry(
      tx({
        settlementHandoffContext: {
          amount: '10',
          fee: undefined,
          asset: { symbol: 'USDT' },
          smartRouter: { protocolFeeBps: 30 },
        },
      }),
    )
    expect(partial!.feeState).toBe('PARTIAL')
    expect(partial!.protocolFee).toBe('30 bps')

    const unavailable = normalizeSmartSwapHistoryEntry(
      tx({
        settlementHandoffContext: null,
        summary: 'Swap 1 BNB for 300 USDT',
      }),
    )
    expect(unavailable!.feeState).toBe('UNAVAILABLE')
    expect(unavailable!.protocolFee).toBeNull()
  })

  it('shows recorded route memory only — never invents best route', () => {
    const withRoute = normalizeSmartSwapHistoryEntry(
      tx({
        recordedRouteSymbols: ['USDT', 'BNB', 'MARCO'],
      }),
    )
    expect(withRoute!.routeHops.map((h) => h.label)).toEqual(
      expect.arrayContaining(['USDT', 'USDT/BNB', 'BNB', 'BNB/MARCO', 'MARCO']),
    )
    expect(JSON.stringify(withRoute)).not.toMatch(/best route/i)

    const noRoute = normalizeSmartSwapHistoryEntry(tx())
    expect(noRoute!.routeHops).toEqual([])
    expect(noRoute!.routeId).toBeNull()
  })

  it('marks KERL unavailable / recorded from authoritative handoff only', () => {
    const unavailable = normalizeSmartSwapHistoryEntry(tx({ settlementHandoffContext: null }))
    expect(unavailable!.economicAttributionState).toBe('UNAVAILABLE')

    const recorded = normalizeSmartSwapHistoryEntry(
      tx({
        settlementHandoffContext: {
          amount: '1',
          fee: '0.003',
          asset: { symbol: 'BNB' },
          kerlConstitutional: { kerlPackageId: 'pkg-1', correlationId: 'corr-1' },
        },
      }),
    )
    expect(recorded!.economicAttributionState).toBe('RECORDED')
    expect(JSON.stringify(recorded)).not.toMatch(/civilization impact/i)
    expect(JSON.stringify(recorded)).not.toMatch(/future contribution/i)
  })

  it('paginates latest-first with stable ordering and hard cap', () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      tx({
        hash: `0x${i.toString(16).padStart(64, '0')}`,
        addedTime: Date.UTC(2026, 6, 26, 0, 0, i),
        confirmedTime: Date.UTC(2026, 6, 26, 0, 0, i),
      }),
    )
    const page1 = buildSmartSwapHistory({ transactions: many, account: '0xwallet', page: 1, pageSize: 10 })
    expect(page1.listState).toBe('READY')
    expect(page1.entries).toHaveLength(10)
    expect(page1.total).toBe(SMART_SWAP_HISTORY_MAX_ENTRIES)
    expect(page1.hasMore).toBe(true)
    const t0 = Date.parse(page1.entries[0].timestamp!)
    const t1 = Date.parse(page1.entries[1].timestamp!)
    expect(t0).toBeGreaterThanOrEqual(t1)

    const page2 = buildSmartSwapHistory({ transactions: many, account: '0xwallet', page: 2, pageSize: 10 })
    expect(page2.entries).toHaveLength(10)
    expect(page2.hasMore).toBe(false)
  })

  it('resets to unavailable when wallet is missing (wallet change / disconnect)', () => {
    const withWallet = buildSmartSwapHistory({
      transactions: [tx()],
      account: '0xwallet',
    })
    expect(withWallet.listState).toBe('READY')

    const disconnected = buildSmartSwapHistory({
      transactions: [tx()],
      account: null,
    })
    expect(disconnected.listState).toBe('UNAVAILABLE')
    expect(disconnected.entries).toEqual([])

    const otherWallet = buildSmartSwapHistory({
      transactions: [tx({ from: '0xwallet' })],
      account: '0xother',
    })
    expect(otherWallet.listState).toBe('EMPTY')
  })

  it('documents ownership — presentation only', () => {
    expect(SMART_SWAP_HISTORY_OWNERSHIP.owns).toEqual(
      expect.arrayContaining(['Smart Swap execution presentation', 'transparency history']),
    )
    expect(SMART_SWAP_HISTORY_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining([
        'second blockchain indexer',
        'fake history',
        'fee settlement records',
        'KERL attribution calculation',
      ]),
    )
    const empty = paginateSmartSwapHistory([])
    expect(empty.listState).toBe('EMPTY')
  })
})
