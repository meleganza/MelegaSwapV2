import { useEffect, useState } from 'react'

export function useTrendingDisplayLimit(): number {
  const [limit, setLimit] = useState(24)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      // Display top of shared full-universe ranking (producer ranks ~40 from ~266).
      const next = w >= 1024 ? 24 : w >= 768 ? 18 : 14
      setLimit((prev) => (prev === next ? prev : next))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return limit
}
