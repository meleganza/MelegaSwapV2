import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const src = readFileSync(path.resolve(__dirname, './useTransactionDeadline.ts'), 'utf8')

describe('useTransactionDeadline', () => {
  it('keeps chain timestamp authoritative and falls back to getNow only when ttl is set', () => {
    expect(src).toMatch(/if\s*\(\s*!ttl\s*\)\s*return\s+undefined/)
    expect(src).toContain('blockTimestamp ?? BigNumber.from(getNow())')
    expect(src).toContain('base.add(ttl)')
    expect(src).toContain('userDeadline')
    expect(src).not.toMatch(/\b1200\b/)
  })
})
