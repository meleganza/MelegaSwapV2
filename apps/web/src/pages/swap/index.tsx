import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import TradeTerminalScreen from 'views/Trade/TradeTerminalScreen'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'

/** Legacy /swap route — renders the Trade Terminal (R003). */
const SwapPage: NextPageWithLayout = () => (
  <SwapFeaturesProvider>
    <TradeTerminalScreen />
  </SwapFeaturesProvider>
)

SwapPage.chains = SUPPORT_MULTI_CHAINS
SwapPage.disablePageSuspense = true

export default SwapPage
