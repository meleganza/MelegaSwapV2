import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_FEE_RECIPIENT,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import {
  CREATE_TOKEN_READINESS,
  getCreateTokenMachineReadableReadiness,
} from '../createTokenReadiness'
import { LIST_CREATE_TOKEN_AVAILABLE } from '../listTokens'
import {
  assertPostCreateInvariants,
  buildHandoffPayload,
  buildReviewFacts,
  humanSupplyToRaw,
  resolveCreateTokenUiState,
  TOKEN_CREATED_TOPIC0,
  validateCreateTokenDraft,
} from '../createToken/createTokenTx'

const ROOT = path.resolve(__dirname, '../../../../../../')

describe('MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_AND_LAUNCH_SYSTEM', () => {
  it('keeps canonical factory binding null (no fabricated mainnet address)', () => {
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress).toBeNull()
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei).toBe('50000000000000000')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeBnb).toBe('0.05')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeDecision).toBe('APPROVED')
    expect(isCreateTokenFactoryBound()).toBe(false)
    expect(LIST_CREATE_TOKEN_AVAILABLE).toBe(false)
  })

  it('routes fees to canonical treasury wallet only', () => {
    expect(CREATE_TOKEN_FEE_RECIPIENT).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(CREATE_TOKEN_READINESS.feeRecipient).toBe(CREATE_TOKEN_FEE_RECIPIENT)
  })

  it('exposes FACTORY_NOT_DEPLOYED readiness and never READY while unbound', () => {
    expect(CREATE_TOKEN_READINESS.status).toBe('DEPLOYMENT_BLOCKED')
    expect(CREATE_TOKEN_READINESS.uiState).toBe('FACTORY_NOT_DEPLOYED')
    expect(CREATE_TOKEN_READINESS.executionEnabled).toBe(false)
    const ui = resolveCreateTokenUiState({
      factoryAddress: null,
      creationFeeWei: null,
      feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
      chainId: 56,
      account: '0x1111111111111111111111111111111111111111',
    })
    expect(ui).toBe('FACTORY_NOT_DEPLOYED')
    expect(ui).not.toBe('READY')
  })

  it('resolves wallet/chain/fee readiness states when factory is hypothetically bound', () => {
    expect(
      resolveCreateTokenUiState({
        factoryAddress: '0x2222222222222222222222222222222222222222',
        creationFeeWei: '10000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 97,
        account: '0x1111111111111111111111111111111111111111',
      }),
    ).toBe('WRONG_CHAIN')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: '0x2222222222222222222222222222222222222222',
        creationFeeWei: '10000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: null,
      }),
    ).toBe('WALLET_DISCONNECTED')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: '0x2222222222222222222222222222222222222222',
        creationFeeWei: '10000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: '0x1111111111111111111111111111111111111111',
        walletBalanceWei: '1',
      }),
    ).toBe('INSUFFICIENT_CREATION_FEE')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: '0x2222222222222222222222222222222222222222',
        creationFeeWei: '10000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: '0x1111111111111111111111111111111111111111',
        walletBalanceWei: '10000000000000000',
      }),
    ).toBe('READY')
  })

  it('validates draft fields and supply scaling', () => {
    expect(
      validateCreateTokenDraft({
        name: 'Alpha',
        symbol: 'ALP',
        supplyHuman: '1000',
        decimals: 18,
        owner: '0x1111111111111111111111111111111111111111',
      }),
    ).toEqual([])
    expect(humanSupplyToRaw('1000', 18)).toBe(1000n * 10n ** 18n)
    expect(
      validateCreateTokenDraft({
        name: '',
        symbol: 'ALP',
        supplyHuman: '0',
        decimals: 19,
        owner: 'not-an-address',
      }).length,
    ).toBeGreaterThan(0)
  })

  it('builds factual review + handoff without inventing factory address', () => {
    const review = buildReviewFacts({
      name: 'Alpha',
      symbol: 'ALP',
      supplyHuman: '1000',
      decimals: 18,
      owner: '0x1111111111111111111111111111111111111111',
    })
    expect(review.factoryAddress).toBeNull()
    expect(review.mintability).toBe('No future minting')
    expect(review.tax).toBe('None')
    const handoff = buildHandoffPayload({
      factoryAddress: '0x2222222222222222222222222222222222222222',
      creationTx: '0xabc',
      event: {
        creator: '0x1111111111111111111111111111111111111111',
        token: '0x3333333333333333333333333333333333333333',
        name: 'Alpha',
        symbol: 'ALP',
        totalSupply: '1000',
        decimals: 18,
        owner: '0x1111111111111111111111111111111111111111',
        creationFee: '1',
        timestamp: '1',
      },
    })
    expect(handoff.chainId).toBe(56)
    expect(handoff.verificationStatus).toBe('pending')
  })

  it('locks TokenCreated topic0 and post-create invariants', () => {
    expect(TOKEN_CREATED_TOPIC0).toBe(
      '0x916d6c0a2cf2249386bfca0950c2f07d7ea93b1371a949ca4ca7a9a3607a131c',
    )
    expect(
      assertPostCreateInvariants({
        name: 'A',
        symbol: 'A',
        decimals: 18,
        totalSupply: '10',
        ownerBalance: '10',
        factoryTokenBalance: '0',
      }),
    ).toEqual([])
    expect(
      assertPostCreateInvariants({
        name: 'A',
        symbol: 'A',
        decimals: 18,
        totalSupply: '10',
        ownerBalance: '9',
        factoryTokenBalance: '1',
      }).length,
    ).toBeGreaterThan(0)
  })

  it('exposes machine-readable readiness API shape', () => {
    const body = getCreateTokenMachineReadableReadiness()
    expect(body.status).toBe('DEPLOYMENT_BLOCKED')
    expect(body.factoryAddress).toBeNull()
    expect(body.bytecodePresent).toBe(false)
    expect(body.creationFeeConfigured).toBe(true)
    expect(body.creationFeeDecision).toBe('APPROVED')
    expect(body.creationFeeWei).toBe('50000000000000000')
    expect(body.deploymentAuthorityReady).toBe(false)
    expect(body.blockers.length).toBeGreaterThan(0)
    expect(body.blockers.some((b) => /deployment authority/i.test(b))).toBe(true)
    expect(body.blockers.some((b) => /Founder decision|FEE_DECISION/i.test(b))).toBe(false)
    expect(body.updatedAt).toBeTruthy()
  })

  it('ships Solidity factory + token + mainnet deploy script in repo', () => {
    expect(existsSync(path.join(ROOT, 'contracts/create-token/MelegaTokenFactory.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'contracts/create-token/MelegaFixedSupplyToken.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'deployments/create-token/chain-56/deployed-addresses.v1.json'))).toBe(
      true,
    )
    const factory = readFileSync(path.join(ROOT, 'contracts/create-token/MelegaTokenFactory.sol'), 'utf8')
    expect(factory).toContain('event TokenCreated')
    expect(factory).toContain('feeRecipient.call')
    expect(factory).not.toContain('proxy')
    const token = readFileSync(path.join(ROOT, 'contracts/create-token/MelegaFixedSupplyToken.sol'), 'utf8')
    expect(token).toContain('_mint(owner_')
    expect(token).not.toMatch(/function\s+mint\s*\(/)
    expect(token).not.toMatch(/import\s*\{[^}]*Ownable/)
    expect(token).not.toMatch(/function\s+pause\s*\(/)
    expect(token).not.toMatch(/function\s+blacklist\s*\(/)
  })

  it('Create Token workspace shows deployment-pending CTA explanation', () => {
    const ws = readFileSync(path.join(__dirname, '../ListWorkspace.tsx'), 'utf8')
    expect(ws).toContain('list-create-token-review')
    expect(ws).toContain('list-create-token-cta-blocked')
    expect(ws).toContain('Factory deployment pending')
    expect(ws).toContain('CREATE_TOKEN_READINESS.uiState')
  })

  it('does not alter Liquidity Builder null binding', () => {
    const lb = readFileSync(
      path.join(ROOT, 'apps/web/src/config/constants/liquidityBuildingDeployment.ts'),
      'utf8',
    )
    expect(lb).toContain('lbFactory: null')
    expect(lb).toContain('lbAuthorizer: null')
    expect(lb).toContain('lbFeeSink: null')
  })
})
