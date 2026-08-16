import type { NextApiHandler } from 'next'
import {
  getMarcoPayApplicationRef,
  MARCO_PAY_HEADERS,
  MarcoPayVerificationError,
  verifyMarcoPayWebhook,
} from 'lib/marco-pay/contract'
import {
  CONNECTION_GRANT_HEADER,
  consumeInboundConnectionGrant,
  isConnectionGrantRequest,
  resolveMarcoPayWebhookSecret,
} from 'lib/marco-pay/connectionGrant'
import { processMarcoPayCompletedEvent } from 'lib/marco-pay/orders'
import { recordSignedTestWebhook } from 'lib/marco-pay/readiness'

export const config = {
  api: { bodyParser: false },
}

async function readRawBody(req: Parameters<NextApiHandler>[0]): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 256 * 1024) throw new MarcoPayVerificationError('BODY_TOO_LARGE', 'Webhook body is too large.')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const applicationRef = getMarcoPayApplicationRef()
  if (!applicationRef) return res.status(503).json({ error: 'WEBHOOK_NOT_CONFIGURED' })
  try {
    const rawBody = await readRawBody(req)
    const grantHeader = req.headers[CONNECTION_GRANT_HEADER]
    if (isConnectionGrantRequest(rawBody, grantHeader)) {
      const grant = await consumeInboundConnectionGrant({
        rawBody,
        headerToken: grantHeader,
        expectedApplicationRef: applicationRef,
        nodeEnv: process.env.NODE_ENV,
      })
      return res.status(grant.status).json(grant.body)
    }
    const secret = await resolveMarcoPayWebhookSecret()
    if (!secret) return res.status(503).json({ error: 'WEBHOOK_NOT_CONFIGURED' })
    const event = verifyMarcoPayWebhook({
      rawBody,
      secret,
      expectedApplicationRef: applicationRef,
      headers: {
        eventId: req.headers[MARCO_PAY_HEADERS.eventId],
        eventType: req.headers[MARCO_PAY_HEADERS.eventType],
        timestamp: req.headers[MARCO_PAY_HEADERS.timestamp],
        signature: req.headers[MARCO_PAY_HEADERS.signature],
        signatureVersion: req.headers[MARCO_PAY_HEADERS.signatureVersion],
      },
    })
    const result = await processMarcoPayCompletedEvent(event)
    if (event.test_mode) {
      await recordSignedTestWebhook({
        schema: 'melega.marco-pay-test-health.v1',
        eventId: event.event_id,
        paymentRef: event.payment_ref,
        applicationRef: event.application_ref,
        verifiedAt: new Date().toISOString(),
        activated: false,
      })
    }
    return res.status(result.testMode ? 202 : 200).json({
      received: true,
      duplicate: result.duplicate,
      testMode: result.testMode,
      activated: result.order?.state === 'ACTIVE',
    })
  } catch (cause) {
    const code = cause instanceof MarcoPayVerificationError ? cause.code : cause instanceof Error ? cause.message : 'ERROR'
    const status =
      cause instanceof MarcoPayVerificationError
        ? cause.code === 'BODY_TOO_LARGE'
          ? 413
          : 401
        : code === 'ORDER_NOT_FOUND'
        ? 409
        : 500
    return res.status(status).json({ error: code })
  }
}

export default handler
