import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const screen = readFileSync(path.join(__dirname, '../PortfolioStudioScreen.tsx'), 'utf8')
const panel = readFileSync(path.join(__dirname, '../McreditsProfileTransfer.tsx'), 'utf8')
const api = readFileSync(path.join(__dirname, '../../../pages/api/mcredits/profile-transfer.ts'), 'utf8')

describe('DEX Mcredits profile transfer surface', () => {
  it('lives in the existing connected-wallet portfolio without a parallel profile shell', () => {
    expect(screen).toContain('<McreditsProfileTransfer />')
    expect(screen).toContain('wallet.connected ?')
    expect(screen).toContain('MARCO Passport ↔ DEX profile')
  })

  it('requires exact Passport transfer consent and the connected wallet signature', () => {
    expect(panel).toContain("surface: 'melega_dex'")
    expect(panel).toContain('authorizeMCreditsTransfer')
    expect(panel).toContain('signer.signMessage')
    expect(panel).toMatch(/externalReference: `dex:\$\{crypto\.randomUUID\(\)\}`/)
    expect(panel).not.toMatch(/mcreditsTransferAuthorization[^\n]*(localStorage|sessionStorage)/)
  })

  it('uses the server-only durable ledger boundary', () => {
    expect(api).toContain('transferDexProfileMcredits')
    expect(api).toContain('readDexMcreditsProfile')
    expect(panel).toContain("fetch('/api/mcredits/profile-transfer'")
    expect(api).toContain('buildDexMcreditsBalanceMessage')
    expect(api).toContain('verifyMessage')
    expect(panel).toContain('Load balance')
  })
})
