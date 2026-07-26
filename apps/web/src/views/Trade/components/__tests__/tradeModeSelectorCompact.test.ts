import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('TradeModeSelector premium compact', () => {
  const src = readFileSync(join(__dirname, '../TradeModeSelector.tsx'), 'utf8')

  it('does not render Optimized route explanatory copy', () => {
    expect(src).not.toMatch(/Optimized route/)
    expect(src).not.toMatch(/execution preview, fee transparency/)
  })

  it('uses compact tabs marker', () => {
    expect(src).toMatch(/data-compact-tabs/)
  })
})
