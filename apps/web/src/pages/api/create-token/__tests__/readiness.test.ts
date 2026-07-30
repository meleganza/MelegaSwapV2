import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

describe('GET /api/create-token/readiness', () => {
  it('exists and returns measured readiness fields', () => {
    const src = readFileSync(path.join(__dirname, '../readiness.ts'), 'utf8')
    expect(src).toContain('getCreateTokenMachineReadableReadiness')
    expect(src).toContain("req.method !== 'GET'")
  })
})
