import { useEffect, useState } from 'react'

export function useTrendingDisplayLimit(): number {
  const [limit, setLimit] = useState(24)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      // Display top of shared full-universe ranking (producer ranks ~40 from ~266).
      if (w >= 1024) setLimit(24)
      else if (w >= 768) setLimit(18)
      else setLimit(14)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return limit
}
