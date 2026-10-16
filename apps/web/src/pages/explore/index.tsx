import { useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * /explore was a 404. Alias of the Projects discovery surface.
 * next.config also redirects this path so deep links resolve before render.
 */
const ExploreAliasPage = () => {
  const router = useRouter()
  useEffect(() => {
    const query = router.asPath.split('?')[1]
    void router.replace(query ? `/projects?${query}` : '/projects')
  }, [router])
  return null
}

ExploreAliasPage.chains = []

export default ExploreAliasPage
