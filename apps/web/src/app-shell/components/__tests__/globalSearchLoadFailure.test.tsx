import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GlobalSearch from '../GlobalSearch'

vi.mock('lib/global-search', () => ({
  buildGlobalSearchIndex: () => {
    throw new Error('index failed')
  },
  searchGlobal: () => [],
  globalSearchCategoryLabel: (category: string) => category,
}))

describe('global search runtime load', () => {
  afterEach(() => {
    cleanup()
  })

  it('leaves the loading state when the search runtime rejects', async () => {
    render(<GlobalSearch />)
    fireEvent.change(screen.getByPlaceholderText('Search tokens, projects, pools...'), {
      target: { value: 'marco' },
    })
    expect(screen.getByText('Preparing search…')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('Search is unavailable')).toBeTruthy())
    expect(screen.queryByText('Preparing search…')).toBeNull()
  })
})
