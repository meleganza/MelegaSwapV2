import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { HomeActivityDisplayRow } from 'views/HomeTrade/formatHomeActivity'
import * as Uikit from '@pancakeswap/uikit'
import LiveActivityFeed, {
  resolveVisibleRowLimit,
  selectCanonicalActivityRows,
} from 'views/HomeTrade/LiveActivityFeed'

vi.mock('@pancakeswap/uikit', () => ({
  useMatchBreakpoints: vi.fn(),
}))

vi.mock('views/Trade/components/TradeTechnicalDetails', () => ({
  default: () => null,
}))

const useMatchBreakpointsMock = vi.mocked(Uikit.useMatchBreakpoints)

function makeRow(id: string, txSuffix: string, timestamp = 1_700_000_000): HomeActivityDisplayRow {
  const txHash = `0x${txSuffix.padStart(64, 'a')}`
  return {
    id,
    identity: 'MARCO / WBNB',
    eventLabel: 'Swap',
    primaryLine: 'Swap · MARCO / WBNB',
    walletShort: '0x4cc3…81a9',
    timestamp,
    explorerUrl: `https://bscscan.com/tx/${txHash}`,
    sourceLabel: 'AMM',
  }
}

function makeRows(count: number): HomeActivityDisplayRow[] {
  return Array.from({ length: count }, (_, index) =>
    makeRow(`row-${index + 1}`, String(index + 1).padStart(64, 'b'), 1_700_000_000 - index * 1000),
  )
}

function renderedRowIds(): string[] {
  return [...document.querySelectorAll('[data-activity-row-id]')].map((node) =>
    node.getAttribute('data-activity-row-id'),
  )
}

describe('selectCanonicalActivityRows', () => {
  it('keeps one row per canonical id and transaction hash', () => {
    const tx = '0x6ea8256066280d0972c204fdf7832c2bd394f3d721ba0834898875512bd8fc61'
    const rows = [
      makeRow('56:tx:355', tx.slice(2)),
      makeRow('56:tx:-1', tx.slice(2)),
    ]
    expect(selectCanonicalActivityRows(rows)).toHaveLength(1)
  })
})

describe('LiveActivityFeed', () => {
  beforeEach(() => {
    useMatchBreakpointsMock.mockReturnValue({ isMobile: false, isTablet: false } as ReturnType<
      typeof Uikit.useMatchBreakpoints
    >)
  })

  it('TEST 1 — renders three canonical rows with three unique IDs', () => {
    render(<LiveActivityFeed rows={makeRows(3)} />)
    const rows = document.querySelectorAll('[data-activity-row]')
    expect(rows).toHaveLength(3)
    expect(new Set(renderedRowIds()).size).toBe(3)
  })

  it('TEST 2 — desktop limit renders six of seven rows', () => {
    render(<LiveActivityFeed rows={makeRows(7)} />)
    expect(document.querySelectorAll('[data-activity-row]')).toHaveLength(6)
    expect(resolveVisibleRowLimit(false, false, 6)).toBe(6)
  })

  it('TEST 3 — tablet limit renders five of seven rows', () => {
    useMatchBreakpointsMock.mockReturnValue({ isMobile: false, isTablet: true } as ReturnType<
      typeof Uikit.useMatchBreakpoints
    >)
    render(<LiveActivityFeed rows={makeRows(7)} />)
    expect(document.querySelectorAll('[data-activity-row]')).toHaveLength(5)
    expect(resolveVisibleRowLimit(false, true, 6)).toBe(5)
  })

  it('TEST 4 — mobile limit renders four of seven rows', () => {
    useMatchBreakpointsMock.mockReturnValue({ isMobile: true, isTablet: false } as ReturnType<
      typeof Uikit.useMatchBreakpoints
    >)
    render(<LiveActivityFeed rows={makeRows(7)} />)
    expect(document.querySelectorAll('[data-activity-row]')).toHaveLength(4)
    expect(resolveVisibleRowLimit(true, false, 6)).toBe(4)
  })

  it('TEST 5 — canonical rows render once when legacy collections are also supplied', () => {
    const canonical = makeRows(3)
    const legacy = makeRows(2)
    render(<LiveActivityFeed rows={canonical} slots={legacy} items={legacy} />)
    expect(document.querySelectorAll('[data-activity-row]')).toHaveLength(3)
    expect(renderedRowIds()).toEqual(['row-1', 'row-2', 'row-3'])
  })

  it('TEST 6 — rows exclude skeleton and empty states when loading/error flags are set', () => {
    render(<LiveActivityFeed rows={makeRows(3)} isIndexing isError errorDetail="upstream failure" />)
    expect(document.querySelectorAll('[data-activity-row]')).toHaveLength(3)
    expect(document.querySelector('[data-live-activity-empty]')).toBeNull()
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
    expect(screen.queryByText('No protocol activity detected.')).toBeNull()
    expect(screen.queryByText('Protocol activity is temporarily unavailable.')).toBeNull()
  })

  it('TEST 7 — no two visible rows share the same data-activity-row-id', () => {
    const tx = '0x6ea8256066280d0972c204fdf7832c2bd394f3d721ba0834898875512bd8fc61'
    const duplicated = [
      makeRow('56:tx:355', tx.slice(2)),
      makeRow('56:tx:-1', tx.slice(2)),
      makeRow('row-3', '3'.padStart(64, 'c')),
      makeRow('row-4', '4'.padStart(64, 'd')),
      makeRow('row-5', '5'.padStart(64, 'e')),
      makeRow('row-6', '6'.padStart(64, 'f')),
    ]
    render(<LiveActivityFeed rows={duplicated} />)
    const ids = renderedRowIds()
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
