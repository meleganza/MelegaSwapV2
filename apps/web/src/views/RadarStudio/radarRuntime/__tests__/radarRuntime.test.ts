import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { discoverProjectFromContract } from 'views/ProjectsStudio/projectsRuntime/discoverProjectFromContract'
import { buildLiveEvents } from '../buildLiveEvents'
import { buildOpportunityScore } from '../buildOpportunityScore'
import { createRadarRuntimeError } from '../radarRuntimeErrors'
import { mapProjectToRadarEvent } from '../formatRadarRuntime'

describe('radarRuntime', () => {
  const projects = getAllProjects().map(enrichProject)
  const project = projects[0]
  const token = project.resources.tokens[0]

  it('builds live events from projects runtime', () => {
    const events = buildLiveEvents(projects)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].source).toBeTruthy()
    expect(events[0].confidence).toMatch(/%/)
  })

  it('maps registry project to radar discovery card', () => {
    const events = buildLiveEvents(projects)
    const card = mapProjectToRadarEvent(project, 1, events)
    expect(card.name).toBe('MARCO')
    expect(card.liquidity).toBe('Unavailable')
    expect(card.summary.length).toBeGreaterThan(0)
  })

  it('builds opportunity score without investment advice', () => {
    const opp = buildOpportunityScore(project)
    expect(opp.score).toBeGreaterThan(0)
    expect(opp.summary.toLowerCase()).not.toMatch(/buy|sell/)
  })

  it('discovers known contract via projects runtime', () => {
    const result = discoverProjectFromContract(token.address, token.chainId)
    expect(result.found).toBe(true)
  })

  it('returns PROJECT_NOT_INDEXED for unknown contract', () => {
    const result = discoverProjectFromContract('0x0000000000000000000000000000000000000001', 56)
    expect(result.found).toBe(false)
    expect(result.errors[0].code).toBe('PROJECT_NOT_FOUND')
  })

  it('exposes radar error catalog', () => {
    const err = createRadarRuntimeError('NO_RUNTIME_DATA')
    expect(err.code).toBe('NO_RUNTIME_DATA')
  })
})
