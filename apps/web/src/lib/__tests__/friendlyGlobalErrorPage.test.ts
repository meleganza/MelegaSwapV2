/**
 * Founder-approved friendly global error page — no technical primary UI.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('P0 friendly global error page', () => {
  it('restores the polished centered Home CTA and hides diagnostics', () => {
    const screen = load('components/ErrorBoundary/PremiumErrorScreen.tsx')
    const boundary = load('components/ErrorBoundary/SentryErrorBoundary.tsx')
    const app = load('app-runtime/FullMyApp.tsx')

    expect(boundary).toContain('PremiumErrorScreen')
    expect(boundary).toContain('console.error')
    expect(boundary).not.toContain('Error Tracking Id')
    expect(boundary).not.toContain('Technical details')
    expect(boundary).not.toMatch(/Active network/)
    expect(boundary).not.toMatch(/do not assume BSC/)

    expect(screen).toContain('data-friendly-error-screen')
    expect(screen).toContain('data-testid="premium-error-screen"')
    expect(screen).toContain('Return Home')
    expect(screen).toContain('href="/"')
    expect(screen).toContain('styled.a')
    expect(screen).not.toContain("from 'next/link'")
    expect(screen).toContain("This page couldn't load")
    expect(screen).toContain('place-items: center')
    expect(screen).not.toContain('Error Tracking Id')
    expect(screen).not.toContain('Technical details')
    expect(screen).not.toContain('Retry')
    expect(screen).not.toMatch(/network-debug|Active network/)

    expect(app).toContain('SentryErrorBoundary')
    expect(app).not.toMatch(/NODE_ENV === 'production' \? SentryErrorBoundary/)
  })

  it('exposes an injectable route failure for browser acceptance', () => {
    const preview = load('pages/internal/error-preview.tsx')
    expect(preview).toContain('Injected route failure')
    expect(preview).toContain('throw new Error')
  })
})
