import type { NextApiHandler } from 'next'
import { getTreasuryRuntimePublicEndpoint, isTreasuryRuntimeConfigured } from 'lib/treasury-handoff/config'
import { normalizeTreasuryIntakePayload } from 'lib/treasury-handoff/normalizeTreasuryIntakePayload'
import { assertPayloadDoesNotOwnSettlement } from 'lib/treasury-handoff/ownership'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ reason: 'Method not allowed' })
  }

  if (!isTreasuryRuntimeConfigured()) {
    return res.status(503).json({
      status: 'rejected',
      machine_code: 'TREASURY_RUNTIME_NOT_CONFIGURED',
      reason: 'Treasury Runtime URL is not configured',
    })
  }

  const payload = req.body
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({
      status: 'rejected',
      machine_code: 'INVALID_RECEIPT',
      reason: 'Request body must be a JSON object',
    })
  }

  try {
    assertPayloadDoesNotOwnSettlement(payload as Record<string, unknown>)
  } catch (error) {
    return res.status(400).json({
      status: 'rejected',
      machine_code: 'FORBIDDEN_SETTLEMENT_FIELD',
      reason: error instanceof Error ? error.message : 'Forbidden settlement field',
    })
  }

  const normalized = normalizeTreasuryIntakePayload(payload as Record<string, unknown>)
  if (!normalized.ok) {
    return res.status(400).json({
      status: 'rejected',
      machine_code: normalized.machine_code,
      reason: normalized.reason,
    })
  }

  const endpoint = getTreasuryRuntimePublicEndpoint()
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized.payload),
    })

    const text = await upstream.text()
    let body: unknown = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = { status: 'rejected', reason: text || 'Invalid upstream response' }
    }

    return res.status(upstream.status).json(body)
  } catch (error) {
    console.error('[treasury-handoff] proxy error', error)
    return res.status(503).json({
      status: 'rejected',
      machine_code: 'TREASURY_RUNTIME_UNAVAILABLE',
      reason: 'Treasury Runtime proxy request failed',
    })
  }
}

export default handler
