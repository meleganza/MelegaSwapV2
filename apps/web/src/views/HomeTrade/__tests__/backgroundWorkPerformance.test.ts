import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(SRC, rel), 'utf8')
}

describe('background work performance guards', () => {
  it('tracks page visibility on the event target that owns the API', () => {
    const source = load('contexts/RefreshContext.tsx')
    expect(source).toContain("document.addEventListener('visibilitychange'")
    expect(source).toContain("document.removeEventListener('visibilitychange'")
    expect(source).not.toContain("window.addEventListener('visibilitychange'")
  })

  it('does not poll Home featured feeds while the document is hidden', () => {
    const marketFeed = load('views/HomeTrade/useFeaturedProjectMarkets.ts')
    const placementFeed = load('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(marketFeed).toContain('if (!document.hidden) void load()')
    expect(placementFeed).toContain('if (!document.hidden) void load()')
  })
})
