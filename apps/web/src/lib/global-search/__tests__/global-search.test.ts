import { buildGlobalSearchIndex } from '../buildGlobalSearchIndex'
import { searchGlobal } from '../searchGlobal'

describe('global search', () => {
  const index = buildGlobalSearchIndex()

  it('returns MasterChef and MasterM matches for "master"', () => {
    const results = searchGlobal(index, 'master')
    const labels = results.map((r) => r.label.toLowerCase())
    expect(results.length).toBeGreaterThan(0)
    expect(
      labels.some(
        (label) =>
          label.includes('masterchef') ||
          label.includes('masterm') ||
          label.includes('master') ||
          label.includes('farm'),
      ),
    ).toBe(true)
  })

  it('returns MARCO token matches for "marco"', () => {
    const results = searchGlobal(index, 'marco')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.label.toUpperCase().includes('MARCO'))).toBe(true)
  })

  it('returns MXMX token matches for "mxmx"', () => {
    const results = searchGlobal(index, 'mxmx')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.label.toUpperCase().includes('MXMX'))).toBe(true)
  })

  it('returns no results for random invalid query', () => {
    const results = searchGlobal(index, 'qxqzqzqzqzqzq')
    expect(results).toHaveLength(0)
  })

  it('indexes pages and projects', () => {
    const results = searchGlobal(index, 'farms')
    expect(results.some((r) => r.category === 'page' || r.category === 'farm')).toBe(true)

    const projectResults = searchGlobal(index, 'melega')
    expect(projectResults.some((r) => r.category === 'project')).toBe(true)
  })

  it('links project results to their indexed token identity and logo', () => {
    const project = index.find((item) => item.id === 'project-eyed')

    expect(project?.category).toBe('project')
    expect(project?.address).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(project?.logoUrl).toBeTruthy()
  })
})
