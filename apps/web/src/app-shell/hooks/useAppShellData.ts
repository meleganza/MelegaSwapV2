import { useMemo } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'

export const useAppShellData = () => {
  const marcoPrice = usePriceCakeBusd()

  const marcoPriceLabel = useMemo(() => {
    if (!marcoPrice) return undefined
    try {
      return `$${marcoPrice.toFixed(4)}`
    } catch {
      return undefined
    }
  }, [marcoPrice])

  return { marcoPriceLabel }
}

export default useAppShellData
