import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../..')
const load = (relativePath: string) => readFileSync(path.resolve(WEB, relativePath), 'utf8')

describe('runtime performance cache regressions', () => {
  it('keeps expensive public indexer reads edge-cacheable', () => {
    const activity = load('pages/api/protocol/activity.ts')
    const farmers = load('pages/api/farms/unique-farmers.ts')
    const pools = load('pages/api/pools/classification.ts')

    expect(activity).toContain('public, s-maxage=15, stale-while-revalidate=60')
    expect(farmers).toContain('public, s-maxage=300, stale-while-revalidate=1800')
    expect(farmers).toContain("res.setHeader('Cache-Control', 'no-store')")
    expect(pools).toContain('public, s-maxage=60, stale-while-revalidate=300')
  })

  it('keeps lightweight constants independent from farm and token registries', () => {
    const common = load('config/constants/common.ts')
    const gas = load('config/constants/gas.ts')

    expect(common).not.toMatch(/from ['"]@pancakeswap\/(farms|tokens)['"]/)
    expect(gas).not.toContain('parseUnits')
  })
})
