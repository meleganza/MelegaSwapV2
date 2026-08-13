import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import { MarcoBridgeScreen } from 'views/MarcoBridge'

/**
 * Public MARCO Bridge surface.
 * Availability is owned by Portal `/api/public/bridge/route-state`.
 * Legacy ETH/Arbitrum BridgeForm is not used here (no second MARCO executor).
 */
const BridgePage = () => <MarcoBridgeScreen />

BridgePage.chains = SUPPORT_MULTI_CHAINS

export default BridgePage
