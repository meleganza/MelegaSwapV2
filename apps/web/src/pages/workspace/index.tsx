import { CHAIN_IDS } from 'utils/wagmi'
import UserWorkspaceConsole from 'views/UserWorkspace/UserWorkspaceConsole'

const WorkspacePage = () => <UserWorkspaceConsole />

WorkspacePage.chains = CHAIN_IDS
WorkspacePage.pure = true
WorkspacePage.isShowScrollToTopButton = false

export default WorkspacePage
