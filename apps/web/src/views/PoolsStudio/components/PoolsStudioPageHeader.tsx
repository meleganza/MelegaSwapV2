import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsStudioLayout } from '../poolsStudioTokens'

const liveDotPulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`

const Header = styled.header`
  position: relative;
  width: 100%;
  max-width: 1240px;
  margin: 0 0 34px;
  padding: 0;
  background: transparent;
  box-sizing: border-box;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 24px;
  }
`

const Left = styled.div`
  min-width: 0;
`

const Title = styled.h1`
  margin: 0 0 18px;
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  font-family: Orbitron, sans-serif;
  font-size: 64px;
  font-weight: 900;
  line-height: 68px;
  letter-spacing: -1.5px;
  color: #ffffff;
  white-space: nowrap;

  @media (max-width: 767px) {
    font-size: 44px;
    line-height: 48px;
    letter-spacing: -1px;
    white-space: normal;
  }
`

const Subtitle = styled.div`
  margin: 0;
  max-width: 420px;
  font-family: Inter, ${typography.fontFamily.body};
  font-size: 20px;
  font-weight: 500;
  line-height: 30px;
  color: #b8b8b8;

  span {
    display: block;
  }

  @media (max-width: 767px) {
    font-size: 16px;
    line-height: 24px;
  }
`

const Right = styled.div`
  position: absolute;
  right: 0;
  top: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 18px;

  @media (max-width: 767px) {
    position: static;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 10px;
    max-width: 100%;
  }
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 152px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid #16e67a;
  background: rgba(22, 230, 122, 0.08);
  color: #16e67a;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.8px;
  white-space: nowrap;
  box-sizing: border-box;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 140px;
    height: 34px;
    font-size: 11px;
  }
`

const LiveDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16e67a;
  flex-shrink: 0;
  animation: ${liveDotPulse} 4s linear infinite;
`

const CreateBtn = styled.button`
  width: 190px;
  min-width: 190px;
  height: 52px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, #f6d44a 0%, #d4af37 100%);
  color: #080808;
  font-family: ${typography.fontFamily.body};
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  box-sizing: border-box;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 0 26px rgba(212, 175, 55, 0.24);
  transition: box-shadow 180ms ease;

  &:hover {
    box-shadow: 0 0 34px rgba(212, 175, 55, 0.38);
  }

  &:active {
    opacity: 0.92;
  }

  @media (max-width: 767px) {
    width: ${poolsStudioLayout.mobileCreateBtnWidth};
    min-width: ${poolsStudioLayout.mobileCreateBtnWidth};
    height: 44px;
    font-size: 13px;
  }
`

const PlusIcon = styled.span`
  font-size: 16px;
  line-height: 1;
  font-weight: 900;
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
  <Header data-ps-page-header data-r715-pools-hero>
    <Left>
      <Title data-ps-pools-title>POOLS</Title>
      <Subtitle data-ps-pools-subtitle>
        <span>Stake assets.</span>
        <span>Earn rewards.</span>
        <span>Build long-term positions.</span>
      </Subtitle>
    </Left>
    <Right data-ps-hero-actions>
      <LiveBadge data-ps-live-runtime>
        <LiveDot data-ps-live-dot aria-hidden />
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
