/**
 * LIST Wave 04A — compact How it works beside workspace Completion.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIST Wave 04A How It Works', () => {
  it('is compact and non-interactive', () => {
    const how = load('ListHowItWorks.tsx')
    expect(how).toContain('How it works')
    expect(how).toContain('data-list-how="compact"')
    expect(how).toContain('Choose')
    expect(how).toContain('Import, create or claim your token or project.')
    expect(how).toContain('Setup')
    expect(how).toContain('Review')
    expect(how).toContain('Publish')
    expect(how).toContain('Grow')
    expect(how).not.toMatch(/guaranteed|automatically verified|AI verifies|activated automatically/i)
    expect(how).not.toContain('onClick')
    expect(how).not.toContain('router.push')
    expect(how).not.toContain('<button')
    expect(how).toContain('pointer-events: none')
  })

  it('sits beside the workspace Completion surface', () => {
    const screen = load('ListStudioScreen.tsx')
    expect(screen).toContain('list-workflow-bridge')
    expect(screen).toContain('ListHowItWorks')
    expect(screen).toContain('ListWorkspace')
    expect(screen.indexOf('ListHowItWorks')).toBeLessThan(screen.indexOf('ListWorkspace'))
    expect(screen).toContain('actions-to-workspace')
  })
})
