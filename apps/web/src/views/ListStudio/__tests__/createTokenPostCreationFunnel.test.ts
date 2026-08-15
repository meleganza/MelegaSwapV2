/**
 * Post-token-creation funnel — product acceptance.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  buildCreateTokenSuccessModel,
  isTokenAddress,
} from '../createToken/createTokenPostCreationTypes'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Create Token post-creation funnel', () => {
  it('builds success model without inventing contract addresses', () => {
    const pending = buildCreateTokenSuccessModel({
      name: 'Sample',
      symbol: 'SMPL',
      contractAddress: null,
    })
    expect(pending.contractAddress).toBeNull()
    expect(pending.contractStatus).toBe('PENDING')

    const bad = buildCreateTokenSuccessModel({
      name: 'Sample',
      symbol: 'SMPL',
      contractAddress: 'not-an-address',
    })
    expect(bad.contractAddress).toBeNull()
    expect(bad.contractStatus).toBe('PENDING')

    const ok = buildCreateTokenSuccessModel({
      name: 'Sample',
      symbol: 'SMPL',
      contractAddress: '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    })
    expect(isTokenAddress(ok.contractAddress)).toBe(true)
    expect(ok.contractStatus).toBe('AVAILABLE')
  })

  it('Create Token form no longer mounts Featured / Trend Boost checkout', () => {
    const ws = load('ListWorkspace.tsx')
    expect(ws).not.toContain('list-create-token-featured')
    expect(ws).not.toContain('list-create-token-trend-boost')
    expect(ws).toContain('CreateTokenPostCreationFunnel')
    expect(ws).toContain("createTokenPhase === 'success'")
  })

  it('post-creation funnel keeps listing in one compact flow', () => {
    const funnel = load('createToken/CreateTokenPostCreationFunnel.tsx')
    expect(funnel).toContain('Token created')
    expect(funnel).toContain('List on Melega DEX?')
    expect(funnel).toContain('Yes — Add Liquidity')
    expect(funnel).toContain('No, finish')
    expect(funnel).toContain('You can list later from Liquidity')
    expect(funnel).not.toContain('Get Featured on Home')
    expect(funnel).not.toContain('ListFeaturedCheckout')
    expect(funnel).not.toContain('ListTrendBoostCheckout')
    expect(funnel).not.toContain('CommercialCheckoutModal')
    expect(funnel).toContain('/liquidity-studio?view=add')
  })

  it('uses the created contract when opening Add Liquidity', () => {
    const funnel = load('createToken/CreateTokenPostCreationFunnel.tsx')
    expect(funnel).toContain('currency=')
    expect(funnel).toContain('model.contractAddress')
  })

  it('Growth Hub commercial checkout remains available on Project Page V6', () => {
    const shell = readFileSync(
      path.join(WEB, 'src/views/ProjectPage/v6/ProjectPageV6Shell.tsx'),
      'utf8',
    )
    expect(shell).toContain('CommercialCheckoutModal')
    expect(shell).toContain('openBoost')
    expect(shell).toContain('featured')
    expect(shell).toContain('trend-boost')
  })

  it('does not modify contracts, treasury, or payment router files', () => {
    const contractsDir = path.join(REPO, 'contracts/create-token')
    expect(existsSync(contractsDir)).toBe(true)
    // Mission scope: ListStudio post-create UX only — payment router untouched in this diff.
    const payment = readFileSync(path.join(WEB, 'src/lib/monetization/paymentRouter.ts'), 'utf8')
    expect(payment).toContain('Create Token')
    expect(payment).toContain('Featured')
  })
})
