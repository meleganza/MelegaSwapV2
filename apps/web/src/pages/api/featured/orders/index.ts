import type { NextApiHandler } from 'next'
import {
  FEATURED_OFFER,
  createFeaturedOrder,
  listFeaturedOrders,
  type FeaturedPayAsset,
} from 'lib/featured-placement'

const ASSETS = new Set(FEATURED_OFFER.acceptedAssets)

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'GET') {
    const orders = listFeaturedOrders().map((o) => ({
      orderId: o.orderId,
      state: o.state,
      projectId: o.projectId,
      projectSlug: o.projectSlug,
      paymentAsset: o.paymentAsset,
      paymentStatus: o.paymentStatus,
      rotationStatus: o.rotationStatus,
      cashbackFulfillmentStatus: o.cashbackFulfillmentStatus,
      updatedAt: o.updatedAt,
    }))
    return res.status(200).json({
      schema: 'melega.featured-orders.list.v1',
      offer: {
        usdPrice: FEATURED_OFFER.usdPrice,
        durationDays: FEATURED_OFFER.durationDays,
        treasuryWallet: FEATURED_OFFER.treasuryWallet,
        acceptedAssets: FEATURED_OFFER.acceptedAssets,
        packages: FEATURED_OFFER.packages.map((p) => ({
          id: p.id,
          label: p.shortLabel,
          usdPrice: p.usdPrice,
          durationLabel: p.durationLabel,
          isDefault: Boolean(p.isDefault),
        })),
      },
      orders,
    })
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const projectId = String(body.projectId || '').trim()
    const buyerWallet = String(body.buyerWallet || '').trim()
    const paymentAsset = String(body.paymentAsset || 'BNB').toUpperCase() as FeaturedPayAsset
    const projectContract = body.projectContract ? String(body.projectContract).trim() : null
    const projectSlug = body.projectSlug ? String(body.projectSlug).trim() : null
    const sourceFlow = body.sourceFlow || 'other'
    const packageId = body.packageId ? String(body.packageId).trim() : FEATURED_OFFER.defaultPackageId

    if (!projectId || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      return res.status(400).json({ error: 'projectId and buyerWallet (0x…) required' })
    }
    if (!ASSETS.has(paymentAsset)) {
      return res.status(400).json({ error: 'unsupported paymentAsset' })
    }
    if (!projectContract && !projectSlug) {
      return res.status(400).json({ error: 'projectContract or projectSlug required for identity' })
    }

    const order = createFeaturedOrder({
      projectId,
      projectSlug,
      projectContract,
      buyerWallet,
      paymentAsset,
      sourceFlow,
      packageId,
    })
    return res.status(201).json({ order })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}

export default handler
