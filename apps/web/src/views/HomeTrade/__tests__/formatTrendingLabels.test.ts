import { readFileSync } from 'fs'
import { join } from 'path'

describe('formatTrendingLabels R765', () => {
  it('removes No sustainable pool misleading copy from source', () => {
    const source = readFileSync(join(__dirname, '../formatTrendingLabels.ts'), 'utf8')
    expect(source).not.toMatch(/No sustainable pool/i)
  })

  it('exports pool APR unavailable reason constant', () => {
    const source = readFileSync(join(__dirname, '../formatTrendingLabels.ts'), 'utf8')
    expect(source).toContain('POOL_APR_UNAVAILABLE_REASON')
    expect(source).toContain('Pool APR not indexed')
  })
})
