import { describe, expect, it } from 'vitest'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { enrichProject } from 'registry/projects/discovery'
import { buildProjectLiveMetrics } from 'lib/projects-data/projectLiveMetrics'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import type { TokenData } from 'state/info/types'

describe('projectLiveMetrics', () => {
  const project = enrichProject(getAllProjects()[0])

  it('hydrates liquidity and volume from subgraph token data', () => {
    const tokenData: TokenData = {
      exists: true,
      name: 'MARCO',
      symbol: 'MARCO',
      address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      decimals: 18,
      volumeUSD: 125_000,
      volumeUSDChange: 4.2,
      volumeUSDWeek: 800_000,
      txCount: 420,
      liquidityToken: 1,
      liquidityUSD: 2_500_000,
      liquidityUSDChange: 1.1,
      priceUSD: 0.0004,
      priceUSDChange: 2.5,
      priceUSDChangeWeek: 8,
    }

    const live = buildProjectLiveMetrics(project, tokenData)
    expect(live.liquidity.display).toMatch(/^\$/)
    expect(live.volume.display).toMatch(/^\$/)
    expect(live.transactions.display).toBe('420')
    expect(live.priceChange?.display).toMatch(/%/)
  })

  it('returns explorer reason for holders when no holder source exists', () => {
    const live = buildProjectLiveMetrics(project, undefined)
    expect(live.holders.reasonCode).toBe('EXPLORER_SOURCE_MISSING')
    expect(live.holders.display).toBe('Waiting for explorer')
    expect(live.holders.display).not.toBe('—')
  })

  it('wires live metrics into onChainMetrics without Unavailable strings', () => {
    const tokenData: TokenData = {
      exists: true,
      name: 'MARCO',
      symbol: 'MARCO',
      address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      decimals: 18,
      volumeUSD: 50_000,
      volumeUSDChange: 0,
      volumeUSDWeek: 0,
      txCount: 10,
      liquidityToken: 1,
      liquidityUSD: 100_000,
      liquidityUSDChange: 0,
      priceUSD: 0.0004,
      priceUSDChange: 0,
      priceUSDChangeWeek: 0,
    }
    const metrics = buildOnChainMetrics(project, buildProjectLiveMetrics(project, tokenData))
    expect(metrics.liquidity).not.toBe('Unavailable')
    expect(metrics.volume).not.toBe('Unavailable')
    expect(metrics.holders).toBe('Waiting for explorer')
    expect(metrics.reasonCodes?.holders).toBe('EXPLORER_SOURCE_MISSING')
  })
})
