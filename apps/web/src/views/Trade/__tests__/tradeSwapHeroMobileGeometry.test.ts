import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('Swap featured-card mobile containment contract', () => {
  const source = readFileSync(resolve(__dirname, '../components/TradeSwapHero.tsx'), 'utf8')

  it.each([390, 393, 430])('keeps the hero-owned card inside the available column at %ipx', () => {
    expect(source).toContain('& > section > div > *')
    expect(source).toMatch(/flex:\s*0 0 100%/)
    expect(source).toMatch(/width:\s*100%/)
    expect(source).toMatch(/max-width:\s*100%/)
    expect(source).toMatch(/min-width:\s*0/)
  })

  it('does not use positioning hacks for the mobile correction', () => {
    const mobileOverride = source.slice(source.indexOf('The shared rail normally uses'))
    expect(mobileOverride).not.toMatch(/translate|margin-left:\s*-|position:\s*(absolute|fixed)/)
  })
})
