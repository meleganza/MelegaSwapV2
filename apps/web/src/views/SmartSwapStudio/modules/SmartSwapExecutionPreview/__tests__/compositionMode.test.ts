import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Instant vs Smart composition', () => {
  const moduleSrc = readFileSync(join(__dirname, '../SmartSwapExecutionPreviewModule.tsx'), 'utf8')
  const viewsRoot = join(__dirname, '../../../..')
  const cockpitSrc = readFileSync(join(viewsRoot, 'Trade/TradeCockpit.tsx'), 'utf8')
  const homeSrc = readFileSync(join(viewsRoot, 'HomeTrade/HomeSwapPanel.tsx'), 'utf8')

  it('supports instant and smart intel modes', () => {
    expect(moduleSrc).toMatch(/mode\?: SmartSwapIntelMode/)
    expect(moduleSrc).toMatch(/data-intel-mode=\{mode\}/)
    expect(moduleSrc).toMatch(/isSmart \? \(/)
  })

  it('Instant does not render Route/Metrics/AI intel stack; Fee panel removed', () => {
    expect(moduleSrc).toMatch(/\{isSmart \? \(/)
    expect(moduleSrc).toMatch(/SmartSwapVisualRoute/)
    expect(moduleSrc).not.toMatch(/SmartSwapFeeTransparencyPanel/)
    expect(moduleSrc).toMatch(/data-execution-model-note/)
    // Route/Metrics/AI gated behind isSmart
    const smartBlock = moduleSrc.slice(moduleSrc.indexOf('{isSmart ?'), moduleSrc.indexOf(') : null}'))
    expect(smartBlock).toMatch(/SmartSwapVisualRoute/)
    expect(smartBlock).toMatch(/AI Insight/)
    expect(smartBlock).not.toMatch(/SmartSwapFeeTransparencyPanel/)
  })

  it('always renders a single Details accordion', () => {
    expect(moduleSrc).toMatch(/data-execution-details-accordion/)
    expect(moduleSrc).toMatch(/Details/)
    expect(moduleSrc).not.toMatch(/Show details/)
  })

  it('Trade cockpit remains a form surface; Home mounts the shared intel stack', () => {
    expect(cockpitSrc).toMatch(/SmartSwapForm|SwapForm/)
    expect(homeSrc).toMatch(/mode=\{experience\}/)
    expect(homeSrc).toMatch(/SmartSwapExecutionPreviewModule/)
  })

  it('documents Melega Factory/Router trending roots', () => {
    const trending = readFileSync(join(viewsRoot, 'HomeTrade/useDexTrendingRankings.ts'), 'utf8')
    expect(trending).toMatch(/TRENDING_DEX_FACTORY/)
    expect(trending).toMatch(/MELEGA_FACTORY_BSC/)
    expect(trending).toMatch(/MELEGA_ROUTER_BSC/)
    expect(trending).toMatch(/fetchProtocolActivity/)
    expect(trending).toMatch(/fetchIndexerSwapEvents/)
  })
})
