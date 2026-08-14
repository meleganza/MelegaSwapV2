import type { NextApiRequest, NextApiResponse } from 'next'
import { buildOrchestratorStatus } from 'lib/deployment-orchestrator'

/**
 * Canonical Deployment Orchestrator status API.
 * Aggregates LB + Create Token + Public Farm Factory readiness — no duplicated gate math.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = buildOrchestratorStatus()
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(body)
}
