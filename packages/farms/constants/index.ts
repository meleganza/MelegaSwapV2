import { ChainId } from '@pancakeswap/sdk'
import { isStableFarm, SerializedFarmConfig } from '@pancakeswap/farms'

let logged = false

export const getFarmConfig = async (chainId?: ChainId) => {
  // Wallet state is intentionally undefined during SSR and the first client render.
  // Do not ask webpack for `/undefined.ts` while the connector is still hydrating.
  if (!chainId) return []
  try {
    return (await import(`/${chainId}.ts`)).default.filter(
      (f: SerializedFarmConfig) => f.pid !== null,
    ) as SerializedFarmConfig[]
  } catch (error) {
    if (!logged) {
      console.error('Cannot get farm config', error, chainId)
      logged = true
    }
    return []
  }
}

export const getStableConfig = async (chainId?: ChainId) => {
  if (!chainId) return []
  try {
    const farms = (await import(`/${chainId}.ts`)).default as SerializedFarmConfig[]

    return farms.filter(isStableFarm)
  } catch (error) {
    if (!logged) {
      console.error('Cannot get stable farm config', error, chainId)
      logged = true
    }
    return []
  }
}
