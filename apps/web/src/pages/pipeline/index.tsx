import { CHAIN_IDS } from 'utils/wagmi'
import LabsEconomicPipelineConsole from 'views/LabsEconomicPipeline/LabsEconomicPipelineConsole'

const PipelinePage = () => <LabsEconomicPipelineConsole />

PipelinePage.chains = CHAIN_IDS
PipelinePage.pure = true
PipelinePage.isShowScrollToTopButton = false

export default PipelinePage
