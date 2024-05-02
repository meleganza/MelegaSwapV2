import {
  Cake,
  CakeFlexibleSideVaultV2,
  CakeVaultV2,
  Erc20,
  Erc20Bytes32,
  Multicall,
  Multisender,
  Weth,
  Zap,
} from 'config/abi/types'
import zapAbi from 'config/abi/zap.json'
import { useProviderOrSigner } from 'hooks/useProviderOrSigner'
import { useMemo } from 'react'
import { getIfov3Address, getMulticallAddress, getZapAddress } from 'utils/addressHelpers'
import {
  getBep20Contract,
  getCakeContract,
  getChainlinkOracleContract,
  getIfoV3Contract,
  getMasterchefContract,
  getSouschefContract,
  getBridgeContract,
  getCakeVaultContract,
  getCakeFlexibleSideVaultV2Contract,
  getDNFTContract,
  getNftMarketContract,
  getNftStakingContract,
  getDNFTcraneContract,
} from 'utils/contractHelpers'
import { useSigner } from 'wagmi'

// Imports below migrated from Exchange useContract.ts
import { Contract } from '@ethersproject/contracts'
import { ChainId, WNATIVE } from '@pancakeswap/sdk'
import { ERC20_BYTES32_ABI } from 'config/abi/erc20'
import ERC20_ABI from 'config/abi/erc20.json'
import IPancakePairABI from 'config/abi/IPancakePair.json'
import multiCallAbi from 'config/abi/Multicall.json'
import multisenderAbi from 'config/abi/multisender.json'
import WETH_ABI from 'config/abi/weth.json'
import { getContract } from 'utils'
import { VaultKey } from 'state/types'
import { IPancakePair } from 'config/abi/types/IPancakePair'
import { useActiveChainId } from './useActiveChainId'

export const useDNFTContract = (address: string, withSignerIfPossible = true) => {
  const { chainId } = useActiveChainId()
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getDNFTContract(address, providerOrSigner, chainId), [address, providerOrSigner, chainId])
}

export const useCakeVaultContract = (withSignerIfPossible = true) => {
  const { chainId } = useActiveChainId()
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getCakeVaultContract(providerOrSigner, chainId), [providerOrSigner, chainId])
}

export const useNftMarketContract = (address: string, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getNftMarketContract(address, providerOrSigner), [address, providerOrSigner])
}

export const useERC20 = (address: string, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getBep20Contract(address, providerOrSigner), [address, providerOrSigner])
}

export const useCake = (): { reader: Cake; signer: Cake } => {
  const providerOrSigner = useProviderOrSigner(true, true)
  return useMemo(
    () => ({
      reader: getCakeContract(null),
      signer: getCakeContract(providerOrSigner),
    }),
    [providerOrSigner],
  )
}

export const useMasterchef = (withSignerIfPossible = true) => {
  const { chainId } = useActiveChainId()
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getMasterchefContract(providerOrSigner, chainId), [providerOrSigner, chainId])
}

export const useSousChef = (id) => {
  const { data: signer } = useSigner()
  return useMemo(() => getSouschefContract(id, signer), [id, signer])
}

export const useIfoV3Contract = (address, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible, true)
  return useMemo(() => getIfoV3Contract(address, providerOrSigner), [providerOrSigner, address])
}

export const useChainlinkOracleContract = (address, withSignerIfPossible = true) => {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible, true)
  return useMemo(() => getChainlinkOracleContract(address, providerOrSigner), [providerOrSigner, address])
}

// Code below migrated from Exchange useContract.ts

// returns null on errors
export function useContract<T extends Contract = Contract>(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
): T | null {
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)

  const canReturnContract = useMemo(() => address && ABI && providerOrSigner, [address, ABI, providerOrSigner])

  return useMemo(() => {
    if (!canReturnContract) return null
    try {
      return getContract(address, ABI, providerOrSigner)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, providerOrSigner, canReturnContract]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWNativeContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveChainId()
  return useContract<Weth>(chainId ? WNATIVE[chainId]?.address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract<Erc20Bytes32>(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): IPancakePair | null {
  return useContract(pairAddress, IPancakePairABI, withSignerIfPossible)
}

export function useMulticallContract() {
  const { chainId } = useActiveChainId()
  return useContract<Multicall>(getMulticallAddress(chainId), multiCallAbi, false)
}

export function useZapContract(withSignerIfPossible = true) {
  const { chainId } = useActiveChainId()
  return useContract<Zap>(getZapAddress(chainId), zapAbi, withSignerIfPossible)
}

export const useBridge = (withSignerIfPossible = true) => {
  const { chainId } = useActiveChainId()
  const providerOrSigner = useProviderOrSigner(withSignerIfPossible)
  return useMemo(() => getBridgeContract(providerOrSigner, chainId), [providerOrSigner, chainId])
}
