import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { assertReadonlyRpc, DEFAULT_BSC_READONLY_RPC } from '../../lib/bscQuote'
import { simulateEarnAction } from '../../lib/earnAction'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(key, value)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }
  const signal = AbortSignal.timeout(7000)
  const reply = (code: string) => res.status(code === 'INVALID_INPUT' ? 422 : 200).json({ code, executable: false })
  try {
    const rpc = assertReadonlyRpc(process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC)
    async function read(method: 'eth_chainId' | 'eth_blockNumber' | 'eth_call', params: unknown[]) {
      const response = await fetch(rpc, { method: 'POST', signal, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
      if (!response.ok) throw new Error('RPC unavailable')
      const data = await response.json()
      if (typeof data.result !== 'string' || !/^0x[0-9a-f]*$/i.test(data.result)) throw new Error('RPC result unavailable')
      return data.result as string
    }
    let block: string | undefined
    const code = await simulateEarnAction(req.body ?? {}, async (to, data, from) => {
      if (!block) {
        if (await read('eth_chainId', []) !== '0x38') throw new Error('Wrong network')
        block = await read('eth_blockNumber', [])
      }
      return read('eth_call', [{ to, data, ...(from ? { from } : {}) }, block])
    })
    return reply(code)
  } catch {
    return reply('SIMULATION_UNAVAILABLE')
  }
}
