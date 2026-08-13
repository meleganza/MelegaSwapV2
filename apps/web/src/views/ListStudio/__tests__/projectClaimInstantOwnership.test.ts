import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildProjectClaimMessage, normalizeClaimMetadata } from 'lib/project-claims/claimMessage'

const ROOT = path.resolve(__dirname, '../../..')

describe('instant project claim ownership flow', () => {
  it('uses an owner/deployer preflight and signed immediate publication', () => {
    const workspace = fs.readFileSync(path.join(ROOT, 'views/ListStudio/ListWorkspace.tsx'), 'utf8')
    const commercialCheckout = fs.readFileSync(
      path.join(ROOT, 'views/shared/monetization/CommercialCheckoutModal.tsx'),
      'utf8',
    )
    const endpoint = fs.readFileSync(path.join(ROOT, 'pages/api/registry/projects/claim.ts'), 'utf8')
    const directory = fs.readFileSync(
      path.join(ROOT, 'views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts'),
      'utf8',
    )

    expect(workspace).toContain("action: 'preflight'")
    expect(workspace).toContain('signer.signMessage(message)')
    expect(workspace).toContain('Project page published.')
    expect(workspace).toContain('list-claim-featured-home-promotion')
    expect(workspace).toContain('list-claim-trend-boost')
    expect(workspace).not.toContain('Submit for verification')
    expect(commercialCheckout).toContain("action: 'preflight'")
    expect(commercialCheckout).toContain("action: 'publish'")
    expect(commercialCheckout).toContain('signer.signMessage(message)')
    expect(commercialCheckout).toContain('signer.sendTransaction')
    expect(commercialCheckout).not.toContain('server-side registry before checkout')
    expect(endpoint).toContain('WALLET_NOT_AUTHORIZED')
    expect(endpoint).toContain('Connected wallet is not the contract owner or original deployer.')
    expect(endpoint).toContain('persistProjectClaim(record)')
    expect(directory).toContain("fetch('/api/registry/projects/claims')")
    expect(directory).toContain('projectHref: `/@${claim.slug}/`')
  })

  it('reads and formats the on-chain ERC-20 total supply', () => {
    const identity = fs.readFileSync(
      path.join(ROOT, 'registry/projects/pending/fetchErc20OnChainIdentity.ts'),
      'utf8',
    )
    expect(identity).toContain('function totalSupply() view returns (uint256)')
    expect(identity).toContain('ethers.utils.formatUnits(supply, decimals)')
    expect(identity).toContain('totalSupplyFormatted')
  })

  it('normalizes a public handle and binds metadata to the signature', () => {
    const metadata = normalizeClaimMetadata({
      name: ' AARON ',
      symbol: 'aaron',
      handle: '@Aaron Project',
      description: 'Project description',
      logo: null,
      website: null,
      x: null,
      telegram: null,
      discord: null,
    })
    expect(metadata.handle).toBe('aaron-project')
    expect(
      buildProjectClaimMessage({
        chainId: 56,
        contract: '0x0000000000000000000000000000000000000001',
        claimant: '0x0000000000000000000000000000000000000002',
        metadata,
        issuedAt: '2026-08-11T20:00:00.000Z',
      }),
    ).toContain('Project: @aaron-project')
  })
})
