import { CHAIN_IDS } from 'utils/wagmi'
import SurfaceMapConsole from 'views/SurfaceMap/SurfaceMapConsole'

const MapPage = () => <SurfaceMapConsole />

MapPage.chains = CHAIN_IDS
MapPage.pure = true
MapPage.isShowScrollToTopButton = false

export default MapPage
