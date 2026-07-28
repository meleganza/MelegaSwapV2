import { beforeEach, describe, expect, it } from 'vitest'
import {
  getExecutionDetailsOpen,
  setExecutionDetailsOpen,
  toggleExecutionDetailsOpen,
  subscribeExecutionDetailsOpen,
  resetExecutionDetailsOpen,
} from '../executionDetailsOpen'

describe('executionDetailsOpen SSOT', () => {
  beforeEach(() => {
    resetExecutionDetailsOpen()
  })

  it('starts closed', () => {
    expect(getExecutionDetailsOpen()).toBe(false)
  })

  it('opens and closes without corruption across multiple cycles', () => {
    for (let i = 0; i < 5; i += 1) {
      setExecutionDetailsOpen(true)
      expect(getExecutionDetailsOpen()).toBe(true)
      setExecutionDetailsOpen(false)
      expect(getExecutionDetailsOpen()).toBe(false)
    }
  })

  it('toggle flips and notifies subscribers once per change', () => {
    const seen: boolean[] = []
    const unsub = subscribeExecutionDetailsOpen((v) => seen.push(v))
    toggleExecutionDetailsOpen()
    toggleExecutionDetailsOpen()
    setExecutionDetailsOpen(false) // no-op when already false
    unsub()
    expect(seen).toEqual([true, false])
    expect(getExecutionDetailsOpen()).toBe(false)
  })
})
