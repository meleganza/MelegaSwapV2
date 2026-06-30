import { CHAIN_IDS } from 'utils/wagmi'
import Projects from 'views/Projects'

const ProjectsPage = () => <Projects />

ProjectsPage.chains = CHAIN_IDS

export default ProjectsPage
