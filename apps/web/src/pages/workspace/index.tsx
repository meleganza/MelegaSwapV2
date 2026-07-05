import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { CHAIN_IDS } from 'utils/wagmi'

/** Legacy — canonical cockpit is Command Center. */
const WorkspacePage = () => {
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady) return
    router.replace('/command-center')
  }, [router, router.isReady])
  return null
}

WorkspacePage.chains = CHAIN_IDS
WorkspacePage.pure = true
WorkspacePage.isShowScrollToTopButton = false

export default WorkspacePage
