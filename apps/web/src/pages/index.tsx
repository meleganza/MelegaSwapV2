import TradeTerminalScreen from 'views/Trade/TradeTerminalScreen'
import { CHAIN_IDS } from 'utils/wagmi'

function IndexPage() {
  return <TradeTerminalScreen />
}

IndexPage.chains = CHAIN_IDS
IndexPage.disablePageSuspense = true

export default IndexPage
