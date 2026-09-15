import React, { useContext } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RefreshContext, RefreshContextProvider } from '../RefreshContext'
function Counters() {
  const { fast, slow } = useContext(RefreshContext)
  return <output>{fast}/{slow}</output>
}
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
describe('background refresh visibility', () => {
  it('starts hidden without polling, resumes visible and stops again on document-only events', () => {
    vi.useFakeTimers()
    let hidden = true
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    render(<RefreshContextProvider><Counters /></RefreshContextProvider>)
    act(() => { vi.advanceTimersByTime(98_000) })
    expect(screen.getByText('0/0')).toBeTruthy()
    act(() => { hidden = false; document.dispatchEvent(new Event('visibilitychange', { bubbles: false })); vi.advanceTimersByTime(98_000) })
    expect(screen.getByText('2/1')).toBeTruthy()
    act(() => { hidden = true; document.dispatchEvent(new Event('visibilitychange', { bubbles: false })); vi.advanceTimersByTime(98_000) })
    expect(screen.getByText('2/1')).toBeTruthy()
  })
})
