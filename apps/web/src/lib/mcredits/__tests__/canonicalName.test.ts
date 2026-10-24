import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '../../..')
const PUBLIC_SURFACES = [
  'views/shared/monetization/CommercialCheckoutModal.tsx',
  'views/shared/FeaturedHomePromotionCard.tsx',
  'views/ListStudio/ListFeaturedCheckout.tsx',
  'views/ProjectPage/v1/ProjectPageV1Shell.tsx',
  'views/Passport/v1/buildPassportV1Model.ts',
  'lib/marco-pay/approval.ts',
  'lib/marco-pay/readiness.ts',
  'lib/featured-placement/cashback.ts',
  'lib/mcredits/checkout.ts',
]

describe('canonical public Mcredits name', () => {
  it('does not expose legacy display spellings on active payment and Passport surfaces', () => {
    const source = PUBLIC_SURFACES.map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n')
    const publicText = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\b[A-Za-z]*MCredits[A-Za-z]*\b/g, '')
    expect(publicText).toContain('Mcredits')
    expect(publicText).not.toMatch(/M[‑ -]Credits|M-Credit|MCredits\b/)
  })
})
