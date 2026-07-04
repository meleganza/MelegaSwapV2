import { describe, expect, it } from 'vitest'
import { MelegaDesignSystemCatalogue } from '../catalogue/MelegaDesignSystemCatalogue'
import { MelegaButton } from '../components/Button'
import { MelegaBadge } from '../components/Badge'

describe('Melega design system components (DS-001)', () => {
  it('exports catalogue component', () => {
    expect(MelegaDesignSystemCatalogue).toBeTruthy()
    expect(typeof MelegaDesignSystemCatalogue).toBe('function')
  })

  it('exports button component', () => {
    expect(MelegaButton).toBeTruthy()
    expect(['function', 'object']).toContain(typeof MelegaButton)
  })

  it('exports badge component', () => {
    expect(MelegaBadge).toBeTruthy()
    expect(['function', 'object']).toContain(typeof MelegaBadge)
  })
})
