import type { NextApiHandler } from 'next'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { loadClassifiedAmmPairsAsync } from 'lib/bsc-indexer/pairs/registry'
import { rpcCall } from 'lib/bsc-indexer/rpc/chunkedLogs'

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const CHUNK_SIZE = 160
const erc20 = new Interface([
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
])
const multicall = new Interface([
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
])

type PositionRow = {
  pairAddress: string
  token0?: string
  token1?: string
  symbol0?: string
  symbol1?: string
  token0Decimals?: number
  token1Decimals?: number
  reserve0Raw?: string
  reserve1Raw?: string
  lpBalanceRaw: string
}

type TokenMetadata = { symbol?: string; decimals?: number }

async function loadOwnedTokenMetadata(rows: PositionRow[]): Promise<Map<string, TokenMetadata>> {
  const addresses = Array.from(
    new Set(rows.flatMap((row) => [row.token0, row.token1]).filter((value): value is string => Boolean(value))),
  )
  if (!addresses.length) return new Map()

  const calls = addresses.flatMap((address) => [
    [address, erc20.encodeFunctionData('symbol')],
    [address, erc20.encodeFunctionData('decimals')],
  ])
  const callData = multicall.encodeFunctionData('tryAggregate', [false, calls])
  const encoded = await rpcCall<string>('eth_call', [{ to: MULTICALL3, data: callData }, 'latest'])
  const [results] = multicall.decodeFunctionResult('tryAggregate', encoded)
  const metadata = new Map<string, TokenMetadata>()

  addresses.forEach((address, index) => {
    const symbolResult = results[index * 2] as { success: boolean; returnData: string }
    const decimalsResult = results[index * 2 + 1] as { success: boolean; returnData: string }
    const entry: TokenMetadata = {}
    if (symbolResult?.success && symbolResult.returnData !== '0x') {
      try {
        const [symbol] = erc20.decodeFunctionResult('symbol', symbolResult.returnData)
        if (typeof symbol === 'string' && symbol.trim()) entry.symbol = symbol.trim()
      } catch {
        // Preserve the indexed symbol when a legacy token does not return ABI string data.
      }
    }
    if (decimalsResult?.success && decimalsResult.returnData !== '0x') {
      try {
        const [decimals] = erc20.decodeFunctionResult('decimals', decimalsResult.returnData)
        const value = Number(decimals)
        if (Number.isInteger(value) && value >= 0 && value <= 255) entry.decimals = value
      } catch {
        // The client will use the canonical ERC-20 default only if the call truly fails.
      }
    }
    metadata.set(address.toLowerCase(), entry)
  })

  return metadata
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawAccount = typeof req.query.account === 'string' ? req.query.account : ''
  let account: string
  try {
    account = getAddress(rawAccount)
  } catch {
    return res.status(400).json({ status: 'error', error: 'Invalid wallet address' })
  }

  try {
    const { pairs, source } = await loadClassifiedAmmPairsAsync()
    const candidates = pairs.filter((pair) => pair.pairAddress && pair.token0 && pair.token1)
    const owned: PositionRow[] = []

    for (let offset = 0; offset < candidates.length; offset += CHUNK_SIZE) {
      const batch = candidates.slice(offset, offset + CHUNK_SIZE)
      const calls = batch.map((pair) => [pair.pairAddress, erc20.encodeFunctionData('balanceOf', [account])])
      const callData = multicall.encodeFunctionData('tryAggregate', [false, calls])
      const encoded = await rpcCall<string>('eth_call', [{ to: MULTICALL3, data: callData }, 'latest'])
      const [results] = multicall.decodeFunctionResult('tryAggregate', encoded)

      results.forEach((result: { success: boolean; returnData: string }, index: number) => {
        if (!result.success || result.returnData === '0x') return
        const [balance] = erc20.decodeFunctionResult('balanceOf', result.returnData)
        if (balance.isZero()) return
        const pair = batch[index]
        owned.push({
          pairAddress: pair.pairAddress,
          token0: pair.token0,
          token1: pair.token1,
          symbol0: pair.symbol0,
          symbol1: pair.symbol1,
          reserve0Raw: pair.reserve0,
          reserve1Raw: pair.reserve1,
          lpBalanceRaw: balance.toString(),
        })
      })
    }

    const metadata = await loadOwnedTokenMetadata(owned)
    owned.forEach((row) => {
      const token0 = row.token0 ? metadata.get(row.token0.toLowerCase()) : undefined
      const token1 = row.token1 ? metadata.get(row.token1.toLowerCase()) : undefined
      row.symbol0 = token0?.symbol ?? row.symbol0
      row.symbol1 = token1?.symbol ?? row.symbol1
      row.token0Decimals = token0?.decimals
      row.token1Decimals = token1?.decimals
    })

    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30')
    return res.status(200).json({
      status: owned.length > 0 ? 'ready' : 'empty',
      account,
      scannedPairs: candidates.length,
      rows: owned,
      source,
      ownershipSource: 'DIRECT_WALLET_LP',
    })
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Liquidity position discovery failed',
    })
  }
}

export default handler
