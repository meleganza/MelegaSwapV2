import { readFileSync } from 'fs'
import { join } from 'path'

describe('listed token identity recovery', () => {
  it('keeps DEX listing, logo and project website in the Boost funnel', () => {
    const root = join(process.cwd(), 'src')
    const api = readFileSync(join(root, 'pages/api/registry/projects/onboard.ts'), 'utf8')
    const modal = readFileSync(join(root, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')

    expect(api).toContain('/^https?:\\/\\//i.test(packageToken.name)')
    expect(api).toContain('packageToken?.projectLink ?? legacyProjectLink')
    expect(modal).toContain('logoUrl: dex?.logo ?? project?.logoUrl ?? null')
    expect(modal).toContain("website: current.website || next.website || ''")
    expect(modal).toContain('commercial-project-identity-compact')
    expect(modal).toContain('<ProjectLogo project={detected} compact />')
    expect(modal).toContain('onError={() => setFailed(true)}')
    expect(modal).toContain('Listed')
    expect(modal).toContain('if (!detected.projectPageExists)')
  })
})
