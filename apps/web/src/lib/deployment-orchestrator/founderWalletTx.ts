/**
 * Browser-wallet deploy helpers — estimateGas + eth_sendTransaction only.
 * No server signer. No automatic broadcast outside explicit Founder click.
 */

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export function getBrowserEthereum(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  return eth?.request ? eth : null
}

export async function walletGetGasPrice(eth: EthereumProvider): Promise<bigint> {
  const gp = await eth.request({ method: 'eth_gasPrice', params: [] })
  if (typeof gp !== 'string' || !gp.startsWith('0x')) throw new Error('eth_gasPrice failed')
  return BigInt(gp)
}

export async function walletEstimateDeployGas(
  eth: EthereumProvider,
  from: string,
  data: string,
): Promise<bigint> {
  const est = await eth.request({
    method: 'eth_estimateGas',
    params: [{ from, data, value: '0x0' }],
  })
  if (typeof est !== 'string' || !est.startsWith('0x')) throw new Error('eth_estimateGas failed')
  return BigInt(est)
}

export async function walletSendDeployTransaction(
  eth: EthereumProvider,
  from: string,
  data: string,
): Promise<string> {
  const hash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{ from, data, value: '0x0' }],
  })
  if (typeof hash !== 'string' || !/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    throw new Error('eth_sendTransaction did not return a transaction hash')
  }
  return hash
}

export function isUserRejectedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  const code = (err as { code?: number })?.code
  return code === 4001 || /user rejected|denied|rejected the request/i.test(msg)
}

/** Test-only mock: never used for mainnet broadcast in automated tests. */
export function createMockEthereum(opts?: {
  gasPriceWei?: bigint
  estimateGasWei?: bigint
  rejectSend?: boolean
}): EthereumProvider {
  return {
    async request({ method }) {
      if (method === 'eth_gasPrice') return `0x${(opts?.gasPriceWei ?? 3_000_000_000n).toString(16)}`
      if (method === 'eth_estimateGas') return `0x${(opts?.estimateGasWei ?? 2_500_000n).toString(16)}`
      if (method === 'eth_sendTransaction') {
        if (opts?.rejectSend) {
          const e = new Error('User rejected the request.') as Error & { code: number }
          e.code = 4001
          throw e
        }
        return `0x${'ab'.repeat(32)}`
      }
      throw new Error(`Unsupported mock method ${method}`)
    },
  }
}
