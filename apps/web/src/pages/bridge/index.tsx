import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { PageMeta } from 'components/Layout/Page'
import MarcoBridgeWorkspace from 'views/MarcoBridge/MarcoBridgeWorkspace'

const BridgePage = () => (
  <>
    <PageMeta title="MARCO Bridge" />
    <MarcoBridgeWorkspace />
  </>
)

BridgePage.chains = SUPPORT_MULTI_CHAINS

export default BridgePage
