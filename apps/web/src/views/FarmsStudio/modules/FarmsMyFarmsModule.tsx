import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { useFarmsWalletPositions } from './useFarmsWalletPositions'
import { FarmsMyFarmCard } from './FarmsMyFarmCard'

const pulse = keyframes`0%,100%{opacity:.45}50%{opacity:.8}`
const Row = styled.section`
  width: 100%;
  max-width: ${farmsMyFarms.contentMax};
  margin-top: -16px;
  display: grid;
  grid-template-columns: minmax(0, 2.207547fr) minmax(0, 1fr);
  column-gap: ${farmsMyFarms.columnGap};
  font-family: ${typography.fontFamily.body};
  min-width: 0;
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    grid-template-columns: 1fr;
    row-gap: 16px;
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`
const Surface = styled.div`
  width: 100%;
  max-width: ${farmsMyFarms.leftW};
  height: ${farmsMyFarms.moduleH};
  border-radius: ${farmsMyFarms.moduleRadius};
  border: ${farmsMyFarms.moduleBorder};
  background: ${farmsMyFarms.moduleBg};
  box-shadow: ${farmsMyFarms.moduleShadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${farmsMyFarms.moduleH};
  }
`
const Header = styled.header`
  height: ${farmsMyFarms.headerH};
  padding: 0 ${farmsMyFarms.headerPadX};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  @media (max-width: ${farmsMyFarms.mobileBreak}) {
    height: ${farmsMyFarms.mobileHeaderH};
  }
`
const TitleRow = styled.div`display:flex;align-items:center;gap:10px;min-width:0`
const Title = styled.h2`
  margin: 0;
  color: ${farmsMyFarms.titleColor};
  font-size: ${farmsMyFarms.titleSize};
  line-height: ${farmsMyFarms.titleLine};
  font-weight: ${farmsMyFarms.titleWeight};
`
const Badge = styled.span`
  min-width: ${farmsMyFarms.countMinW};
  height: ${farmsMyFarms.countH};
  border-radius: ${farmsMyFarms.countRadius};
  background: ${farmsMyFarms.countBg};
  color: ${farmsMyFarms.countColor};
  font-size: ${farmsMyFarms.countSize};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
`
const ViewAll = styled.button`
  width: ${farmsMyFarms.viewAllW};
  height: ${farmsMyFarms.viewAllH};
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  &:focus-visible {
    outline: ${farmsMyFarms.focusRing};
    outline-offset: ${farmsMyFarms.focusOffset};
  }
`
const Body = styled.div`flex:1;padding:0 ${farmsMyFarms.contentPadX} 18px;display:flex;flex-direction:column;min-width:0`
const Grid = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  max-width: ${farmsMyFarms.contentW};
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: ${farmsMyFarms.cardGap};
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${farmsMyFarms.cardGap};
  }
  @media (max-width: ${farmsMyFarms.mobileBreak}) {
    grid-template-columns: 1fr;
    gap: ${farmsMyFarms.mobileCardGap};
  }
`
const Skeleton = styled.div`
  height: ${farmsMyFarms.cardH};
  border-radius: ${farmsMyFarms.cardRadius};
  border: ${farmsMyFarms.cardBorder};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`
const Center = styled.div`
  flex: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
`
const StateTitle = styled.p`margin:0;color:#f5f5f5;font-size:15px;font-weight:700`
const StateDesc = styled.p`margin:0;color:rgba(255,255,255,.55);font-size:13px;max-width:420px`
const Explore = styled.a`
  height: 40px;
  min-height: ${farmsMyFarms.touchMin};
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.16);
  color: ${farmsMyFarms.gold};
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  &:focus-visible {
    outline: ${farmsMyFarms.focusRing};
    outline-offset: ${farmsMyFarms.focusOffset};
  }
`
const AdvisorSlot = styled.div`
  width: 100%;
  max-width: ${farmsMyFarms.rightSlotW};
  height: ${farmsMyFarms.moduleH};
  border-radius: ${farmsMyFarms.moduleRadius};
  border: 1px dashed rgba(255, 255, 255, 0.06);
  justify-self: stretch;
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    display: none;
  }
`
const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`

export const FarmsMyFarmsModule: React.FC = () => {
  const vm = useFarmsWalletPositions()
  const scrollToExplore = () => {
    const el = document.querySelector('#explore-farms')
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  return (
    <Row
      data-testid="farms-my-farms-module"
      data-farms-module="003"
      data-pixel-farms-my-farms="936x360"
      data-module-state={vm.state}
      aria-labelledby="farms-my-farms-title"
    >
      <Surface data-testid="farms-my-farms-surface">
        <Header>
          <TitleRow>
            <Title id="farms-my-farms-title">My Farms</Title>
            {vm.showCountBadge && vm.totalCount != null ? <Badge aria-label={`${vm.totalCount} farm positions`}>{vm.totalCount}</Badge> : null}
          </TitleRow>
          {vm.showViewAll ? (
            <ViewAll type="button" onClick={scrollToExplore}>
              View all farms
            </ViewAll>
          ) : null}
        </Header>
        <Body>
          {vm.moduleDisclosure ? <StateDesc role="status">{vm.moduleDisclosure}</StateDesc> : null}
          <LiveRegion aria-live="polite">{vm.liveRegion}</LiveRegion>
          {vm.state === 'disconnected' ? (
            <Center>
              <StateTitle>Connect your wallet to view farm positions</StateTitle>
              <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
            </Center>
          ) : null}
          {vm.state === 'loading' ? (
            <Grid aria-busy="true" aria-label="Loading farm positions">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton data-testid="farms-my-farms-skeleton" />
                </li>
              ))}
            </Grid>
          ) : null}
          {vm.state === 'empty' ? (
            <Center>
              <StateTitle>No farm positions yet</StateTitle>
              <StateDesc>Stake supported LP tokens in an active farm to start earning rewards.</StateDesc>
              <Explore href="#explore-farms">Explore Farms</Explore>
            </Center>
          ) : null}
          {vm.state === 'unavailable' ? (
            <Center>
              <StateTitle>Farm positions are temporarily unavailable</StateTitle>
              <StateDesc>Your positions are not represented as zero. Try again later.</StateDesc>
            </Center>
          ) : null}
          {(['ready', 'partial', 'stale'] as const).includes(vm.state as 'ready') ? (
            <Grid>
              {vm.visiblePositions.map((position) => (
                <li key={position.positionId}>
                  <FarmsMyFarmCard position={position} />
                </li>
              ))}
            </Grid>
          ) : null}
        </Body>
      </Surface>
      <AdvisorSlot data-farms-module-006-slot="reserved" aria-hidden="true" title="Reserved for Module 006 Yield Advisor" />
    </Row>
  )
}
export default FarmsMyFarmsModule
