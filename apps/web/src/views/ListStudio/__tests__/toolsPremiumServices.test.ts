import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')
const load = (file: string) => readFileSync(path.join(ROOT, file), 'utf8')

describe('R029 premium Tools services', () => {
  it('exposes only the four approved services through canonical list workflows', () => {
    const source = load('ToolsServiceGrid.tsx')
    expect(source).toContain("title: 'Create Token'")
    expect(source).toContain("title: 'Trend Boost'")
    expect(source).toContain("title: 'Featured Project'")
    expect(source).toContain("title: 'Premium Project Page'")
    expect(source).toContain("href: '/list?intent=create-token'")
    expect(source).toContain("href: '/list?intent=claim-project#trend-boost'")
    expect(source).toContain("href: '/list?intent=claim-project#featured'")
    expect(source).toContain("href: '/list?intent=create-project'")
    expect(source).not.toMatch(/checkout|payment|treasury/i)
  })

  it('keeps the existing workspace and checkout hosts mounted', () => {
    const screen = load('ListStudioScreen.tsx')
    const workspace = load('ListWorkspace.tsx')
    expect(screen).toContain('<ToolsServiceGrid />')
    expect(screen).not.toContain('<ListContractFirstFunnel />')
    expect(screen).toContain('<ListWorkspace />')
    expect(workspace).toContain('ListTrendBoostCheckout')
    expect(workspace).toContain('ListFeaturedCheckout')
  })
})
