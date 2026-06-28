import styled from 'styled-components'
import { cmd } from './tokens'

export const Root = styled.div`
  min-height: 100vh;
  background: ${cmd.bg};
  color: ${cmd.text};
  font-family: ${cmd.fontBody};
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
`

export const Shell = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 72px;

  @media (max-width: 1024px) {
    padding: 0 16px 88px;
  }
`

export const MainGrid = styled.div`
  display: grid;
  gap: 20px;
  flex: 1;
  align-items: start;

  @media (min-width: 1025px) {
    grid-template-columns: minmax(260px, 300px) minmax(420px, 1fr) minmax(280px, 320px);
    grid-template-areas: 'left center right';
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

export const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  grid-area: left;
  order: 2;

  @media (min-width: 1025px) {
    order: unset;
  }
`

export const CenterCol = styled.div`
  grid-area: center;
  order: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 1025px) {
    order: unset;
  }
`

export const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  grid-area: right;
  order: 3;

  @media (min-width: 1025px) {
    order: unset;
  }
`

export const Panel = styled.section`
  background: ${cmd.surfaceGlass};
  backdrop-filter: blur(14px);
  border: 1px solid ${cmd.borderGold};
  border-radius: ${cmd.radius};
  padding: 18px 20px;
`

export const PanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${cmd.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${cmd.gold};
`

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid ${cmd.border};
  font-size: 13px;

  &:last-of-type {
    border-bottom: none;
  }

  span:first-child {
    color: ${cmd.textSecondary};
  }

  span:last-child,
  strong {
    color: ${cmd.text};
    font-weight: 500;
    text-align: right;
  }
`

export const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${cmd.success};
  font-weight: 600;
  font-size: 12px;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${cmd.success};
    box-shadow: 0 0 8px ${cmd.success};
  }
`

export const StatusBadge = styled.span<{ $variant?: 'active' | 'next' }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $variant }) => ($variant === 'next' ? cmd.textSecondary : cmd.goldHighlight)};
  border: 1px solid ${({ $variant }) => ($variant === 'next' ? cmd.border : cmd.gold)};
  background: ${({ $variant }) => ($variant === 'next' ? 'transparent' : 'rgba(212, 175, 55, 0.08)')};
`

export const PanelAction = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: ${cmd.radiusSm};
  border: 1px solid ${cmd.borderGold};
  background: rgba(0, 0, 0, 0.35);
  color: ${cmd.text};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: border-color ${cmd.transition}, background ${cmd.transition};

  &:hover {
    border-color: ${cmd.gold};
    background: rgba(212, 175, 55, 0.06);
  }

  svg {
    color: ${cmd.gold};
  }
`

export const GoldButton = styled.button`
  background: linear-gradient(180deg, ${cmd.goldHighlight} 0%, ${cmd.gold} 100%);
  color: #000;
  border: none;
  border-radius: ${cmd.radiusSm};
  padding: 10px 20px;
  font-family: ${cmd.fontDisplay};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity ${cmd.transition};

  &:hover {
    opacity: 0.92;
  }
`
