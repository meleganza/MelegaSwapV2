/**
 * PASSPORT_MODULE_006 — Recent Activity (desktop 680×360 exact).
 * Left column of Passport bottom grid. Does not implement Security (007).
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { passportOne } from './passportTokens'
import {
  PassportActivityDesktopRow,
  PassportActivityMobileCard,
} from './PassportActivityRow'
import {
  usePassportRecentActivity,
  type UsePassportRecentActivityOptions,
} from './usePassportRecentActivity'
import type { PassportRecentActivityViewModel } from './passportActivityTypes'

const Module = styled.section`
  position: relative;
  width: ${passportOne.bottomColW};
  max-width: 100%;
  height: ${passportOne.activityH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.99) 0%, rgba(12, 12, 12, 0.99) 100%);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.27), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  font-family: ${passportOne.font};
  color: ${passportOne.text};
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    border-radius: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  height: 64px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    height: 56px;
    padding: 0 16px;
  }
`

const HeaderLeft = styled.div`
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${passportOne.text};
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 15px;
  font-weight: 400;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    display: none;
  }
`

const ViewAll = styled(Link)`
  width: 76px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Body = styled.div`
  width: 644px;
  max-width: calc(100% - 36px);
  margin: 0 18px;
  height: 256px;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    width: auto;
    max-width: none;
    height: auto;
    margin: 0 16px;
  }

  @media (max-width: 767px) {
    margin: 0 16px;
    padding-bottom: 8px;
  }
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
`

const Footer = styled.div`
  height: 40px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  @media (max-width: 767px) {
    height: auto;
    min-height: 32px;
    padding: 8px 16px 16px;
  }
`

const FooterText = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.muted};
`

const Center = styled.div`
  height: 256px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 12px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    height: auto;
    min-height: 180px;
    padding: 24px 8px;
  }
`

const IconTile = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: ${passportOne.muted};
  font-size: 14px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`

const CenterTitle = styled.div`
  font-size: 15px;
  line-height: 20px;
  font-weight: 750;
`

const CenterDesc = styled.p`
  margin: 6px 0 0;
  max-width: 320px;
  font-size: 12px;
  line-height: 17px;
  color: ${passportOne.secondary};
`

const Explore = styled(Link)`
  margin-top: 14px;
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const SkeletonRow = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  &:last-child {
    border-bottom: none;
  }
`

const Sk = styled.div<{ $w: number }>`
  height: 12px;
  width: ${({ $w }) => $w}px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);

  @media (prefers-reduced-motion: no-preference) {
    animation: passport-activity-pulse 1.2s ease-in-out infinite;
  }

  @keyframes passport-activity-pulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }
`

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`

export type PassportActivityProps = UsePassportRecentActivityOptions & {
  model?: PassportRecentActivityViewModel
}

export const PassportActivity: React.FC<PassportActivityProps> = ({
  model: injected,
  ...options
}) => {
  const live = usePassportRecentActivity(options)
  const model = injected ?? live

  const liveMessage =
    model.state === 'loading'
      ? 'Loading recent activity'
      : model.state === 'unavailable'
        ? 'Activity is temporarily unavailable'
        : model.state === 'empty'
          ? 'No activity yet'
          : `${model.totalCount} activity events`

  return (
    <Module
      data-testid="passport-activity-module"
      data-passport-module="006"
      data-pixel-passport-activity="680x360"
      data-activity-state={model.state}
      data-activity-count={String(model.totalCount)}
      aria-label="Recent Activity"
    >
      <LiveRegion aria-live="polite">{liveMessage}</LiveRegion>
      <Header data-testid="passport-activity-header">
        <HeaderLeft>
          <Title>Recent Activity</Title>
          {model.state !== 'disconnected' ? (
            <Subtitle>Latest ecosystem events linked to your Passport.</Subtitle>
          ) : null}
        </HeaderLeft>
        {model.showViewAll && model.viewAllHref ? (
          <ViewAll href={model.viewAllHref} data-testid="passport-activity-view-all">
            View All
          </ViewAll>
        ) : null}
      </Header>

      {model.state === 'disconnected' ? (
        <>
          <Body>
            <Center data-testid="passport-activity-disconnected">
              <CenterTitle>Connect your wallet to view Passport activity</CenterTitle>
              <div style={{ marginTop: 14 }}>
                <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
              </div>
            </Center>
          </Body>
          <Footer />
        </>
      ) : null}

      {model.state === 'loading' ? (
        <>
          <Body data-testid="passport-activity-loading" aria-hidden="true">
            {[360, 360, 360, 360].map((w, i) => (
              <SkeletonRow key={i}>
                <Sk $w={36} style={{ height: 36, borderRadius: 10 }} />
                <Sk $w={w} />
                <Sk $w={80} />
                <Sk $w={64} />
              </SkeletonRow>
            ))}
          </Body>
          <Footer />
        </>
      ) : null}

      {model.state === 'empty' ? (
        <>
          <Body>
            <Center data-testid="passport-activity-empty">
              <IconTile aria-hidden="true">RA</IconTile>
              <CenterTitle>No activity yet</CenterTitle>
              <CenterDesc>Your verified ecosystem actions will appear here.</CenterDesc>
              <Explore href={model.exploreHref} data-testid="passport-activity-explore">
                Explore the Ecosystem
              </Explore>
            </Center>
          </Body>
          <Footer />
        </>
      ) : null}

      {model.state === 'unavailable' ? (
        <>
          <Body>
            <Center data-testid="passport-activity-unavailable">
              <IconTile aria-hidden="true">!</IconTile>
              <CenterTitle>Activity is temporarily unavailable</CenterTitle>
              <CenterDesc>Try again later.</CenterDesc>
            </Center>
          </Body>
          <Footer />
        </>
      ) : null}

      {model.state === 'ready' || model.state === 'partial' ? (
        <>
          <Body data-testid="passport-activity-body">
            <List data-testid="passport-activity-list">
              {model.visibleItems.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <PassportActivityDesktopRow
                    item={item}
                    isLast={idx === model.visibleItems.length - 1}
                  />
                  <PassportActivityMobileCard item={item} />
                </React.Fragment>
              ))}
            </List>
          </Body>
          <Footer data-testid="passport-activity-footer">
            {model.partialDisclosure ? (
              <FooterText>{model.partialDisclosure}</FooterText>
            ) : model.showLatestDisclosure ? (
              <FooterText>Showing latest 4</FooterText>
            ) : null}
          </Footer>
        </>
      ) : null}
    </Module>
  )
}

export default PassportActivity
