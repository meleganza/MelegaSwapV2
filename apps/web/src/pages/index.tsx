import HomeTradeScreen from 'views/HomeTrade/HomeTradeScreen'
import { CHAIN_IDS } from 'utils/wagmi'

function IndexPage() {
  return <HomeTradeScreen />
}

IndexPage.chains = CHAIN_IDS
// Home joins live Top Movers and yield data immediately after the first client
// commit. Hydrating it inside a dehydrated Suspense boundary can force React to
// discard the server tree and render the full 800KB route twice.
IndexPage.disablePageSuspense = true

export default IndexPage
