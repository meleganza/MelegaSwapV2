/**
 * LIST Final — vertical How it works on the right of the workspace.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST How It Works (founder-final)', () => {
  it('is a compact vertical guide without interactive navigation', () => {
    const how = load('ListHowItWorks.tsx')
    expect(how).toContain('How it works')
    expect(how).toContain('data-list-how="vertical-right"')
    expect(how).toContain('Choose')
    expect(how).toContain('Configure')
    expect(how).toContain('Verify')
    expect(how).toContain('Publish')
    expect(how).toContain('Grow')
    expect(how).not.toMatch(/guaranteed|automatically verified|AI verifies|activated automatically/i)
    expect(how).not.toContain('router.push')
    expect(how).not.toContain('<button')
    expect(how).toContain('pointer-events: none')
  })

  it('sits to the right of the workspace form column', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('list-workflow-bridge')
    expect(screen).toContain('ListHowItWorks')
    expect(screen).toContain('ListWorkspace')
    expect(screen.indexOf('<ListWorkspace')).toBeLessThan(screen.indexOf('<ListHowItWorks'))
    expect(screen).toContain('actions-to-workspace')
  })
})
