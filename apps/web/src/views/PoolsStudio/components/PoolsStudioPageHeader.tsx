import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsStudioLayout } from '../poolsStudioTokens'

const livePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
`

const Header = styled.header`
  position: relative;
  width: 100%;
  padding-bottom: 0;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`

const Left = styled.div`
  padding-right: 480px;
  min-width: 0;

  @media (max-width: 767px) {
    padding-right: 0;
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 72px;
  font-weight: 700;
  line-height: 72px;
  letter-spacing: -2px;
  color: #ffffff;

  @media (max-width: 767px) {
    font-size: ${poolsStudioLayout.mobileTitleSize};
    line-height: 48px;
    letter-spacing: -1px;
  }
`

const Subtitle = styled.div`
  margin: 22px 0 42px;
  font-family: ${typography.fontFamily.body};
  font-size: 24px;
  font-weight: 400;
  line-height: 38px;
  color: rgba(255, 255, 255, 0.72);

  span {
    display: block;
    white-space: nowrap;
  }

  @media (max-width: 767px) {
    margin: 12px 0 24px;
    font-size: 15px;
    line-height: 24px;

    span {
      white-space: normal;
    }
  }
`

const Right = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 767px) {
    position: static;
    flex-wrap: wrap;
    gap: 10px;
  }
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid #00d97e;
  background: rgba(0, 217, 126, 0.06);
  color: #00d97e;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-sizing: border-box;
  gap: 6px;

  @media (max-width: 767px) {
    height: ${poolsStudioLayout.mobileLivePillHeight};
    padding: 0 14px;
    font-size: 12px;
  }
`

const LiveDot = styled.span`
  animation: ${livePulse} 3.2s ease-in-out infinite;
`

const CreateBtn = styled.button`
  width: 220px;
  min-width: 220px;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: #f2c94c;
  color: #121212;
  font-family: ${typography.fontFamily.body};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  box-sizing: border-box;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(242, 201, 76, 0.18);

  &:hover {
    filter: brightness(1.05);
  }

  @media (max-width: 767px) {
    width: ${poolsStudioLayout.mobileCreateBtnWidth};
    min-width: ${poolsStudioLayout.mobileCreateBtnWidth};
    height: ${poolsStudioLayout.mobileCreateBtnHeight};
    font-size: 14px;
  }
`

const PlusIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
`

const scrollToCreatePool = () => {
  const el = document.getElementById('create-pool')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  window.location.href = '/build-studio?intent=staking-pool#create-pool'
}

export const PoolsStudioPageHeader: React.FC = () => (
  <Header data-ps-page-header>
    <Left>
      <Title data-ps-pools-title>POOLS</Title>
      <Subtitle>
        <span>Stake assets.</span>
        <span>Earn rewards.</span>
        <span>Build long-term positions.</span>
      </Subtitle>
    </Left>
    <Right>
      <LiveBadge>
        <LiveDot data-ps-live-dot aria-hidden>
          ●
        </LiveDot>
        LIVE RUNTIME
      </LiveBadge>
      <CreateBtn type="button" data-ps-header-create-pool onClick={scrollToCreatePool}>
        <PlusIcon>+</PlusIcon>
        Create Pool
      </CreateBtn>
    </Right>
  </Header>
)

export default PoolsStudioPageHeader
