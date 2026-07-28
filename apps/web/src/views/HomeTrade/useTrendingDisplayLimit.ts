import { useEffect, useState } from 'react'

export function useTrendingDisplayLimit(): number {
  const [limit, setLimit] = useState(12)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      // Prefer showing enough real assets for a live ticker (target ≥10 when available).
      if (w >= 1024) setLimit(12)
      else if (w >= 768) setLimit(10)
      else setLimit(10)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return limit
}
