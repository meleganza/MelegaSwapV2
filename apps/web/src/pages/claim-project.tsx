import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'
import { CLAIM_PROJECT_INTENT } from 'views/ListStudio/claimProjectIntent'

/**
 * Founder URL alias: /claim-project?contract=0x… stays inside the List workspace.
 * Never mounts a second claim runtime.
 */
const ClaimProjectAliasPage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    void router.replace({ pathname: '/list', query: { ...router.query, intent: CLAIM_PROJECT_INTENT } })
  }, [router])

  return (
    <main data-testid="claim-project-alias" style={{ minHeight: 120, color: '#a8a8a8', padding: 24 }}>
      Opening claim…
    </main>
  )
}

ClaimProjectAliasPage.chains = []

export default ClaimProjectAliasPage
