import { MELEGA_BRIDGE_PAGE_CHAIN_IDS } from 'config/publicNetworkSwitchCapabilities'
import { PageMeta } from 'components/Layout/Page'
import MarcoBridgeWorkspace from 'views/MarcoBridge/MarcoBridgeWorkspace'

const BridgePage = () => (
  <>
    <PageMeta title="MARCO Bridge" />
    <MarcoBridgeWorkspace />
  </>
)

BridgePage.chains = [...MELEGA_BRIDGE_PAGE_CHAIN_IDS]

export default BridgePage
