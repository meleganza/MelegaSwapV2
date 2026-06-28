import { describe, expect, it } from 'vitest'
import {
  resolveUserWorkspaceReadModel,
  serializeUserWorkspaceManifest,
  WORKSPACE_EMPTY_MESSAGE,
  WORKSPACE_SECTION_ORDER,
} from '../index'

describe('user economic workspace', () => {
  it('exposes all eight workspace sections', () => {
    const model = resolveUserWorkspaceReadModel()
    expect(model.sections).toHaveLength(8)
    expect(model.sections.map((section) => section.id)).toEqual([...WORKSPACE_SECTION_ORDER])
  })

  it('is read-only with constitutional economy', () => {
    const model = resolveUserWorkspaceReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.constitutional.canonicalAsset).toBe('MARCO')
    expect(model.disclaimer).toContain('no wallet balances')
  })

  it('links sections to existing modules without duplication', () => {
    const model = resolveUserWorkspaceReadModel()
    const hrefs = Object.fromEntries(model.sections.map((section) => [section.id, section.moduleHref]))
    expect(hrefs.projects).toBe('/projects')
    expect(hrefs.assets).toBe('/assets')
    expect(hrefs.liquidity).toBe('/liquidity')
    expect(hrefs.pools).toBe('/pools')
    expect(hrefs.farms).toBe('/farms')
    expect(hrefs.presence).toBe('/presence')
    expect(hrefs.activation).toBe('/new-project')
    expect(hrefs.execution).toBe('/execution')
  })

  it('uses empty message when section has no indexed items', () => {
    const model = resolveUserWorkspaceReadModel()
    model.sections.forEach((section) => {
      if (!section.hasActivity) {
        expect(section.emptyMessage).toBe(WORKSPACE_EMPTY_MESSAGE)
        expect(section.items).toHaveLength(0)
      }
    })
  })

  it('does not include fake TVL or balance numeric values', () => {
    const model = resolveUserWorkspaceReadModel()
    const venueSections = model.sections.filter((section) =>
      ['liquidity', 'pools', 'farms'].includes(section.id),
    )
    venueSections.forEach((section) => {
      section.items.forEach((item) => {
        expect(item.notes).not.toMatch(/\$\d|TVL:\s*\d|balance:\s*\d/i)
      })
    })
  })

  it('includes future compatibility surfaces', () => {
    const model = resolveUserWorkspaceReadModel()
    expect(model.futureSurfaces.map((surface) => surface.id)).toEqual([
      'treasury',
      'labs',
      'radar',
      'space',
      'smartdrop',
    ])
  })

  it('serializes machine manifest', () => {
    const manifest = serializeUserWorkspaceManifest()
    expect(manifest.manifest).toContain('user-workspace')
    expect(manifest.read_only).toBe(true)
    expect(manifest.sections).toHaveLength(8)
  })
})
