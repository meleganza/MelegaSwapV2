import { describe, expect, it } from 'vitest'
import { CANONICAL_MARCO_NAME, CANONICAL_MARCO_SYMBOL } from '../marcoIdentityGuard'
import {
  BNB_CONSUMER_MARCO,
  BNB_OFT_ADAPTER,
  BSC_LZ_EID,
  ENFORCED_LZ_RECEIVE_200K,
  ENFORCED_LZ_RECEIVE_GAS,
  EXPECTED_POLYGON_TO_BNB_PEER,
  LZ_GOVERNANCE_SAFE,
  LZ_GOVERNANCE_SAFE_OWNERS,
  LZ_GOVERNANCE_SAFE_THRESHOLD,
  POLYGON_DEPLOY_OPERATOR_STEPS,
  POLYGON_ENDPOINT_V2,
  POLYGON_EXECUTOR,
  POLYGON_LZ_EID,
  POLYGON_NATIVE_CURRENCY,
  POLYGON_OFT_ADDRESS,
  POLYGON_OFT_CONSTRUCTOR,
  POLYGON_POS_CHAIN_ID,
  POLYGON_REQUIRED_DVNS_SORTED,
  POLYGON_WALLET_NETWORK,
  STALE_POLYGON_MARCO_ERC20,
  ULN_CONFIRMATIONS,
  ULN_REQUIRED_DVN_COUNT,
  assertLzGovernanceSafe,
  assertNotStalePolygonMarco,
  assertPolygonOftReadyForPeer,
  isStalePolygonMarco,
  peerBytes32,
} from '../polygonMainnetPrep'

describe('Polygon MAINNET OFT prep', () => {
  it('certifies official Polygon PoS + LayerZero V2 identities', () => {
    expect(POLYGON_POS_CHAIN_ID).toBe(137)
    expect(POLYGON_LZ_EID).toBe(30109)
    expect(BSC_LZ_EID).toBe(30102)
    expect(POLYGON_ENDPOINT_V2.toLowerCase()).toBe('0x1a44076050125825900e736c501f859c50fe728c')
    expect(POLYGON_EXECUTOR.toLowerCase()).toBe('0xcd3f213ad101472e1713c72b1697e727c803885b')
    expect(BNB_CONSUMER_MARCO).toBe('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    expect(BNB_OFT_ADAPTER).toBe('0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E')
  })

  it('uses POL as the wallet native token', () => {
    expect(POLYGON_NATIVE_CURRENCY).toEqual({ name: 'POL', symbol: 'POL', decimals: 18 })
    expect(POLYGON_WALLET_NETWORK.nativeCurrency.symbol).toBe('POL')
    expect(POLYGON_WALLET_NETWORK.chainId).toBe('0x89')
  })

  it('locks constructor identity to MELEGA/MARCO/18/shared6/supply0 and the existing Safe', () => {
    expect(POLYGON_OFT_CONSTRUCTOR).toMatchObject({
      name: CANONICAL_MARCO_NAME,
      symbol: CANONICAL_MARCO_SYMBOL,
      decimals: 18,
      sharedDecimals: 6,
      endpoint: POLYGON_ENDPOINT_V2,
      ownerOrDelegate: LZ_GOVERNANCE_SAFE,
      initialSupply: 0,
    })
    expect(POLYGON_OFT_CONSTRUCTOR.name).not.toBe('MARCO')
    expect(POLYGON_OFT_ADDRESS).toBeNull()
  })

  it('rejects the stale 10M Polygon ERC20 as an OFT / peer', () => {
    expect(isStalePolygonMarco(STALE_POLYGON_MARCO_ERC20)).toBe(true)
    expect(() => assertNotStalePolygonMarco(STALE_POLYGON_MARCO_ERC20)).toThrow('not an OFT')
    expect(() =>
      assertPolygonOftReadyForPeer({
        oftAddress: STALE_POLYGON_MARCO_ERC20,
        name: 'MELEGA',
        symbol: 'MARCO',
        decimals: 18,
        sharedDecimals: 6,
        totalSupply: 0,
        owner: LZ_GOVERNANCE_SAFE,
        endpoint: POLYGON_ENDPOINT_V2,
      }),
    ).toThrow('not an OFT')
  })

  it('rejects invented admins and MARCO/MARCO OFTs', () => {
    expect(() => assertLzGovernanceSafe('0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0')).toThrow(
      'existing LZ Safe',
    )
    expect(LZ_GOVERNANCE_SAFE_THRESHOLD).toBe(2)
    expect(LZ_GOVERNANCE_SAFE_OWNERS).toHaveLength(3)
    expect(() =>
      assertPolygonOftReadyForPeer({
        oftAddress: '0x1111111111111111111111111111111111111111',
        name: 'MARCO',
        symbol: 'MARCO',
        decimals: 18,
        sharedDecimals: 6,
        totalSupply: 0,
        owner: LZ_GOVERNANCE_SAFE,
        endpoint: POLYGON_ENDPOINT_V2,
      }),
    ).toThrow('MARCO/MARCO is forbidden')
  })

  it('encodes BNB adapter peer bytes32 and copies the live 200k lzReceive option', () => {
    expect(peerBytes32(BNB_OFT_ADAPTER)).toBe(EXPECTED_POLYGON_TO_BNB_PEER)
    expect(EXPECTED_POLYGON_TO_BNB_PEER).toBe(
      '0x000000000000000000000000c92b49ddf9312cbfc01ad397963df915c7a2399e',
    )
    expect(ENFORCED_LZ_RECEIVE_GAS).toBe(200_000)
    expect(ENFORCED_LZ_RECEIVE_200K).toBe('0x00030100110100000000000000000000000000030d40')
    expect(ULN_CONFIRMATIONS).toBe(20)
    expect(ULN_REQUIRED_DVN_COUNT).toBe(2)
    expect(POLYGON_REQUIRED_DVNS_SORTED[0] < POLYGON_REQUIRED_DVNS_SORTED[1]).toBe(true)
  })

  it('does not activate a public DEX route in this prep module', () => {
    expect(POLYGON_DEPLOY_OPERATOR_STEPS.some((step) => /Public DEX activation only after/i.test(step))).toBe(true)
    expect(POLYGON_OFT_ADDRESS).toBeNull()
  })
})
