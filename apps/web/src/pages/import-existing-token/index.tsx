import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { CHAIN_IDS } from 'utils/wagmi'

/** Legacy route — constitutional entry is Build Studio. */
const ImportExistingTokenPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const contract = router.query.contract
    const target =
      typeof contract === 'string' && contract.startsWith('0x')
        ? `/build-studio?contract=${encodeURIComponent(contract)}#build-import`
        : '/build-studio#build-import'
    router.replace(target)
  }, [router, router.isReady, router.query.contract])

  return null
}

ImportExistingTokenPage.chains = CHAIN_IDS

export default ImportExistingTokenPage
