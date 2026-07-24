/**
 * PASSPORT_MODULE_006 — Recent Activity guards + Modules 001–005 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import {
  buildPassportRecentActivityViewModel,
  dedupeActivityItems,
  formatRelativeActivityTime,
  shortWalletLabel,
  ACTIVITY_SOURCE_CATALOG,
} from '../buildPassportRecentActivityViewModel'
import type { PassportActivityItem } from '../passportActivityTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function item(
  partial: Partial<PassportActivityItem> & Pick<PassportActivityItem, 'id' | 'title' | 'timestamp'>,
): PassportActivityItem {
  const exact = new Date(partial.timestamp).toISOString()
  return {
    category: 'ecosystem',
    eventType: 'generic',
    context: 'Passport identity',
    value: null,
    valueKind: 'none',
    valueTone: 'none',
    status: null,
    exactTimestamp: exact,
    relativeTime: formatRelativeActivityTime(partial.timestamp, partial.timestamp + 60_000),
    source: 'fixture',
    evidenceUrl: null,
    destination: null,
    freshness: 'fresh',
    provenance: partial.provenance || `prov:${partial.id}`,
    privacyClassification: 'passport_scoped',
    ...partial,
  }
}

describe('PASSPORT_MODULE_006 Recent Activity', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001–005 implementation files', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001_002_003_004_005.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 006 geometry without altering 001–005 sizes', () => {
    expect(passportOne.activityW).toBe('680px')
    expect(passportOne.activityH).toBe('360px')
    expect(passportOne.activityContentW).toBe('644px')
    expect(passportOne.activityRowH).toBe('64px')
    expect(passportOne.bottomColW).toBe('680px')
    expect(passportOne.bottomGap).toBe('16px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.assetsH).toBe('176px')
    expect(passportOne.projectsH).toBe('176px')
    expect(passportOne.liquidityMinH).toBe('232px')
  })

  it('disconnected and production empty are honest', () => {
    const disc = buildPassportRecentActivityViewModel({ forceDisconnected: true })
    expect(disc.state).toBe('disconnected')
    expect(disc.items).toHaveLength(0)
    const empty = buildPassportRecentActivityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(empty.state).toBe('empty')
    expect(empty.items).toHaveLength(0)
    expect(ACTIVITY_SOURCE_CATALOG.every((s) => !s.available)).toBe(true)
  })

  it('loading, unavailable, and four-event states', () => {
    const loading = buildPassportRecentActivityViewModel({
      fixtureItems: [],
      loading: true,
    })
    expect(loading.state).toBe('loading')
    const unavailable = buildPassportRecentActivityViewModel({
      fixtureItems: [],
      allSourcesFailed: true,
    })
    expect(unavailable.state).toBe('unavailable')
    const now = Date.now()
    const four = buildPassportRecentActivityViewModel({
      fixtureItems: [1, 2, 3, 4].map((n) =>
        item({ id: `e${n}`, title: `Event ${n}`, timestamp: now - n * 1000 }),
      ),
      fixtureSources: ACTIVITY_SOURCE_CATALOG.map((s) => ({ ...s, available: true, reason: null })),
    })
    expect(four.visibleItems).toHaveLength(4)
    expect(four.state).toBe('ready')
  })

  it('caps at 4 and shows latest disclosure without dead View All', () => {
    const now = Date.now()
    const vm = buildPassportRecentActivityViewModel({
      fixtureItems: [1, 2, 3, 4, 5].map((n) =>
        item({ id: `e${n}`, title: `Event ${n}`, timestamp: now - n * 1000 }),
      ),
      viewAllHref: null,
    })
    expect(vm.visibleItems).toHaveLength(4)
    expect(vm.hasMore).toBe(true)
    expect(vm.showViewAll).toBe(false)
    expect(vm.showLatestDisclosure).toBe(true)
  })

  it('View All only when factual destination exists', () => {
    const now = Date.now()
    const vm = buildPassportRecentActivityViewModel({
      fixtureItems: [1, 2, 3, 4, 5].map((n) =>
        item({ id: `e${n}`, title: `Event ${n}`, timestamp: now - n * 1000 }),
      ),
      viewAllHref: '/command-center',
    })
    expect(vm.showViewAll).toBe(true)
    expect(vm.viewAllHref).toBe('/command-center')
  })

  it('dedupes by provenance and excludes privacy-excluded rows', () => {
    const now = Date.now()
    const merged = dedupeActivityItems([
      item({ id: 'a', title: 'A', timestamp: now, provenance: 'k1' }),
      item({ id: 'b', title: 'B', timestamp: now - 1, provenance: 'k1' }),
      item({
        id: 'c',
        title: 'Secret',
        timestamp: now - 2,
        provenance: 'k2',
        privacyClassification: 'excluded',
      }),
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('a')
  })

  it('formats relative time and short wallet labels', () => {
    const t = Date.UTC(2026, 6, 18, 12, 0, 0)
    expect(formatRelativeActivityTime(t, t + 30_000)).toBe('Just now')
    expect(formatRelativeActivityTime(t, t + 5 * 60_000)).toBe('5m ago')
    expect(shortWalletLabel('0x1234567890abcdef1234567890abcdef12345678')).toMatch(/Wallet 0x12…5678/)
  })

  it('partial sources disclosure and M-Credits labeling in fixtures', () => {
    const now = Date.now()
    const sources = ACTIVITY_SOURCE_CATALOG.map((s) =>
      s.id === 'mcredits'
        ? { ...s, available: true, reason: null }
        : { ...s, available: false, reason: 'DOWN' },
    )
    const vm = buildPassportRecentActivityViewModel({
      fixtureItems: [
        item({
          id: 'mc1',
          title: 'M-Credits topped up',
          category: 'mcredits',
          context: 'Business M-Credits account',
          value: '+500 M-Credits',
          valueKind: 'mcredits',
          valueTone: 'positive',
          timestamp: now,
          provenance: 'mc:1',
        }),
      ],
      fixtureSources: sources,
    })
    expect(vm.state).toBe('partial')
    expect(vm.partialDisclosure).toMatch(/temporarily unavailable/i)
    expect(vm.items[0].value).toContain('M-Credits')
  })

  it('mixed event types supported in model without production mocks', () => {
    const now = Date.now()
    const vm = buildPassportRecentActivityViewModel({
      fixtureItems: [
        item({ id: '1', title: 'External wallet connected', category: 'wallet', timestamp: now }),
        item({ id: '2', title: 'Liquidity added', category: 'liquidity', context: 'MARCO / WBNB', timestamp: now - 1 }),
        item({
          id: '3',
          title: 'Liquidity Building paused',
          category: 'liquidity_building',
          status: 'Paused',
          value: 'Paused',
          valueKind: 'status',
          valueTone: 'neutral',
          timestamp: now - 2,
        }),
        item({
          id: '4',
          title: 'Identity verification submitted',
          category: 'identity',
          value: 'Submitted',
          valueKind: 'status',
          valueTone: 'warning',
          timestamp: now - 3,
        }),
      ],
    })
    expect(vm.totalCount).toBe(4)
    const live = buildPassportRecentActivityViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(live.items).toHaveLength(0)
  })

  it('mounts Module 006 with prior modules preserved', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportLiquidity')
    expect(screen).toContain('PassportBottomGrid')
    expect(screen).toContain('data-passport-module-006')
  })

  it('does not invent mockup activity amounts', () => {
    const blob = ['PassportActivity.tsx', 'buildPassportRecentActivityViewModel.ts']
      .map(load)
      .join('\n')
    expect(blob).not.toContain('+12,480')
    expect(blob).not.toContain('28450')
  })
})
