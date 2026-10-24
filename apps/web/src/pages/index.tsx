import RadicalHomeScreen from 'views/HomeTrade/RadicalHomeScreen'
import { CHAIN_IDS } from 'utils/wagmi'

function IndexPage() {
  return <RadicalHomeScreen />
}

IndexPage.chains = CHAIN_IDS
IndexPage.disablePageSuspense = true

export default IndexPage
