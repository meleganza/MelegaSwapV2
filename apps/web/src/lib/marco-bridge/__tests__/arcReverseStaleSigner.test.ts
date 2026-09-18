import { hexZeroPad } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import { Web3Provider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it, vi } from 'vitest'
import { ARC_CHAIN_ID, ARC_CHAIN_ID_HEX, ensureArcWalletNetwork } from '../arcChain'
import { applyCanonicalBnbSolanaApplicationGate } from '../canonicalBnbSolanaGate'
import { bindInjectedSignerAfterNetworkSwitch } from '../injectedSigner'
import { requiredNativeWeiForBridge } from '../nativeFunds'
import { assertCanonicalRouteAuthority, type CanonicalMmnNetwork, type CanonicalMmnRouteState } from '../routeAuthority'
import type { MarcoBridgeQuote } from '../types'
import { parseBridgeAmount } from '../validation'
import { submitMarcoBridgeFromWallet, type WalletSubmitSigner } from '../walletSubmit'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const LIB_ROOT = join(dirname(new URL(import.meta.url).pathname), '..')
const nativeFeeWei = '72607980676756'
const gasPriceWei = '1000000000'

function mmnNetwork(id: keyof typeof MARCO_WAVE1_NETWORKS): CanonicalMmnNetwork {
  const network = MARCO_WAVE1_NETWORKS[id]
  return {
    id,
    name: network.label,
    family: network.walletFamily,
    chain_id: network.chainId,
    eid: network.layerZeroEid,
    model: id === 'bnb' ? 'evm_oft_adapter' : id === 'solana' ? 'solana_oft' : 'evm_oft',
    token: network.marcoIdentity,
    token_decimals: network.tokenDecimals,
    endpoint_contract: network.endpointContract,
    requires_approval: id === 'bnb',
    paused: false,
  }
}

const mmnEnvelope = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-09-18T00:00:00.000Z',
    hub: 'bnb' as const,
    global_execution_enabled: false,
    networks: [mmnNetwork('bnb'), mmnNetwork('base'), mmnNetwork('solana'), mmnNetwork('robinhood'), mmnNetwork('arc')],
    routes: [
      ['bnb', 'base'],
      ['base', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
      ['bnb', 'arc'],
      ['arc', 'bnb'],
    ].map(([from, to]) => ({
      from,
      to,
      certified: true,
      publicly_active: false,
      execution_enabled: false,
      paused: false,
      reason: 'certified',
    })),
  },
})

const liveAuthority = (): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(mmnEnvelope()), { solanaStorePaused: false })

const liveQuote = (label: string, symbol: 'BNB' | 'USDC'): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei,
  nativeFeeSymbol: symbol,
  routeLabel: label,
  quotedAt: new Date().toISOString(),
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

function hexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

