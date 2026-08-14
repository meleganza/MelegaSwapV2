import { PageMeta } from 'components/Layout/Page'
import FounderPoolAdapterDeployment from 'views/DeploymentOrchestrator/FounderPoolAdapterDeployment'
import { CHAIN_IDS } from 'utils/wagmi'

const PoolAdapterDeploymentPage = () => (
  <>
    <PageMeta />
    <FounderPoolAdapterDeployment />
  </>
)

PoolAdapterDeploymentPage.chains = CHAIN_IDS

export default PoolAdapterDeploymentPage
