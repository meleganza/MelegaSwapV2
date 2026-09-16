import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WORKSPACE = path.resolve(__dirname, '../modules/PublicFarmFactoryWorkspace.tsx')

describe('Create Farm pair search layout restore', () => {
  const src = readFileSync(WORKSPACE, 'utf8')

  it('keeps the token picker inside Step 1 instead of portaling over the accordion', () => {
    expect(src).toContain("placeholder={CREATE_FARM_UX.searchPlaceholder}")
    expect(src).toContain('data-testid="create-farm-pair-dropdown"')
    expect(src).toContain('data-testid="public-farm-pair-search"')
    expect(src).not.toContain('createPortal')
    expect(src).not.toContain('document.body')
    expect(src).not.toMatch(/position:\s*fixed/)
    expect(src).not.toContain('getBoundingClientRect')
    expect(src).not.toContain('pairDropdownCoords')
  })

  it('renders results as an in-flow list under the search field', () => {
    const searchIdx = src.indexOf('data-testid="public-farm-pair-query"')
    const listIdx = src.indexOf('data-testid="create-farm-pair-dropdown"')
    expect(searchIdx).toBeGreaterThan(0)
    expect(listIdx).toBeGreaterThan(searchIdx)
    expect(src).toContain('max-height: 220px')
    expect(src).toContain('overflow: auto')
  })
})
