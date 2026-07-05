import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { CHAIN_IDS } from 'utils/wagmi'

const LaunchPage = () => {
  const router = useRouter()

  useEffect(() => {
    const query = new URLSearchParams(
      Object.entries(router.query).flatMap(([key, value]) => {
        if (value === undefined) return []
        return Array.isArray(value) ? value.map((v) => [key, v]) : [[key, String(value)]]
      }),
    ).toString()
    router.replace(query ? `/build-studio?${query}#build-import` : '/build-studio#build-import')
  }, [router])

  return null
}

LaunchPage.chains = CHAIN_IDS
LaunchPage.pure = true
LaunchPage.isShowScrollToTopButton = false

export default LaunchPage
