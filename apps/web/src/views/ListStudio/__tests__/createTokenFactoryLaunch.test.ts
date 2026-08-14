import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ethers } from 'ethers'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_FEE_RECIPIENT,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { CREATE_TOKEN_READINESS, getCreateTokenMachineReadableReadiness } from '../createTokenReadiness'
import { LIST_CREATE_TOKEN_AVAILABLE } from '../listTokens'
import {
  assertPostCreateInvariants,
  assertTokenCreatedEvent,
  buildHandoffPayload,
  buildReviewFacts,
  encodeCreateTokenCalldata,
  humanSupplyToRaw,
  parseTokenCreatedReceipt,
  resolveCreateTokenUiState,
  TOKEN_CREATED_TOPIC0,
  validateCreateTokenDraft,
} from '../createToken/createTokenTx'
import { MELEGA_TOKEN_FACTORY_ABI } from '../createToken/createTokenAbi'

const ROOT = path.resolve(__dirname, '../../../../../../')
const FACTORY = '0x6DbB5d7162842dA94ef9172AedC8D148d203d311'

describe('MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_AND_LAUNCH_SYSTEM', () => {
  it('binds factual mainnet factory (no fabrication)', () => {
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei).toBe('100000000000000000')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeBnb).toBe('0.10')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeDecision).toBe('APPROVED')
    expect(isCreateTokenFactoryBound()).toBe(true)
    expect(LIST_CREATE_TOKEN_AVAILABLE).toBe(true)
  })

  it('routes fees to canonical treasury wallet only', () => {
    expect(CREATE_TOKEN_FEE_RECIPIENT).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(CREATE_TOKEN_READINESS.feeRecipient).toBe(CREATE_TOKEN_FEE_RECIPIENT)
  })

  it('enables the bound factory only through the certified receipt-verified execution', () => {
    expect(CREATE_TOKEN_READINESS.status).toBe('READY')
    expect(CREATE_TOKEN_READINESS.uiState).toBe('READY')
    expect(CREATE_TOKEN_READINESS.executionEnabled).toBe(true)
    const ui = resolveCreateTokenUiState({
      factoryAddress: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
      creationFeeWei: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei,
      feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
      chainId: 56,
      account: '0x1111111111111111111111111111111111111111',
      walletBalanceWei: '100000000000000000',
    })
    expect(ui).toBe('READY')
  })

  it('resolves wallet/chain/fee readiness states when factory is bound', () => {
    expect(
      resolveCreateTokenUiState({
        factoryAddress: FACTORY,
        creationFeeWei: '100000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 97,
        account: '0x1111111111111111111111111111111111111111',
      }),
    ).toBe('WRONG_CHAIN')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: FACTORY,
        creationFeeWei: '100000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: null,
      }),
    ).toBe('WALLET_DISCONNECTED')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: FACTORY,
        creationFeeWei: '100000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: '0x1111111111111111111111111111111111111111',
        walletBalanceWei: '1',
      }),
    ).toBe('INSUFFICIENT_CREATION_FEE')
    expect(
      resolveCreateTokenUiState({
        factoryAddress: FACTORY,
        creationFeeWei: '100000000000000000',
        feeRecipient: CREATE_TOKEN_FEE_RECIPIENT,
        chainId: 56,
        account: '0x1111111111111111111111111111111111111111',
        walletBalanceWei: '100000000000000000',
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

  it('builds factual review + handoff with bound factory address', () => {
    const review = buildReviewFacts({
      name: 'Alpha',
      symbol: 'ALP',
      supplyHuman: '1000',
      decimals: 18,
      owner: '0x1111111111111111111111111111111111111111',
    })
    expect(review.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(review.mintability).toBe('No future minting')
    expect(review.tax).toBe('None')
    const handoff = buildHandoffPayload({
      factoryAddress: FACTORY,
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
    expect(TOKEN_CREATED_TOPIC0).toBe('0x916d6c0a2cf2249386bfca0950c2f07d7ea93b1371a949ca4ca7a9a3607a131c')
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

  it('encodes the canonical call and derives success from its TokenCreated receipt', () => {
    const draft = {
      name: 'Alpha',
      symbol: 'ALP',
      supplyHuman: '1000',
      decimals: 18,
      owner: '0x1111111111111111111111111111111111111111',
    }
    const data = encodeCreateTokenCalldata(draft)
    expect(data).toMatch(/^0x/)
    const iface = new ethers.utils.Interface(MELEGA_TOKEN_FACTORY_ABI as any)
    const encoded = iface.encodeEventLog(iface.getEvent('TokenCreated'), [
      draft.owner,
      '0x3333333333333333333333333333333333333333',
      draft.name,
      draft.symbol,
      humanSupplyToRaw(draft.supplyHuman, draft.decimals).toString(),
      draft.decimals,
      draft.owner,
      CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei,
      '123',
    ])
    const event = parseTokenCreatedReceipt(
      {
        status: 1,
        to: FACTORY,
        logs: [{ address: FACTORY, topics: encoded.topics, data: encoded.data }],
      } as ethers.providers.TransactionReceipt,
      FACTORY,
    )
    expect(event.token.toLowerCase()).toBe('0x3333333333333333333333333333333333333333')
    expect(
      assertTokenCreatedEvent({
        event,
        draft,
        creator: draft.owner,
        creationFeeWei: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei!,
      }),
    ).toEqual([])
    expect(() =>
      parseTokenCreatedReceipt(
        { status: 0, to: FACTORY, logs: [] } as unknown as ethers.providers.TransactionReceipt,
        FACTORY,
      ),
    ).toThrow(/failed/i)
    expect(
      assertTokenCreatedEvent({
        event: { ...event, creationFee: '1' },
        draft,
        creator: draft.owner,
        creationFeeWei: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei!,
      }),
    ).toContain('Creation fee mismatch')
  })

  it('exposes machine-readable containment state', () => {
    const body = getCreateTokenMachineReadableReadiness()
    expect(body.status).toBe('READY')
    expect(body.factoryAddress?.toLowerCase()).toBe(FACTORY.toLowerCase())
    expect(body.bytecodePresent).toBe(true)
    expect(body.creationFeeConfigured).toBe(true)
    expect(body.creationFeeDecision).toBe('APPROVED')
    expect(body.creationFeeWei).toBe('100000000000000000')
    expect(body.deploymentAuthorityReady).toBe(true)
    expect(body.blockers).toEqual([])
    expect(body.updatedAt).toBeTruthy()
  })

  it('ships Solidity factory + token + mainnet deploy script in repo', () => {
    expect(existsSync(path.join(ROOT, 'contracts/create-token/MelegaTokenFactory.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'contracts/create-token/MelegaFixedSupplyToken.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'deployments/create-token/chain-56/deployed-addresses.v1.json'))).toBe(true)
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

  it('Create Token workspace shows READY CTA explanation', () => {
    const ws = readFileSync(path.join(__dirname, '../ListWorkspace.tsx'), 'utf8')
    expect(ws).toContain('list-create-token-review')
    expect(ws).toContain('list-create-token-cta-ready')
    expect(ws).toContain('list-create-token-ready')
    expect(ws).toContain('0.10 BNB')
    expect(ws).toContain('BNB Smart Chain')
    expect(ws).not.toContain('creationFeeWei} wei')
    expect(ws).not.toContain('CreateTokenFactoryV1')
  })

  it('does not alter Liquidity Builder mainnet binding', () => {
    const lb = readFileSync(path.join(ROOT, 'apps/web/src/config/constants/liquidityBuildingDeployment.ts'), 'utf8')
    expect(lb).toContain("lbFactory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'")
    expect(lb).toContain("lbAuthorizer: '0xA0c48D603BD07A012666b003Bd8089aA3dD49471'")
    expect(lb).toContain("lbFeeSink: '0xF984e1b1e9C35BF6E0cA801cd9dcea59faaA10AF'")
  })
})
