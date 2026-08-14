import type { NextApiRequest, NextApiResponse } from 'next'
import { buildServerFounderExecutionSession } from 'lib/deployment-orchestrator'
import { resolveFounderOperationalState } from 'lib/deployment-orchestrator/founderOperationalState'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_DEPLOY_CHAIN_ID } from 'lib/deployment-orchestrator'

/**
 * Founder browser-signing session — never gates on MAINNET_DEPLOYER / KMS / server env.
 * Connected wallet is the authority; this endpoint only exposes static session + null records.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = buildServerFounderExecutionSession()
  const operationalState = resolveFounderOperationalState({
    gates: session.gates,
    gas: session.gas,
  })

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    schema: 'melega.dex.v1.founder-signed-deployment.browser-session',
    authorityModel: 'FOUNDER_WALLET_SIGNED',
    expectedDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    chainIdRequired: FOUNDER_DEPLOY_CHAIN_ID,
    operationalState,
    session,
    serverEnvDoesNotAuthorizeBrowserDeploy: true,
    kmsRequired: false,
    mainnetDeployerEnvRequired: false,
    bscscanRequiredToDeploy: false,
    rpcServerCredentialRequired: false,
  })
}
