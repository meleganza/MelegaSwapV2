import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(__dirname, '../../..')
const read = (relative: string) => fs.readFileSync(path.join(SRC, relative), 'utf8')

describe('developer surfaces repair', () => {
  it('keeps the Docs navigation available while the guide scrolls', () => {
    const docs = read('pages/docs/index.tsx')
    expect(docs).toContain('position: sticky')
    expect(docs).toContain('data-testid="docs-sticky-navigation"')
  })

  it('uses compact full previews and canonical default market targets', () => {
    const devs = read('pages/devs/index.tsx')
    const market = read('pages/embed/market.tsx')
    expect(devs).toContain("{ value: 'MARCO/BNB', label: 'MARCO / BNB' }")
    expect(devs).toContain('devs-${kind}-market-selector')
    expect(devs).toContain('transform: scale(0.78)')
    expect(market).toContain(".replace(/wbnb/g, 'bnb')")
  })
})
