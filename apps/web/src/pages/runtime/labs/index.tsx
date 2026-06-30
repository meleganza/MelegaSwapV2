import { CHAIN_IDS } from 'utils/wagmi'
import LabsRuntimeConsole from 'views/LabsRuntime/LabsRuntimeConsole'

const LabsRuntimePage = () => <LabsRuntimeConsole />

LabsRuntimePage.chains = CHAIN_IDS
LabsRuntimePage.pure = true
LabsRuntimePage.isShowScrollToTopButton = false

export default LabsRuntimePage
