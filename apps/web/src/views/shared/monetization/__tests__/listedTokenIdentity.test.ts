import { readFileSync } from 'fs'
import { join } from 'path'

describe('listed token identity recovery', () => {
  it('keeps DEX listing, logo and project website in the Boost funnel', () => {
    const root = join(process.cwd(), 'src')
    const api = readFileSync(join(root, 'pages/api/registry/projects/onboard.ts'), 'utf8')
    const modal = readFileSync(join(root, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')

    expect(api).toContain("/^https?:\\/\\//i.test(packageToken.name)")
    expect(api).toContain('packageToken?.projectLink ?? legacyProjectLink')
    expect(modal).toContain('logoUrl: project?.logoUrl ?? dex?.logo ?? null')
    expect(modal).toContain("website: current.website || next.website || ''")
    expect(modal).toContain('MelegaSwap listed')
  })
})
