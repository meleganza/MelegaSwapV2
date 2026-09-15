import type { NextApiHandler } from 'next'
import { recoverPaidUnfulfilledMarcoPayOrders } from 'lib/marco-pay/orders'

export const config = {
  maxDuration: 60,
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'
  if (!vercelCron) {
    const authorized = cronSecrets.some((secret) => auth === `Bearer ${secret}`)
    if (!authorized) return res.status(401).json({ error: 'Unauthorized reconciliation' })
  }
  try {
    const result = await recoverPaidUnfulfilledMarcoPayOrders()
    return res.status(200).json({ ok: true, ...result })
  } catch (cause) {
    return res.status(500).json({
      ok: false,
      error: cause instanceof Error ? cause.message : 'RECONCILE_FAILED',
    })
  }
}

export default handler
