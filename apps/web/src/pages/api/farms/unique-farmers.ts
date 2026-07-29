import type { NextApiHandler } from 'next'
import { listProtocolActivityEvents } from 'lib/bsc-indexer/indexer/protocolActivitySync'
import { MELEGA_MASTERCHEF_BSC } from 'lib/bsc-indexer/constants'

/**
 * Unique wallets observed on MasterChef Deposit/Withdraw/EmergencyWithdraw.
 * Factual lower-bound from durable protocol-activity index (active + finished pids).
 * Never estimates from LP supply.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const masterchef = MELEGA_MASTERCHEF_BSC.toLowerCase()
  const events = await listProtocolActivityEvents(500)
  const farmEvents = events.filter(
    (e) =>
      e.sourceType === 'masterchef' &&
      e.contractAddress?.toLowerCase() === masterchef &&
      e.wallet &&
      /^0x[a-fA-F0-9]{40}$/i.test(e.wallet),
  )

  const deposits = new Set<string>()
  const exits = new Set<string>()
  for (const ev of farmEvents) {
    const w = ev.wallet!.toLowerCase()
    if (ev.eventType === 'Deposit') deposits.add(w)
    if (ev.eventType === 'Withdraw' || ev.eventType === 'EmergencyWithdraw') exits.add(w)
  }

  // Wallets with any Deposit observation count as farmers across active+finished pids.
  // Withdraw-only wallets without Deposit in the indexed window are excluded.
  const uniqueFarmers = deposits.size
  const observedWallets = new Set([...deposits, ...exits]).size

  return res.status(200).json({
    status: uniqueFarmers > 0 ? 'ready' : farmEvents.length ? 'ready' : 'unavailable',
    uniqueFarmers,
    observedWallets,
    eventCount: farmEvents.length,
    source: 'masterchef-protocol-activity',
    masterChef: MELEGA_MASTERCHEF_BSC,
    scope: 'active+finished',
    note:
      uniqueFarmers > 0
        ? 'Unique wallets with indexed MasterChef Deposit events (active + finished pids).'
        : 'No indexed MasterChef Deposit wallets yet.',
  })
}

export default handler
