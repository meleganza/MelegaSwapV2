import HomeTradeScreen from 'views/HomeTrade/HomeTradeScreen'
import { CHAIN_IDS } from 'utils/wagmi'

function IndexPage() {
  return <HomeTradeScreen />
}

IndexPage.chains = CHAIN_IDS
IndexPage.hideMenu = true

export default IndexPage
