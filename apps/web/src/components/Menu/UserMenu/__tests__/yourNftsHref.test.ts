import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { COLLECTIBLES_ROUTE } from 'app-shell/config/navigation'

const src = readFileSync(path.resolve(__dirname, '../index.tsx'), 'utf8')

describe('UserMenu Your NFTs href', () => {
  it('uses COLLECTIBLES_ROUTE and does not construct /profile/${account}', () => {
    expect(src).toContain("from 'app-shell/config/navigation'")
    expect(src).toMatch(/href=\{COLLECTIBLES_ROUTE\}/)
    expect(src).not.toMatch(/\/profile\/\$\{account/)
    expect(COLLECTIBLES_ROUTE).toBe('/collectibles')
  })
})
