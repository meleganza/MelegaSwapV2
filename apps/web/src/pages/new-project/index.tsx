import { useRouter } from 'next/router'
import { CHAIN_IDS } from 'utils/wagmi'
import NewProjectActivation from 'views/EconomicActivation/NewProjectActivation'

const NewProjectPage = () => {
  const router = useRouter()
  const reference =
    typeof router.query.reference === 'string' ? router.query.reference : undefined

  return <NewProjectActivation projectSlug={reference} />
}

NewProjectPage.chains = CHAIN_IDS
NewProjectPage.pure = true
NewProjectPage.isShowScrollToTopButton = false

export default NewProjectPage
