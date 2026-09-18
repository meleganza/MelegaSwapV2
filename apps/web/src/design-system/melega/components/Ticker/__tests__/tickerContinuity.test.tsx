import React, { useEffect } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MelegaTicker } from '../MelegaTicker'
import { mergeTickerWithPaidPlacements, type PaidTickerPlacement } from 'lib/trending/paidTickerPlacements'
import { TrendingRibbon } from 'views/HomeTrade/TrendingRibbon'

const ribbonState = ((globalThis as { __trendBoostRibbonState?: { items: Array<Record<string, unknown>>; rankedAssets: Array<Record<string, unknown>> } }).__trendBoostRibbonState =
  (globalThis as { __trendBoostRibbonState?: { items: Array<Record<string, unknown>>; rankedAssets: Array<Record<string, unknown>> } }).__trendBoostRibbonState ?? {
    items: [],
    rankedAssets: [],
  })

vi.mock('views/HomeTrade/useDexTrendingTicker', () => ({
  default: () => ({
    items: (globalThis as { __trendBoostRibbonState: { items: Array<Record<string, unknown>> } }).__trendBoostRibbonState.items,
    useMarquee: false,
    trendingEmpty: false,
    isLoading: false,
  }),
}))

vi.mock('views/HomeTrade/TopMoversSnapshotContext', () => ({
  useTopMoversSnapshot: () => ({
    snapshot: { snapshotId: 'logo-identity-fix' },
    rankedAssets: (globalThis as { __trendBoostRibbonState: { rankedAssets: Array<Record<string, unknown>> } }).__trendBoostRibbonState.rankedAssets,
  }),
}))

vi.mock('views/HomeTrade/useTrendingDisplayLimit', () => ({
  useTrendingDisplayLimit: () => 24,
}))

afterEach(cleanup)
const items = ['A', 'B', 'C'].map((id) => ({ id, primary: id, href: `/swap?outputCurrency=${id}` }))
const state = (container: HTMLElement) => getComputedStyle(container.querySelector('[data-ticker-track]')!).animationPlayState

