import { SUPPORT_FARMS } from 'config/constants/supportChains'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import PoolsStudioScreen from 'views/PoolsStudio/PoolsStudioScreen'

const PoolsPage: NextPageWithLayout = () => <PoolsStudioScreen />

PoolsPage.chains = SUPPORT_FARMS
PoolsPage.disablePageSuspense = true

export default PoolsPage
