import { PageMeta } from 'components/Layout/Page'
import FounderDeploymentShell from 'views/DeploymentOrchestrator/FounderDeploymentShell'
import { CHAIN_IDS } from 'utils/wagmi'

/**
 * Canonical Founder-signed permanent contract deployment.
 * Primary surface — browser wallet (MELEGA DEPLOYER) is the only signer.
 * Avalanche PREPARING is allowed (Router deploy prep) — never crash for missing Router.
 */
const DeploymentPage = () => (
  <>
    <PageMeta />
    <FounderDeploymentShell />
  </>
)

/** Include Avalanche + all wagmi chains so PREPARING wallet switches do not trip UnsupportedNetworkModal. */
DeploymentPage.chains = CHAIN_IDS

export default DeploymentPage
