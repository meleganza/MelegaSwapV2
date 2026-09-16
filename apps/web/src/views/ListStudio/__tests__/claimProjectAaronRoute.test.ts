import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  AARON_BNB_CONTRACT,
  buildClaimProjectListHref,
  normalizeClaimChainId,
  normalizeClaimContractInput,
  sanitizeClaimDisplayName,
} from '../claimProjectIntent'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../..')

describe('claim-project AARON route recovery', () => {
  it('normalizes the AARON BNB contract and keeps claim intent on /list', () => {
    const mixed = normalizeClaimContractInput(AARON_BNB_CONTRACT.toLowerCase())
    expect(mixed).toEqual({ ok: true, address: AARON_BNB_CONTRACT })
    expect(normalizeClaimContractInput('not-an-address')).toEqual({ ok: false, reason: 'invalid' })
    expect(normalizeClaimChainId('56')).toBe(56)
    expect(
      buildClaimProjectListHref({
        contract: AARON_BNB_CONTRACT,
        chainId: 56,
        symbol: 'AARON',
        name: 'https://www.aaroncoin.fun/',
      }),
    ).toBe(
      `/list?intent=claim-project&contract=${AARON_BNB_CONTRACT}&chain=56&name=AARON&symbol=AARON`,
    )
  })

  it('treats URL token names as website metadata, never as the project title', () => {
    expect(sanitizeClaimDisplayName('https://www.aaroncoin.fun/', 'AARON')).toEqual({
      name: 'AARON',
      websiteFromName: 'https://www.aaroncoin.fun/',
    })
    expect(sanitizeClaimDisplayName('Aaron Coin', 'AARON')).toEqual({
      name: 'Aaron Coin',
      websiteFromName: null,
    })
  })

  it('maps founder /claim-project URL into the List workspace and never throws on lookup failure', () => {
    const alias = readFileSync(path.join(WEB, 'pages/claim-project.tsx'), 'utf8')
    const workspace = readFileSync(path.join(ROOT, 'ListWorkspace.tsx'), 'utf8')
    const screen = readFileSync(path.join(ROOT, 'ListStudioScreen.tsx'), 'utf8')
    expect(alias).toContain("pathname: '/list'")
    expect(alias).toContain('intent: CLAIM_PROJECT_INTENT')
    expect(workspace).toContain('/api/registry/projects/onboard')
    expect(workspace).toContain('normalizeClaimContractInput')
    expect(workspace).toContain('claim-project-inline-state')
    expect(workspace).toContain('setClaimLookupState')
    expect(screen).toContain('ClaimWorkspaceBoundary')
    const boundary = readFileSync(path.join(ROOT, 'ClaimWorkspaceBoundary.tsx'), 'utf8')
    const fallback = readFileSync(path.join(ROOT, 'ClaimProjectFallback.tsx'), 'utf8')
    expect(boundary).toContain('ClaimProjectFallback')
    expect(fallback).toContain('normalizeClaimContractInput')
    expect(fallback).toContain('/api/registry/projects/onboard')
    expect(workspace).toContain('CreateTokenNetworkSwitch')
    expect(workspace).toContain('WalletSignerBridge')
    expect(workspace).toContain('IsolatedHookBoundary')
    const createTokenTx = readFileSync(path.join(ROOT, 'createToken/createTokenTx.ts'), 'utf8')
    expect(createTokenTx).not.toMatch(/\d+n\b/)
  })
})
