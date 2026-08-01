import { PageMeta } from 'components/Layout/Page'
import FounderDeploymentShell from 'views/DeploymentOrchestrator/FounderDeploymentShell'

/**
 * Canonical Founder-signed permanent contract deployment.
 * Primary surface — browser wallet (MELEGA DEPLOYER) is the only signer.
 */
const DeploymentPage = () => (
  <>
    <PageMeta />
    <FounderDeploymentShell />
  </>
)

export default DeploymentPage
