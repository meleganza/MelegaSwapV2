import type { Signer } from '@ethersproject/abstract-signer'
import type { Provider } from '@ethersproject/providers'
import { provider } from 'utils/wagmi'
import { Contract } from '@ethersproject/contracts'
import poolsConfig from 'config/constants/pools'
import { PoolCategory } from 'config/constants/types'
import { CAKE } from '@pancakeswap/tokens'

// Addresses
import {
  getAddress,
  getMasterChefAddress,
  getMulticallAddress,
  getCakeFlexibleSideVaultAddress,
  getBridgeAddress,
  getCakeVaultAddress,
  getICakeAddress,
} from 'utils/addressHelpers'

// ABI
import bep20Abi from 'config/abi/erc20.json'
import lpTokenAbi from 'config/abi/lpToken.json'
import cakeAbi from 'config/abi/cake.json'
import DNFTcraneAbiAbi from 'config/abi/DNFTcraneAbi.json'
import NftStakingAbi from 'config/abi/NFTStaking.json'
import NFTAbi from 'config/abi/Nft.json'
import NftMarketAbi from 'config/abi/nftMarket.json'
import masterChef from 'config/abi/masterchef.json'
import sousChef from 'config/abi/sousChef.json'
import iCakeAbi from 'config/abi/iCake.json'
import bridge from 'config/abi/bridge.json'
import cakeFlexibleSideVaultV2Abi from 'config/abi/cakeFlexibleSideVaultV2.json'
import multisender from 'config/abi/multisender.json'
import ifoV3Abi from 'config/abi/ifoV3.json'
import cakeVaultAbi from 'config/abi/cakeVault.json'
import sousChefBnb from 'config/abi/sousChefBnb.json'
import cakeVaultV2Abi from 'config/abi/cakeVaultV2.json'
import chainlinkOracleAbi from 'config/abi/chainlinkOracle.json'
import MultiCallAbi from 'config/abi/Multicall.json'

// Types
import type {
  ChainlinkOracle,
  Erc20,
  Cake,
  Masterchef,
  Bridge,
  LpToken,
  Multicall,
  CakeVaultV2,
  ICake,
  SousChef,
  CakeFlexibleSideVaultV2,
  DNFTcraneAbi,
  Multisender,
  Nft,
  NftMarket,
  NFTStaking,
} from 'config/abi/types'
import { ChainId } from '@pancakeswap/sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'

export const getContract = ({
  abi,
  address,
  chainId,
  signer,
}: {
  abi: any
  address: string
  chainId?: ChainId
  signer?: Signer | Provider
}) => {
  const signerOrProvider = signer ?? provider({ chainId })
  return new Contract(address, abi, signerOrProvider)
}

export const getDNFTContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: NFTAbi, address, signer }) as Nft
}

export const getCakeVaultContract = (signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: cakeVaultAbi, address: getCakeVaultAddress(chainId), signer })
}

export const getNftMarketContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: NftMarketAbi, address, signer }) as NftMarket
}

export const getNftStakingContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: NftStakingAbi, address, signer }) as NFTStaking
}

export const getDNFTcraneContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: DNFTcraneAbiAbi, address, signer }) as DNFTcraneAbi
}

export const getBep20Contract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: bep20Abi, address, signer, chainId }) as Erc20
}

export const getIfoV3Contract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: ifoV3Abi, address, signer })
}

export const getLpContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: lpTokenAbi, address, signer, chainId }) as LpToken
}

export const getCakeContract = (signer?: Signer | Provider, chainId?: number) => {
  return getContract({
    abi: cakeAbi,
    address: chainId ? CAKE[chainId].address : CAKE[ChainId.BSC].address,
    chainId,
    signer,
  }) as Cake
}
export const getMasterchefContract = (signer?: Signer | Provider, chainId?: number) => {
  // return getContract({ abi: masterChef, address: getMasterChefAddress(chainId), signer }) as Masterchef
  return getContract({ abi: masterChef, address: getMasterChefAddress(chainId), signer }) as Masterchef
}
export const getChainlinkOracleContract = (address: string, signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: chainlinkOracleAbi, address, signer, chainId }) as ChainlinkOracle
}
export const getMulticallContract = (chainId: ChainId) => {
  return getContract({ abi: MultiCallAbi, address: getMulticallAddress(chainId), chainId }) as Multicall
}

export const getBridgeContract = (signer?: Signer | Provider, chainId?: number) => {
  return getContract({ abi: bridge, address: getBridgeAddress(chainId), signer }) as Bridge
}

export const getCakeVaultV2Contract = (signer?: Signer | Provider) => {
  return getContract({ abi: cakeVaultV2Abi, address: getCakeVaultAddress(), signer }) as CakeVaultV2
}

export const getCakeFlexibleSideVaultV2Contract = (signer?: Signer | Provider) => {
  return getContract({
    abi: cakeFlexibleSideVaultV2Abi,
    address: getCakeFlexibleSideVaultAddress(),
    signer,
  }) as CakeFlexibleSideVaultV2
}

export const getIfoCreditAddressContract = (signer?: Signer | Provider) => {
  return getContract({ abi: iCakeAbi, address: getICakeAddress(), signer }) as ICake
}

export const getSouschefContract = (id: number, signer?: Signer | Provider) => {
  const config = poolsConfig.find((pool) => pool.sousId === id)
  const abi = config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  return getContract({ abi, address: getAddress(config.contractAddress), signer }) as SousChef
}

