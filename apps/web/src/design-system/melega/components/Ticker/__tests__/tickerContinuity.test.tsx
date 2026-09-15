import React, { useEffect } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MelegaTicker } from '../MelegaTicker'

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
