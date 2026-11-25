import { CHAIN_IDS } from 'utils/wagmi'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import ProjectsStudioScreen from 'views/ProjectsStudio/ProjectsStudioScreen'

const ProjectsPage: NextPageWithLayout = () => <ProjectsStudioScreen />

ProjectsPage.chains = CHAIN_IDS
ProjectsPage.disablePageSuspense = true

export default ProjectsPage
