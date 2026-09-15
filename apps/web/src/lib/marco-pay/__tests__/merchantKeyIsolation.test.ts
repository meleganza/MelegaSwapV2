import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../..')
const LIVE_KEY_PATTERN = /mpk_live_[A-Za-z0-9]{8,}/

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'dist' || name === 'coverage') continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (name === '.env.example' || /\.(ts|tsx|js|jsx|mjs|cjs|md)$/.test(name)) acc.push(full)
  }
  return acc
}

describe('MARCO Pay merchant credential isolation', () => {
  it('keeps the merchant API key server-only and out of source', () => {
    const example = readFileSync(path.join(WEB, '.env.example'), 'utf8')
    expect(example).toContain('MARCO_PAY_MERCHANT_API_KEY=')
    expect(example).not.toContain('NEXT_PUBLIC_MARCO_PAY_MERCHANT')
    expect(example).not.toMatch(LIVE_KEY_PATTERN)

    const leaks = walk(path.join(WEB, 'src')).filter((file) => {
      if (file.includes(`${path.sep}__tests__${path.sep}`) || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
        return false
      }
      const text = readFileSync(file, 'utf8')
      return LIVE_KEY_PATTERN.test(text) || /NEXT_PUBLIC_MARCO_PAY_MERCHANT/.test(text)
    })
    expect(leaks).toEqual([])
  })
})
