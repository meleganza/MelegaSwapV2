import type { NextApiRequest, NextApiResponse } from 'next'
import { getCreateTokenMachineReadableReadiness } from 'views/ListStudio/createTokenReadiness'

/**
 * Machine-readable Create Token factory readiness.
 * Honest: factoryAddress remains null until mainnet bind.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = getCreateTokenMachineReadableReadiness()
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(body)
}