describe('ticker interaction and identity continuity', () => {
  it('pauses for touch/drag independently of hover and resumes on cancel', () => {
    const { container } = render(<MelegaTicker items={items} marqueeMinItems={2} />)
    const strip = container.querySelector('[data-melega-ticker]')!
    const track = container.querySelector('[data-melega-ticker-track]')!
    expect(state(container)).toBe('running')
    fireEvent.touchStart(strip)
    expect(state(container)).toBe('paused')
    fireEvent.touchCancel(strip)
    expect(state(container)).toBe('running')
    fireEvent.pointerDown(track)
    expect(state(container)).toBe('paused')
    fireEvent.pointerCancel(track)
    expect(state(container)).toBe('running')
  })

  it('keeps hover pause active when pointer drag ends, when not externally controlled', () => {
    const { container } = render(<MelegaTicker items={items} marqueeMinItems={2} />)
    const strip = container.querySelector('[data-melega-ticker]')!
    const track = container.querySelector('[data-melega-ticker-track]')!
    fireEvent.mouseEnter(strip)
    fireEvent.pointerDown(track)
    fireEvent.pointerUp(track)
    expect(state(container)).toBe('paused')
    fireEvent.mouseLeave(strip)
    expect(state(container)).toBe('running')
  })

  it('does not remount token logos or the animation track when ranks change', () => {
    const mounted = vi.fn()
    function Icon({ id }: { id: string }) {
      useEffect(() => { mounted(id) }, [id])
      return <span>{id} logo</span>
    }
    const withIcons = items.map(item => ({ ...item, icon: <Icon id={item.id} /> }))
    const { container, rerender } = render(<MelegaTicker items={withIcons} marqueeMinItems={2} />)
    const track = container.querySelector('[data-ticker-track]')
    expect(mounted).toHaveBeenCalledTimes(6)
    rerender(<MelegaTicker items={[...withIcons].reverse()} marqueeMinItems={2} />)
    expect(container.querySelector('[data-ticker-track]')).toBe(track)
    expect(mounted).toHaveBeenCalledTimes(6)
    expect([...container.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(
      ['C', 'B', 'A', 'C', 'B', 'A'].map(id => `/swap?outputCurrency=${id}`),
    )
  })

  it('keeps short lists static and explicit pause authoritative', () => {
    const { container, rerender } = render(<MelegaTicker items={items.slice(0, 1)} />)
    expect(container.querySelectorAll('a')).toHaveLength(1)
    expect(state(container)).toBe('paused')
    rerender(<MelegaTicker items={items} marqueeMinItems={2} paused />)
    expect(container.querySelectorAll('a')).toHaveLength(6)
    expect(state(container)).toBe('paused')
  })
})

const MM72_ADDRESS = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'
const AARON_ADDRESS = '0x31B5BE085aF875B675392f5B37a1d0B8c3860222'
const LOGO_NOW = Date.parse('2026-09-17T18:00:00.000Z')

const mm72Placement: PaidTickerPlacement = {
  id: 'trend_0d06939b9fc34ff39224e07e',
  kind: 'boosted',
  symbol: 'MM72',
  chainId: 56,
  address: MM72_ADDRESS,
  href: '/@mm72/',
  startsAt: '2026-09-17T15:06:00.000Z',
  endsAt: '2026-09-18T15:06:00.000Z',
}

const aaronPlacement: PaidTickerPlacement = {
  id: 'trend_21cc5a9c1ca645d291723766',
  kind: 'boosted',
  symbol: 'AARON',
  chainId: 56,
  address: AARON_ADDRESS,
  href: '/@aaron/',
  startsAt: '2026-09-17T15:10:00.000Z',
  endsAt: '2026-09-18T15:10:00.000Z',
}

function pill(container: HTMLElement, href: string) {
  return container.querySelector(`a[href="${href}"]`)
}

describe('paid Trend Boost logo identity through TrendingRibbon', () => {
  afterEach(() => {
    ribbonState.items = []
    ribbonState.rankedAssets = []
  })

  it('renders real MM72 and AARON logos from placement identity with canonical hrefs and empty rankedAssets', () => {
    ribbonState.rankedAssets = []
    ribbonState.items = mergeTickerWithPaidPlacements({
      organic: [],
      boosted: [mm72Placement, aaronPlacement],
      nowMs: LOGO_NOW,
    })

    const { container } = render(<TrendingRibbon />)
    const mm72 = pill(container, '/@mm72/')
    const aaron = pill(container, '/@aaron/')
    expect(mm72).toBeTruthy()
    expect(aaron).toBeTruthy()

    const mm72Img = mm72!.querySelector('img')
    const aaronImg = aaron!.querySelector('img')
    expect(mm72Img).toBeTruthy()
    expect(aaronImg).toBeTruthy()
    expect(mm72Img!.getAttribute('src')).toMatch(/\/images\/56\/tokens\/0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E\.png/i)
    expect(aaronImg!.getAttribute('src')).toMatch(/\/images\/56\/tokens\/0x31B5BE085aF875B675392f5B37a1d0B8c3860222\.png/i)

    expect(mm72!.querySelector('[data-token-logo-identity="56:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e"]')).toBeTruthy()
    expect(aaron!.querySelector('[data-token-logo-identity="56:0x31b5be085af875b675392f5b37a1d0b8c3860222"]')).toBeTruthy()
    expect(mm72!.querySelector('[data-token-logo-fallback]')).toBeNull()
    expect(aaron!.querySelector('[data-token-logo-fallback]')).toBeNull()

    expect(mm72!.querySelector('svg[aria-label="Trend Boost"]')).toBeTruthy()
    expect(aaron!.querySelector('svg[aria-label="Trend Boost"]')).toBeTruthy()
    expect(mm72!.textContent).toContain('MM72')
    expect(aaron!.textContent).toContain('AARON')
    expect(mm72!.textContent).toMatch(/\d+[mhd]/)
    expect(aaron!.textContent).toMatch(/\d+[mhd]/)
    expect(mm72!.textContent).not.toMatch(/BOOSTED/)
    expect(aaron!.textContent).not.toMatch(/BOOSTED/)
    expect(mm72!.getAttribute('href')).toBe('/@mm72/')
    expect(aaron!.getAttribute('href')).toBe('/@aaron/')
  })

  it('does not reuse a logo node across chains for the same address', () => {
    ribbonState.rankedAssets = []
    ribbonState.items = mergeTickerWithPaidPlacements({
      organic: [],
      boosted: [
        mm72Placement,
        {
          ...mm72Placement,
          id: 'trend_mm72_eth',
          chainId: 1,
          href: '/@mm72-eth/',
        },
      ],
      nowMs: LOGO_NOW,
    })

    const { container } = render(<TrendingRibbon />)
    const bsc = pill(container, '/@mm72/')
    const eth = pill(container, '/@mm72-eth/')
    expect(bsc?.querySelector('[data-token-logo-identity="56:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e"]')).toBeTruthy()
    expect(eth?.querySelector('[data-token-logo-identity="1:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e"]')).toBeTruthy()
    expect(bsc?.querySelector('img')?.getAttribute('src')).toMatch(/\/images\/56\/tokens\//)
    expect(eth?.querySelector('img')?.getAttribute('src')).toMatch(/\/images\/1\/tokens\//)
    expect(bsc?.querySelector('img')?.getAttribute('src')).not.toBe(eth?.querySelector('img')?.getAttribute('src'))
  })

  it('uses the existing neutral fallback when paid identity is missing or invalid', () => {
    ribbonState.rankedAssets = []
    ribbonState.items = mergeTickerWithPaidPlacements({
      organic: [],
      boosted: [
        { ...mm72Placement, id: 'trend_no_addr', address: null, href: '/@mm72/' },
        { ...aaronPlacement, id: 'trend_bad_addr', address: 'not-an-address', href: '/@aaron/' },
      ],
      nowMs: LOGO_NOW,
    })

    const { container } = render(<TrendingRibbon />)
    const missing = pill(container, '/@mm72/')
    const invalid = pill(container, '/@aaron/')
    expect(missing?.querySelector('[data-token-logo-fallback="neutral-avatar"]')).toBeTruthy()
    expect(invalid?.querySelector('[data-token-logo-fallback="neutral-avatar"]')).toBeTruthy()
    expect(missing?.querySelector('img')).toBeNull()
    expect(invalid?.querySelector('img')).toBeNull()
    expect(missing?.querySelector('[data-token-logo-identity]')).toBeNull()
    expect(invalid?.querySelector('[data-token-logo-identity]')).toBeNull()
    expect(missing?.textContent).toContain('MM72')
    expect(invalid?.textContent).toContain('AARON')
  })
})
