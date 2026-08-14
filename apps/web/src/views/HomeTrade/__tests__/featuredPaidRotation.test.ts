import { describe, expect, it } from 'vitest'
import { selectFeaturedRotationWindow } from '../featuredProjectsCatalog'

describe('paid Featured Home rotation', () => {
  it('keeps exactly four visible slots while rotating an unlimited candidate catalog', () => {
    const projects = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const observed = new Set<string>()
    for (let slot = 0; slot < projects.length; slot += 1) {
      const visible = selectFeaturedRotationWindow(projects, slot * 1_000, 4, 1_000)
      expect(visible).toHaveLength(4)
      visible.forEach((project) => observed.add(project))
    }
    expect([...observed].sort()).toEqual(projects)
  })

  it('does not duplicate projects when fewer than four placements are active', () => {
    expect(selectFeaturedRotationWindow(['a', 'b', 'c'], 0)).toEqual(['a', 'b', 'c'])
  })
})
