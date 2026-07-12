import { useEffect, useState } from 'react'

export function useTrendingDisplayLimit(): number {
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 1024) setLimit(10)
      else if (w >= 768) setLimit(8)
      else setLimit(5)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return limit
}
