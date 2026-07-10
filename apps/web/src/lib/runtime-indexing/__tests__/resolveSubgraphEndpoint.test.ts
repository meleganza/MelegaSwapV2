import { describe, expect, it } from 'vitest'
import {
  BLOCKED_SUBGRAPH_NOT_DEPLOYED,
  formatSubgraphBlockerReason,
  resolveSubgraphEndpointReport,
} from '../resolveSubgraphEndpoint'

describe('resolveSubgraphEndpointReport', () => {
  it('reports BLOCKED when no Melega-native URL is configured', () => {
    const report = resolveSubgraphEndpointReport()
    expect(report.melegaNativeConfigured).toBe(false)
    expect(report.blockerCode).toBe(BLOCKED_SUBGRAPH_NOT_DEPLOYED)
    expect(report.configuredEndpoint).toBeNull()
    expect(report.documentedSchemaUri).toBe('subgraph://melega/bsc-v2')
  })

  it('formats deployment instruction in blocker reason', () => {
    const report = resolveSubgraphEndpointReport()
    const reason = formatSubgraphBlockerReason(report)
    expect(reason).toContain(BLOCKED_SUBGRAPH_NOT_DEPLOYED)
    expect(reason).toContain('NEXT_PUBLIC_MELEGA_SUBGRAPH_URL')
    expect(reason).toContain('dead')
  })
})
