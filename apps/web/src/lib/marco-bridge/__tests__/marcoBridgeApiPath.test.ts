import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { marcoBridgeApiPath } from '../marcoBridgeApiPath'

describe('marcoBridgeApiPath', () => {
  it('adds a trailing slash so production trailingSlash does not 308 POST quotes', () => {
    expect(marcoBridgeApiPath('/api/marco-bridge/quote')).toBe('/api/marco-bridge/quote/')
    expect(marcoBridgeApiPath('/api/marco-bridge/build')).toBe('/api/marco-bridge/build/')
    expect(marcoBridgeApiPath('/api/marco-bridge/route-state')).toBe('/api/marco-bridge/route-state/')
    expect(marcoBridgeApiPath('/api/marco-bridge/quote/')).toBe('/api/marco-bridge/quote/')
    expect(marcoBridgeApiPath('/api/marco-bridge/track?sourceTx=0xabc')).toBe(
      '/api/marco-bridge/track/?sourceTx=0xabc',
    )
  })
})

describe('next.config slash policy', () => {
  const config = readFileSync(resolve(__dirname, '../../../../next.config.mjs'), 'utf8')

  it('keeps CMC supply rewrites and does not install the catch-all 308 loop', () => {
    expect(config).toContain("source: '/v1/supply/:metric(total|circulating)'")
    expect(config).toContain('skipTrailingSlashRedirect: true')
    expect(config).not.toMatch(/destination:\s*'\/:notfile\/'/)
    expect(config).not.toMatch(/:notfile\(\(\?!v1\/supply/)
  })
})
