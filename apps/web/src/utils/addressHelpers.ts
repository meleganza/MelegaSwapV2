/**
 * Safe address lookup — never falls back to BNB (56) for another chain.
 * Missing map entry ⇒ empty string (caller must disable the capability).
 */
import { Pool } from '@pancakeswap/uikit'
import addresses from 'config/constants/contracts'
import { VaultKey } from 'state/types'

export const getAddress = (address: Pool.Address, chainId?: number): string => {
  if (chainId == null) return ''
  const value = address[chainId]
  if (!value) return ''
  return value
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
  return getAddress(addresses.ifov3, 56)
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
  return getAddress(addresses.iCake, 56)
}

export const getVaultPoolAddress = (vaultKey: VaultKey, chainId?: number) => {
  if (!vaultKey) {
    return null
  }
  return getAddress(addresses[vaultKey], chainId)
}

export const getDNFTcraneAddress = () => {
  return getAddress(addresses.dragonNftcrane, 56)
}
export const getDNFTAddress = () => {
  return getAddress(addresses.Nft, 56)
}
export const getNftMarketAddress = () => {
  return getAddress(addresses.nftmarket, 56)
}
