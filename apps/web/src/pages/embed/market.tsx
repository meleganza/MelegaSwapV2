import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'
import { FarmsRuntimeProvider } from 'views/FarmsStudio/farmsRuntime/FarmsRuntimeContext'
import FarmsActionHost from 'views/FarmsStudio/farmsRuntime/FarmsActionHost'
import { useExploreFarms } from 'views/FarmsStudio/modules/useFarmsExploreFarms'
import { FarmsExploreFarmCard } from 'views/FarmsStudio/modules/FarmsExploreFarmCard'
import { PoolsRuntimeProvider } from 'views/PoolsStudio/poolsRuntime/PoolsRuntimeContext'
import PoolsActionHost from 'views/PoolsStudio/poolsRuntime/PoolsActionHost'
import { usePoolsExplorePools } from 'views/PoolsStudio/modules/usePoolsExplorePools'
import { PoolsExplorePoolCard } from 'views/PoolsStudio/modules/PoolsExplorePoolCard'

const Canvas = styled.main`
  min-height: 100vh;
  padding: 14px;
  display: grid;
  place-items: center;
  background: #070808;
  color: #f4f4f4;
  font-family: Inter, Arial, sans-serif;
  box-sizing: border-box;
  overflow: hidden;
`

const Shell = styled.section`
  width: min(100%, 520px);
  box-sizing: border-box;
  min-width: 0;
`

const Brand = styled(Link)`
  width: fit-content;
  margin: 0 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #f4f4f4;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;

  img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
  span {
    color: #f4c430;
  }
`

const HonestState = styled.div`
  min-height: 250px;
  padding: 22px;
  display: grid;
  place-items: center;
  text-align: center;
  border: 1px solid rgba(221, 185, 47, 0.28);
  border-radius: 16px;
  background: #111313;
  color: #aaa;
`

function normalized(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function EmbeddedFarm({ target }: { target: string }) {
  const vm = useExploreFarms()
  const selected = useMemo(() => {
    const needle = normalized(target)
    if (!needle) return vm.registry[0]
    return vm.registry.find((farm) => {
      const identities = [
        farm.farmId,
        farm.pid != null ? String(farm.pid) : '',
        farm.title,
        farm.lpToken.address,
        farm.lpToken.symbol,
        `${farm.token0.symbol}/${farm.token1.symbol}`,
        `${farm.token1.symbol}/${farm.token0.symbol}`,
      ]
      return identities.some((identity) => {
        const candidate = normalized(identity)
        return Boolean(candidate) && (candidate.includes(needle) || needle.includes(candidate))
      })
    })
  }, [target, vm.registry])
  return selected ? (
    <FarmsExploreFarmCard farm={selected} />
  ) : (
    <HonestState>Farm not found in the live Melega DEX registry.</HonestState>
  )
}

function EmbeddedPool({ target }: { target: string }) {
  const vm = usePoolsExplorePools()
  const selected = useMemo(() => {
    const needle = normalized(target)
    if (!needle) return vm.pools[0]
    return vm.pools.find((pool) => {
      const identities = [
        pool.poolId,
        pool.title,
        pool.contractAddress,
        pool.stakeToken.address,
        pool.rewardToken.address,
        `${pool.stakeToken.symbol}/${pool.rewardToken.symbol}`,
        `${pool.stakeToken.symbol}->${pool.rewardToken.symbol}`,
      ]
      return identities.some((identity) => {
        const candidate = normalized(identity)
        return Boolean(candidate) && (candidate.includes(needle) || needle.includes(candidate))
      })
    })
  }, [target, vm.pools])
  return selected ? (
    <PoolsExplorePoolCard pool={selected} />
  ) : (
    <HonestState>Pool not found in the live Melega DEX registry.</HonestState>
  )
}

const MarketEmbed = () => {
  const router = useRouter()
  const kind = typeof router.query.kind === 'string' ? router.query.kind.toLowerCase() : 'liquidity'
  const target = typeof router.query.target === 'string' ? router.query.target : ''

  return (
    <Canvas data-melega-widget={`market-${kind}`}>
      <Shell>
        <Brand href="https://www.melega.finance" target="_blank" rel="noopener noreferrer" aria-label="Open Melega DEX">
          <img src="/images/melega.png" alt="" /> Melega<span>DEX</span>
        </Brand>
        {kind === 'farm' ? (
          <FarmsRuntimeProvider>
            <FarmsActionHost />
            <EmbeddedFarm target={target} />
          </FarmsRuntimeProvider>
        ) : kind === 'pool' ? (
          <PoolsRuntimeProvider>
            <PoolsActionHost />
            <EmbeddedPool target={target} />
          </PoolsRuntimeProvider>
        ) : (
          <HonestState>
            <div>
              <strong style={{ display: 'block', color: '#fff', marginBottom: 8 }}>
                Liquidity · {target || 'Select pair'}
              </strong>
              <Link
                href={target ? `/liquidity?pair=${encodeURIComponent(target)}` : '/liquidity'}
                target="_blank"
                style={{ color: '#f4c430' }}
              >
                Add or remove liquidity on Melega DEX
              </Link>
            </div>
          </HonestState>
        )}
      </Shell>
    </Canvas>
  )
}

MarketEmbed.hideMenu = true
MarketEmbed.chains = CHAIN_IDS

export default MarketEmbed
