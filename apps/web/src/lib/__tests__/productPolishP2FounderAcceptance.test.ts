import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const SRC = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(SRC, rel), 'utf8')

describe('MELEGASWAP_V2_PRODUCT_POLISH_P2_FOUNDER_ACCEPTANCE', () => {
  it('Portfolio page mounts inside the global app shell (not pure)', () => {
    const page = load('pages/portfolio/index.tsx')
    expect(page).toContain('PortfolioStudioScreen')
    expect(page).not.toMatch(/PortfolioPage\.pure\s*=\s*true/)
  })

  it('Create Pool does not expose a second Create Pool H2 title', () => {
    const pool = load('views/PoolsStudio/components/CreatePoolCta.tsx')
    expect(pool).not.toMatch(/<Title[^>]*>Create Pool<\/Title>/)
    expect(pool).toContain('Fee destination')
    expect(pool).not.toContain('{feeInfo.recipientLabel} / {feeInfo.recipient}')
  })

  it('My Farms card prefers USD primary and never prints Unavailable', () => {
    const card = load('views/FarmsStudio/modules/FarmsMyFarmCard.tsx')
    expect(card).toContain('farms-my-deposited-primary')
    expect(card).toContain('depositedUsdAvailable')
    expect(card).not.toContain("'Unavailable'")
    expect(card).not.toContain('"Unavailable"')
  })

  it('Portfolio shell keeps em-dash placeholders instead of Unavailable labels', () => {
    const shell = load('views/PortfolioStudio/PortfolioStudioScreen.tsx')
    expect(shell).not.toContain('UNAVAILABLE')
    expect(shell).toContain("m.value || '—'")
  })

  it('Create Farm keeps accordion left and sticky preview right', () => {
    const farm = load('views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx')
    const fieldsIdx = farm.indexOf('<FieldsCol>')
    const previewIdx = farm.indexOf('<PreviewCol')
    expect(fieldsIdx).toBeGreaterThan(-1)
    expect(previewIdx).toBeGreaterThan(fieldsIdx)
    expect(farm).toContain('position: sticky')
    expect(farm).toContain('title="Step 1"')
    expect(farm).toContain('title="Advanced"')
  })
})