function createMockEip1193(initialChainId: number) {
  let chainId = initialChainId
  const sent: Array<{ to?: string; data?: string; value?: string; chainId: number }> = []
  const provider = {
    get chainId() {
      return chainId
    },
    sent,
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      if (method === 'eth_chainId') return hexChainId(chainId)
      if (method === 'net_version') return String(chainId)
      if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [evm]
      if (method === 'wallet_switchEthereumChain') {
        chainId = Number.parseInt(String(params?.[0]?.chainId), 16)
        return null
      }
      if (method === 'wallet_addEthereumChain') return null
      if (method === 'eth_getBalance') return BigNumber.from(parseUnits('10', 18)).toHexString()
      if (method === 'eth_gasPrice') return BigNumber.from(gasPriceWei).toHexString()
      if (method === 'eth_blockNumber') return '0x1'
      if (method === 'eth_getTransactionCount') return '0x1'
      if (method === 'eth_estimateGas') return '0x30d40'
      if (method === 'eth_maxPriorityFeePerGas') return '0x1'
      if (method === 'eth_feeHistory') {
        return { oldestBlock: '0x1', baseFeePerGas: ['0x3b9aca00'], gasUsedRatio: [0.1], reward: [['0x1']] }
      }
      if (method === 'eth_getBlockByNumber') {
        return {
          number: '0x1',
          hash: `0x${'11'.repeat(32)}`,
          parentHash: `0x${'00'.repeat(32)}`,
          nonce: '0x0',
          sha3Uncles: `0x${'00'.repeat(32)}`,
          logsBloom: `0x${'00'.repeat(256)}`,
          transactionsRoot: `0x${'00'.repeat(32)}`,
          stateRoot: `0x${'00'.repeat(32)}`,
          receiptsRoot: `0x${'00'.repeat(32)}`,
          miner: evm,
          difficulty: '0x0',
          totalDifficulty: '0x0',
          extraData: '0x',
          size: '0x0',
          gasLimit: '0x1c9c380',
          gasUsed: '0x0',
          timestamp: '0x1',
          transactions: [],
          uncles: [],
          baseFeePerGas: '0x3b9aca00',
        }
      }
      if (method === 'eth_call') return hexZeroPad(parseUnits('10', 18).toHexString(), 32)
      if (method === 'eth_sendTransaction') {
        const tx = (params?.[0] ?? {}) as { to?: string; data?: string; value?: string }
        sent.push({ ...tx, chainId })
        return `0x${'ab'.repeat(32)}`
      }
      throw new Error(`unhandled EIP-1193 method ${method}`)
    },
  }
  return provider
}

function mockPlainSigner(): WalletSubmitSigner & { sendTransaction: ReturnType<typeof vi.fn> } {
  const sendTransaction = vi.fn().mockResolvedValue({ hash: `0x${'cd'.repeat(32)}` })
  return {
    getAddress: async () => evm,
    sendTransaction,
    provider: {
      getBalance: async () =>
        requiredNativeWeiForBridge({ nativeFeeWei, gasPriceWei, approvalRequired: false }).add(1).toString(),
      getGasPrice: async () => gasPriceWei,
      call: async () => hexZeroPad(parseUnits('10', 18).toHexString(), 32),
    },
  }
}

