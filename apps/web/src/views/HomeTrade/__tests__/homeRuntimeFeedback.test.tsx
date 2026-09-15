import React, { createContext, useContext, useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeTradeDataRuntime from '../HomeTradeDataRuntime'
import type { HomeCriticalData } from '../HomeTradeDataContext'

const Feed = createContext('initial')
let renders = 0
vi.mock('../useHomeTradeData', () => ({ default: () => {
  const id = useContext(Feed)
  renders++
  if (renders > 12) throw new Error('Producer publication feedback loop')
  return { farmRows: [], homeTopMoversEntries: [], indexedRibbonAssets: [], liveEconomyMetrics: [],
    marketCards: [], poolRows: [], topMoversPrefixResult: 'IDENTICAL_PREFIX', topMoversSnapshotId: id }
} }))
afterEach(cleanup)

describe('Home data producer feedback isolation', () => {
  it('publishes once for unstable array references, while still receiving live context updates', () => {
    renders = 0
    function Host() {
      const [value, setValue] = useState<HomeCriticalData | null>(null)
      const [feed, setFeed] = useState('initial')
      return <Feed.Provider value={feed}>
        <HomeTradeDataRuntime onData={setValue} />
        <output>{value?.topMoversSnapshotId ?? 'loading'}</output>
        <button onClick={() => setFeed('updated')}>Update market</button>
      </Feed.Provider>
    }
    render(<Host />)
    expect(screen.getByText('initial')).toBeTruthy()
    expect(renders).toBe(1)
    fireEvent.click(screen.getByText('Update market'))
    expect(screen.getByText('updated')).toBeTruthy()
    expect(renders).toBe(2)
  })
})
