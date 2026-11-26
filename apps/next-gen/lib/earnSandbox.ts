import { reviewEarnAction, type EarnSimulationInput, type EarnTransaction } from './earnAction'
import { receiptOutcome } from './userSwapFlow'

const CHAIN = '0x7a69'
export type SandboxWallet = { request(args: { method: string; params?: unknown[] }): Promise<unknown> }

export function earnSandboxUrl(env: Record<string, string | undefined>): string | null {
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'preview') return null
  try {
    const url = new URL(env.EVO_EARN_SANDBOX_RPC_URL ?? '')
    if (url.username || url.password || url.search || url.hash) return null
    if (env.VERCEL_ENV === 'preview' && url.protocol === 'https:') return url.href
    if (!env.VERCEL_ENV && url.origin === 'http://127.0.0.1:8545') return url.href
  } catch {}
  return null
}

export async function switchEarnSandbox(wallet: SandboxWallet, rpcUrl: string) {
  try {
    await wallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN }] })
  } catch (error) {
    if ((error as { code?: number })?.code !== 4902) throw error
    await wallet.request({ method: 'wallet_addEthereumChain', params: [{
      chainId: CHAIN, chainName: 'Evo Earn Sandbox', rpcUrls: [rpcUrl],
      nativeCurrency: { name: 'Test BNB', symbol: 'tBNB', decimals: 18 },
    }] })
    await wallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN }] })
  }
}

async function assertSandbox(wallet: SandboxWallet, account: string) {
  if (await wallet.request({ method: 'eth_chainId' }) !== CHAIN) throw new Error('Switch your wallet to the Evo Earn Sandbox.')
  const accounts = await wallet.request({ method: 'eth_accounts' }) as string[]
  if (accounts[0]?.toLowerCase() !== account.toLowerCase()) throw new Error('The active wallet changed. Review the operation again.')
}

export async function reviewSandbox(wallet: SandboxWallet, account: string, input: EarnSimulationInput) {
  await assertSandbox(wallet, account)
  const block = await wallet.request({ method: 'eth_blockNumber' })
  return reviewEarnAction({ ...input, account, chainId: 56 }, async (to, data, from) => {
    const result = await wallet.request({ method: 'eth_call', params: [{ to, data, ...(from ? { from } : {}) }, block] })
    if (typeof result !== 'string' || !/^0x[0-9a-f]*$/i.test(result)) throw new Error('Invalid sandbox response.')
    return result
  })
}

export async function submitSandbox(wallet: SandboxWallet, shown: EarnTransaction, input: EarnSimulationInput) {
  const review = await reviewSandbox(wallet, shown.from, input)
  const current = review.transaction
  if (!current || current.to !== shown.to || current.data !== shown.data) throw new Error('The operation changed. Review it again.')
  const gas = await wallet.request({ method: 'eth_estimateGas', params: [current] })
  if (typeof gas !== 'string' || !/^0x[0-9a-f]+$/i.test(gas) || BigInt(gas) === 0n) throw new Error('The sandbox could not estimate gas.')
  await assertSandbox(wallet, shown.from)
  const hash = await wallet.request({ method: 'eth_sendTransaction', params: [{ ...current, chainId: CHAIN, gas }] })
  if (typeof hash !== 'string' || !/^0x[0-9a-f]{64}$/i.test(hash)) throw new Error('The wallet did not return a transaction hash.')
  return hash
}

export async function readSandboxReceipt(wallet: SandboxWallet, hash: string) {
  if (await wallet.request({ method: 'eth_chainId' }) !== CHAIN) throw new Error('Switch back to the sandbox to check the receipt.')
  return receiptOutcome(await wallet.request({ method: 'eth_getTransactionReceipt', params: [hash] }) as { status?: string } | null)
}
