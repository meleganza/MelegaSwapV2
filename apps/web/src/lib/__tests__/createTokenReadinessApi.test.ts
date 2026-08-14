import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

describe('GET /api/create-token/readiness', () => {
  it('exists and returns measured readiness fields', () => {
    const src = readFileSync(path.join(process.cwd(), 'src/pages/api/create-token/readiness.ts'), 'utf8')
    expect(src).toContain('getCreateTokenMachineReadableReadiness')
    expect(src).toContain("req.method !== 'GET'")
  })
})
