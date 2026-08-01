import { PageMeta } from 'components/Layout/Page'
import DeploymentDashboard from 'views/DeploymentOrchestrator/DeploymentDashboard'

/**
 * Read-only deployment status archive.
 * Primary Founder-signed deploy UI lives at /runtime/deployment.
 */
const DeploymentStatusPage = () => (
  <>
    <PageMeta />
    <DeploymentDashboard />
  </>
)

export default DeploymentStatusPage
