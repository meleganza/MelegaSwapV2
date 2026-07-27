import type { NextApiHandler } from 'next'
import { listProtocolActivityEvents } from 'lib/bsc-indexer/indexer/protocolActivitySync'

/**
 * Unique wallets observed in MasterChef Deposit / Withdraw / EmergencyWithdraw events.
 * Uses the indexed protocol-activity window (not a full historical holder scan).
 * Status is `partial` when the store is a bounded recent window — never invents counts.
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const events = await listProtocolActivityEvents(500)
    const masterchef = events.filter((e) => e.sourceType === 'masterchef' && e.wallet)
    const netByWallet = new Map<string, number>()

    for (const ev of masterchef) {
      const wallet = ev.wallet!.toLowerCase()
      const prev = netByWallet.get(wallet) ?? 0
      if (ev.eventType === 'Deposit') {
        netByWallet.set(wallet, prev + 1)
      } else if (ev.eventType === 'Withdraw' || ev.eventType === 'EmergencyWithdraw') {
        netByWallet.set(wallet, prev - 1)
      }
    }

    let active = 0
    for (const score of netByWallet.values()) {
      if (score > 0) active += 1
    }

    // Fallback: if withdraws dominate the window, still surface unique Deposit wallets as observed activity.
    const depositWallets = new Set(
      masterchef.filter((e) => e.eventType === 'Deposit' && e.wallet).map((e) => e.wallet!.toLowerCase()),
    )
    const count = active > 0 ? active : depositWallets.size
    const status = masterchef.length === 0 ? 'unavailable' : 'partial'
    const reason =
      masterchef.length === 0
        ? 'No MasterChef Deposit/Withdraw events indexed yet'
        : 'Counted from indexed MasterChef activity window (not full historical userInfo scan)'

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      status,
      uniqueActiveFarmers: count,
      observedMasterchefEvents: masterchef.length,
      depositWallets: depositWallets.size,
      reason,
      source: 'protocol-activity-masterchef',
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(200).json({
      status: 'unavailable',
      uniqueActiveFarmers: null,
      reason: error instanceof Error ? error.message : 'Active farmers feed failed',
      source: 'protocol-activity-masterchef',
      generatedAt: new Date().toISOString(),
    })
  }
}

export default handler
