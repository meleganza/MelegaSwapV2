import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import TradeTerminalScreen from 'views/Trade/TradeTerminalScreen'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'

const TradePage = () => (
  <SwapFeaturesProvider>
    <TradeTerminalScreen />
  </SwapFeaturesProvider>
)

TradePage.chains = SUPPORT_MULTI_CHAINS

export default TradePage
