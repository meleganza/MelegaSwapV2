import { SUPPORT_FARMS } from 'config/constants/supportChains'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import FarmsStudioScreen from 'views/FarmsStudio/FarmsStudioScreen'

const FarmsPage: NextPageWithLayout = () => <FarmsStudioScreen />

FarmsPage.chains = SUPPORT_FARMS
FarmsPage.disablePageSuspense = true

export default FarmsPage
