import dynamic from 'next/dynamic'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import ClientOnlyMount from 'components/ClientOnlyMount'

// Browser-only screen (checkout/wallet). Loaded lazily and mounted after hydration — see ClientOnlyMount.
const ListScreen = dynamic(() => import('views/ListStudio/ListStudioScreen'))

const ListPage: NextPageWithLayout = () => (
  <ClientOnlyMount>
    <ListScreen />
  </ClientOnlyMount>
)

ListPage.chains = []
ListPage.disablePageSuspense = true

export default ListPage