describe('Arc→BNB stale signer / NETWORK_CHANGED P0', () => {
  it('reproduces ethers NETWORK_ERROR when a BNB-bound signer is reused after switch to Arc 5042', async () => {
    const ethereum = createMockEip1193(56)
    const staleProvider = new Web3Provider(ethereum, 56)
    const staleSigner = staleProvider.getSigner()
    expect((await staleProvider.getNetwork()).chainId).toBe(56)

    await ensureArcWalletNetwork(ethereum)
    expect(ethereum.chainId).toBe(ARC_CHAIN_ID)
    expect(ARC_CHAIN_ID_HEX).toBe('0x13b2')

    await expect(staleProvider.getBalance(evm)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: expect.stringContaining('underlying network changed'),
    })
    await expect(staleProvider.getGasPrice()).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
    await expect(staleProvider.getNetwork()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      network: expect.objectContaining({ name: 'bnb', chainId: 56 }),
      detectedNetwork: expect.objectContaining({ chainId: 5042, name: 'unknown' }),
    })
    await expect(staleSigner.getBalance()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: expect.stringMatching(/underlying network changed[\s\S]*code=NETWORK_ERROR[\s\S]*version=providers\/5\.6\.8/),
    })
  })

  it('rebinds via Web3Provider(ethereum, any) and reports Arc 5042 after ensureArcWalletNetwork', async () => {
    const ethereum = createMockEip1193(56)
    const staleProvider = new Web3Provider(ethereum, 56)
    await staleProvider.getNetwork()
    await ensureArcWalletNetwork(ethereum)

    const fresh = await bindInjectedSignerAfterNetworkSwitch(ethereum, ARC_CHAIN_ID)
    const network = await fresh.provider!.getNetwork()
    expect(network.chainId).toBe(5042)
    expect(await fresh.getAddress()).toBe(evm)

    const [balance, gasPrice] = await Promise.all([fresh.provider!.getBalance(evm), fresh.provider!.getGasPrice()])
    expect(BigNumber.from(balance).gt(0)).toBe(true)
    expect(BigNumber.from(gasPrice).toString()).toBe(gasPriceWei)
    await expect(staleProvider.getBalance(evm)).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })

  it('does not reuse the stale wagmi signer for Arc native preflight or Arc→BNB send', async () => {
    const ethereum = createMockEip1193(56)
    const staleProvider = new Web3Provider(ethereum, 56)
    const staleInner = staleProvider.getSigner()
    const staleSigner: WalletSubmitSigner & { sendTransaction: ReturnType<typeof vi.fn> } = {
      getAddress: async () => staleInner.getAddress(),
      sendTransaction: vi.fn().mockImplementation((tx) => staleInner.sendTransaction(tx)),
      provider: staleProvider,
    }

    await ensureArcWalletNetwork(ethereum)
    await expect(
      submitMarcoBridgeFromWallet({
        request: { from: 'arc', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
        authority: liveAuthority(),
        signer: staleSigner,
        requestQuote: async () => liveQuote('Arc → BNB', 'USDC'),
      }),
    ).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: expect.stringContaining('underlying network changed'),
    })
    expect(staleSigner.sendTransaction).not.toHaveBeenCalled()

    const tracking = await submitMarcoBridgeFromWallet({
      request: { from: 'arc', to: 'bnb', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
      authority: liveAuthority(),
      signer: staleSigner,
      ethereum,
      requestQuote: async () => liveQuote('Arc → BNB', 'USDC'),
    })

    expect(staleSigner.sendTransaction).not.toHaveBeenCalled()
    expect(tracking.status).toBe('submitted')
    expect(ethereum.chainId).toBe(5042)
    expect(ethereum.sent).toHaveLength(1)
    expect(ethereum.sent[0].chainId).toBe(5042)
    expect(ethereum.sent[0].to?.toLowerCase()).toBe(MARCO_WAVE1_NETWORKS.arc.endpointContract.toLowerCase())
  })

  it('keeps BNB→Arc on the unchanged BNB signer path (chainId 56)', async () => {
    const signer = mockPlainSigner()
    const allowanceLD = parseBridgeAmount('0.000001', 18)?.amountLD.toString()
    const tracking = await submitMarcoBridgeFromWallet({
      request: {
        from: 'bnb',
        to: 'arc',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: evm,
      },
      authority: liveAuthority(),
      signer,
      allowanceLD,
      requestQuote: async () => liveQuote('BNB → Arc', 'BNB'),
    })
    expect(tracking.status).toBe('submitted')
    expect(signer.sendTransaction).toHaveBeenCalledTimes(1)
    expect(signer.sendTransaction.mock.calls[0][0]).toMatchObject({
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
    })
  })

  it('wires Arc submit to rebind after ensureArcWalletNetwork and leaves BNB approval on wagmi signer', () => {
    const helper = readFileSync(join(LIB_ROOT, 'injectedSigner.ts'), 'utf8')
    const submit = readFileSync(join(LIB_ROOT, 'walletSubmit.ts'), 'utf8')
    const workspace = readFileSync(join(LIB_ROOT, '../../views/MarcoBridge/MarcoBridgeWorkspace.tsx'), 'utf8')

    expect(helper).toContain("new Web3Provider(ethereum, 'any')")
    expect(helper).toContain('await provider.getNetwork()')
    expect(helper).toContain('provider.getSigner()')
    expect(submit).toMatch(/ensureArcWalletNetwork\(input\.ethereum\)[\s\S]*bindInjectedSignerAfterNetworkSwitch\(input\.ethereum, ARC_CHAIN_ID\)/)
    expect(workspace).toMatch(
      /ensureArcWalletNetwork\(ethereum\)[\s\S]*bindInjectedSignerAfterNetworkSwitch\(ethereum, ARC_CHAIN_ID\)/,
    )
    expect(workspace).toContain('signer: submitSigner')
    expect(workspace).toContain('submitMarcoApprovalFromWallet')
    expect(workspace).toMatch(/submitMarcoApprovalFromWallet\(\{[\s\S]*signer,/)
  })
})
