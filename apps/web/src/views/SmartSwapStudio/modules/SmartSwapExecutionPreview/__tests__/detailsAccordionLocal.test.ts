import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Smart details accordion', () => {
  const src = readFileSync(join(__dirname, '../SmartSwapExecutionPreviewModule.tsx'), 'utf8')

  it('uses local controlled detailsOpen state', () => {
    expect(src).toMatch(/useState\(false\)/)
    expect(src).toMatch(/setDetailsOpen/)
    expect(src).toMatch(/toggleDetails/)
  })

  it('does not depend on global executionDetailsOpen in this module', () => {
    expect(src).not.toMatch(/useExecutionDetailsOpen/)
  })

  it('keeps details panel content mounted for reliable close', () => {
    expect(src).toMatch(/SmartSwapExecutionPreviewPanel/)
    expect(src).not.toMatch(/detailsOpen \? \(/)
  })

  it('marks composition stack', () => {
    expect(src).toMatch(/data-smart-ux-composition/)
  })
})
