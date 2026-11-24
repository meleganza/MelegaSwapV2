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
// The bridge mounts wallet/live-route providers that can update while Next is
// hydrating the page Suspense boundary. SSR remains enabled in pages/_app;
// only the redundant page-level Suspense wrapper is omitted for this route.
BridgePage.disablePageSuspense = true

export default BridgePage
