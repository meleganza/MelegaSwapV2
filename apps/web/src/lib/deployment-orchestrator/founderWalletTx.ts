/**
 * Browser-wallet deploy helpers — estimateGas + eth_sendTransaction only.
 * No server signer. No automatic broadcast outside explicit Founder click.
 */

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export type DeployTxRequest = {
  from: string
  data: string
  value: '0x0'
  /** Absent for contract creation */
  to?: undefined
  gas?: string
}

export function getBrowserEthereum(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  return eth?.request ? eth : null
}

/** Prefer an injected/connector provider; fall back to window.ethereum. */
export function resolveWalletProvider(preferred?: EthereumProvider | null): EthereumProvider | null {
  if (preferred?.request) return preferred
  return getBrowserEthereum()
}

export function buildContractCreationRequest(input: {
  from: string
  data: string
  gasUnits?: bigint | null
}): DeployTxRequest {
  if (!input.data?.startsWith('0x') || input.data.length < 4) {
    throw new Error('Missing certified creation payload')
  }
  const req: DeployTxRequest = {
    from: input.from,
    data: input.data,
    value: '0x0',
  }
  if (input.gasUnits != null && input.gasUnits > 0n) {
    req.gas = `0x${input.gasUnits.toString(16)}`
  }
  return req
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
  gasUnits?: bigint | null,
): Promise<string> {
  const tx = buildContractCreationRequest({ from, data, gasUnits })
  // Contract creation: no `to` field.
  const params: Record<string, string> = {
    from: tx.from,
    data: tx.data,
    value: tx.value,
  }
  if (tx.gas) params.gas = tx.gas
  const hash = await eth.request({
    method: 'eth_sendTransaction',
    params: [params],
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
  onSend?: (params: Record<string, string>) => void
}): EthereumProvider {
  return {
    async request({ method, params }) {
      if (method === 'eth_gasPrice') return `0x${(opts?.gasPriceWei ?? 3_000_000_000n).toString(16)}`
      if (method === 'eth_estimateGas') return `0x${(opts?.estimateGasWei ?? 2_500_000n).toString(16)}`
      if (method === 'eth_sendTransaction') {
        if (opts?.rejectSend) {
          const e = new Error('User rejected the request.') as Error & { code: number }
          e.code = 4001
          throw e
        }
        const tx = (params?.[0] || {}) as Record<string, string>
        opts?.onSend?.(tx)
        if (tx.to) throw new Error('Contract creation must not set to')
        return `0x${'ab'.repeat(32)}`
      }
      throw new Error(`Unsupported mock method ${method}`)
    },
  }
}
