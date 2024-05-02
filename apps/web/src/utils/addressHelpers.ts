import { ChainId } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import addresses from 'config/constants/contracts'
import { VaultKey } from 'state/types'

export const getAddress = (address: Pool.Address, chainId?: number): string => {
  return address[chainId] ? address[chainId] : address[ChainId.BSC]
}
export const getMarcoAddress = (chainId?: number) => {
  return getAddress(addresses.marco, chainId)
}
export const getMasterChefAddress = (chainId?: number) => {
  return getAddress(addresses.masterChef, chainId)
}
export const getMulticallAddress = (chainId?: number) => {
  return getAddress(addresses.multiCall, chainId)
}
export const getIfov3Address = () => {
  return getAddress(addresses.ifov3)
}
export const getZapAddress = (chainId?: number) => {
  return getAddress(addresses.zap, chainId)
}

export const getBridgeAddress = (chainId?: number) => {
  return getAddress(addresses.bridge, chainId)
}

export const getCakeVaultAddress = (chainId?: number) => {
  return getAddress(addresses.cakeVault, chainId)
}

export const getCakeFlexibleSideVaultAddress = (chainId?: number) => {
  return getAddress(addresses.cakeFlexibleSideVault, chainId)
}

export const getICakeAddress = () => {
  return getAddress(addresses.iCake)
}

export const getVaultPoolAddress = (vaultKey: VaultKey) => {
  if (!vaultKey) {
    return null
  }
  return getAddress(addresses[vaultKey])
}

export const getDNFTcraneAddress = () => {
  return getAddress(addresses.dragonNftcrane)
}
export const getDNFTAddress = () => {
  return getAddress(addresses.Nft)
}
export const getNftMarketAddress = () => {
  return getAddress(addresses.nftmarket)
}
