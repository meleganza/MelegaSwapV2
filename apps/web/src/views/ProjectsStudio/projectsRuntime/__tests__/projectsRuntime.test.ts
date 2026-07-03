import { getAllProjects } from 'registry/projects/getAllProjects'
import { enrichProject } from 'registry/projects/discovery'
import { buildAiSummary } from '../buildAiSummary'
import { buildProjectRating } from '../buildProjectRating'
import { discoverProjectFromContract } from '../discoverProjectFromContract'
import { createProjectsRuntimeError } from '../projectsRuntimeErrors'

describe('projectsRuntime', () => {
  const project = enrichProject(getAllProjects()[0])

  it('builds factual AI summary without investment advice', () => {
    const summary = buildAiSummary(project)
    expect(summary.length).toBeGreaterThan(0)
    expect(summary.toLowerCase()).not.toMatch(/buy|sell|invest/)
    expect(summary.split('.').filter(Boolean).length).toBeLessThanOrEqual(4)
  })

  it('builds heuristic rating with confidence and reason', () => {
    const rating = buildProjectRating(project)
    expect(rating.score).toBeGreaterThan(0)
    expect(rating.score).toBeLessThanOrEqual(100)
    expect(rating.confidence).toBeGreaterThan(0)
    expect(rating.reason).toContain('Heuristic')
  })

  it('discovers known contract from registry', () => {
    const token = project.resources.tokens[0]
    const result = discoverProjectFromContract(token.address, token.chainId)
    expect(result.found).toBe(true)
    expect(result.ticker).toBe('MARCO')
  })

  it('returns PROJECT_NOT_FOUND for unknown contract', () => {
    const result = discoverProjectFromContract('0x0000000000000000000000000000000000000001', 56)
    expect(result.found).toBe(false)
    expect(result.errors[0].code).toBe('PROJECT_NOT_FOUND')
  })

  it('exposes runtime error catalog', () => {
    const err = createProjectsRuntimeError('NO_MARKET_DATA')
    expect(err.code).toBe('NO_MARKET_DATA')
    expect(err.message).toMatch(/unavailable/i)
  })
})
