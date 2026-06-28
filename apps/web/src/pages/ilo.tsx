import { SUPPORT_ILO } from 'config/constants/supportChains'
import LegacyIloRetirement from 'views/LegacyIloRetirement/LegacyIloRetirement'

const IloPage = () => <LegacyIloRetirement />

IloPage.chains = SUPPORT_ILO
IloPage.pure = true
IloPage.isShowScrollToTopButton = false

export default IloPage
