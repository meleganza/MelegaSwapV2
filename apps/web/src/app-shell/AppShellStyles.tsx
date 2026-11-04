import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

/** Neutralize legacy UIkit chrome inside the Melega app shell only. */
export const AppShellUIKitNeutralizer = createGlobalStyle`
  /* R030 Pearl consumer shell — wins over legacy dark component styles. */
  [data-melega-app-shell],
  [data-melega-shell-main] {
    background: #F7F6F2 !important;
    color: #171817 !important;
  }

  [data-melega-global-header] {
    background: rgba(247, 246, 242, 0.96) !important;
    border-bottom-color: #E5E2D9 !important;
  }

  [data-melega-global-header] a,
  [data-melega-global-header] button {
    color: #171817;
  }

  [data-testid='melega-header-primary-nav'],
  [data-testid='melega-header-primary-nav'] > div {
    background: transparent !important;
    background-image: none !important;
  }

  [data-melega-global-search] input {
    background: #FFFFFF !important;
    color: #171817 !important;
  }

  [data-melega-global-search] > div {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
  }

  [data-melega-global-search] input::placeholder {
    color: #72736E !important;
  }

  [data-testid='melega-header-chain'] > div,
  [data-testid='melega-header-chain'] button,
  [data-testid='melega-header-chain'] [role='button'] {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
    color: #171817 !important;
  }

  [data-tool-service] {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
    color: #171817 !important;
  }

  [data-tool-service] h2 {
    color: #171817 !important;
  }

  /* R030 consumer surfaces: presentation only; runtime/action hosts remain untouched. */
  [data-projects-studio-screen],
  [data-farms-studio-screen],
  [data-pools-studio-screen],
  [data-portfolio='premium-v3'] {
    background: #F7F6F2 !important;
    color: #171817 !important;
    color-scheme: light !important;
  }

  [data-projects-studio-screen] [data-pr-panel],
  [data-projects-studio-screen] [data-pr-project-card],
  [data-projects-studio-screen] [data-pr-kpi-card],
  [data-projects-studio-screen] [data-pr-featured],
  [data-farms-studio-screen] [data-testid='farms-my-farms-surface'],
  [data-farms-studio-screen] [data-testid='farms-my-farm-card'],
  [data-farms-studio-screen] [data-testid='farms-explore-card'],
  [data-farms-studio-screen] [data-testid='farms-finished-card'],
  [data-pools-studio-screen] [data-testid='pools-my-positions-surface'],
  [data-pools-studio-screen] [data-testid='pools-explore-card'],
  [data-pools-studio-screen] [data-testid='pools-finished-card'] {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
    box-shadow: 0 16px 44px rgba(23, 24, 23, 0.07) !important;
    color: #171817 !important;
  }

  [data-pools-studio-screen] [data-testid='pools-my-positions-card'] *:not(button),
  [data-pools-studio-screen] [data-testid='pools-explore-card'] *:not(button),
  [data-pools-studio-screen] [data-testid='pools-finished-card'] *:not(button) {
    background-color: transparent !important;
    background-image: none !important;
    color: inherit;
  }

  [data-projects-studio-screen] input,
  [data-projects-studio-screen] select,
  [data-farms-studio-screen] input,
  [data-farms-studio-screen] select,
  [data-pools-studio-screen] input,
  [data-pools-studio-screen] select {
    background: #FBFAF7 !important;
    border-color: #E5E2D9 !important;
    color: #171817 !important;
  }

  [data-testid='melega-dex-footer'] {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
  }

  /* DS001.2 — disconnected wallet control */
  [data-melega-app-shell] .melega-shell-connect {
    min-width: 164px !important;
    width: auto !important;
    max-width: 196px !important;
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 12px !important;
    border-radius: 10px !important;
    background: #F4C430 !important;
    color: #080808 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    border: 1px solid #F4C430 !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
  }

  [data-melega-app-shell] .melega-shell-connect:hover {
    background: #FFD34D !important;
    border-color: #FFD34D !important;
    filter: none !important;
    transform: none !important;
  }

  [data-melega-app-shell] .melega-shell-network {
    display: flex;
    align-items: center;
    height: 40px;
  }

  /* Compact chain pill — must not overlap search / language / wallet */
  [data-melega-app-shell] .melega-shell-network button,
  [data-melega-app-shell] .melega-shell-network [role='button'] {
    height: 40px !important;
    min-width: 0 !important;
    width: auto !important;
    max-width: 78px !important;
    padding: 0 8px !important;
    border-radius: 10px !important;
    background: transparent !important;
    border: 1px solid transparent !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    line-height: 18px !important;
    white-space: nowrap !important;
    box-shadow: none !important;
    color: ${colors.textPrimary} !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    overflow: hidden !important;
  }

  [data-melega-app-shell] .melega-shell-network button:hover,
  [data-melega-app-shell] .melega-shell-network [role='button']:hover {
    background: #141414 !important;
    border-color: #232323 !important;
  }

  [data-melega-app-shell] .melega-shell-network img,
  [data-melega-app-shell] .melega-shell-network svg {
    width: 20px !important;
    height: 20px !important;
    flex-shrink: 0 !important;
  }

  @media (max-width: 1279px) {
    [data-melega-app-shell] .melega-shell-network button,
    [data-melega-app-shell] .melega-shell-network [role='button'] {
      min-width: 0 !important;
      max-width: 72px !important;
      padding: 0 6px !important;
    }
  }

  [data-melega-app-shell] .melega-shell-settings {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: transparent;
    color: ${colors.textSecondary};
    box-sizing: border-box;
  }

  [data-melega-app-shell] .melega-shell-settings:hover {
    color: ${colors.textPrimary};
    border-color: rgba(244, 196, 48, 0.35);
  }

  [data-melega-app-shell] .melega-shell-settings button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: inherit !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  [data-melega-app-shell] .melega-shell-settings svg {
    width: 20px !important;
    height: 20px !important;
  }

  [data-melega-app-shell] .melega-shell-mobile-network button,
  [data-melega-app-shell] .melega-shell-mobile-network [role='button'] {
    height: 40px !important;
    min-height: 40px !important;
    max-width: 120px !important;
    padding: 0 10px !important;
    border-radius: 10px !important;
    background: ${colors.surface1} !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  @media (max-width: 419px) {
    [data-melega-app-shell] .melega-shell-mobile-network button,
    [data-melega-app-shell] .melega-shell-mobile-network [role='button'] {
      max-width: 88px !important;
      min-width: 76px !important;
      padding: 0 6px !important;
    }
  }

  [data-melega-app-shell] .melega-shell-mobile-connect {
    min-width: 68px !important;
    width: auto !important;
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 10px !important;
    border-radius: 10px !important;
    border: 1px solid ${colors.gold} !important;
    background: transparent !important;
    color: ${colors.gold} !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    box-shadow: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  [data-melega-mobile-header] .melega-shell-wallet-pill {
    width: 116px !important;
    min-width: 116px !important;
    max-width: 116px !important;
    flex: 0 0 116px !important;
    height: 44px !important;
    border-radius: 14px !important;
  }

  [data-melega-mobile-header] .melega-shell-wallet-pill button {
    border: 1px solid #E5E2D9 !important;
    border-radius: 14px !important;
    background: #FFFFFF !important;
    color: #171817 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 14px rgba(23,24,23,.04) !important;
  }

  [data-melega-mobile-header] .melega-shell-mobile-network [data-network-status-pill] > div,
  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] > div {
    border: 1px solid #E5E2D9 !important;
    border-radius: 14px !important;
    background: #FFFFFF !important;
    box-shadow: 0 4px 14px rgba(23,24,23,.04) !important;
  }

  [data-melega-mobile-header] .melega-shell-mobile-network [data-network-status-pill] > div {
    position: relative !important;
    width: 76px !important;
    min-width: 76px !important;
    padding: 0 8px !important;
    gap: 6px !important;
    color: transparent !important;
  }

  [data-melega-app-shell] .melega-shell-wallet-icon {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    padding: 0 !important;
    border-radius: 10px !important;
    border: 1px solid ${colors.gold} !important;
    background: transparent !important;
    color: ${colors.gold} !important;
    font-size: 0 !important;
    box-shadow: none !important;
  }

  /* R033 Founder-approved Pearl shell. */
  [data-melega-mobile-header] {
    background: rgba(250,249,245,.98) !important;
    border-bottom: 0 !important;
  }

  [data-melega-mobile-header] [data-melega-brand-lockup] {
    transform: scale(.94);
    transform-origin: left center;
  }

  [data-melega-app-shell] .melega-shell-mobile-network button,
  [data-melega-app-shell] .melega-shell-mobile-network [role='button'],
  [data-melega-app-shell] .melega-shell-mobile-connect,
  [data-melega-app-shell] .melega-shell-wallet-icon {
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    border: 1px solid #E5E2D9 !important;
    border-radius: 12px !important;
    background: #FFFFFF !important;
    color: #171817 !important;
    box-shadow: none !important;
  }

  [data-melega-app-shell] .melega-shell-mobile-network button,
  [data-melega-app-shell] .melega-shell-mobile-network [role='button'] {
    width: 78px !important;
    max-width: 78px !important;
    min-width: 78px !important;
    padding: 0 8px !important;
  }

  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] {
    width: 78px !important;
    min-width: 78px !important;
    max-width: 78px !important;
    overflow: visible !important;
  }

  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] > div {
    width: 78px !important;
    min-width: 78px !important;
    max-width: 78px !important;
    padding: 0 7px !important;
    gap: 5px !important;
    overflow: visible !important;
  }

  [data-melega-mobile-header] .melega-chain-avatar {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: #F3C928 !important;
  }

  [data-melega-mobile-header] .melega-chain-avatar img {
    display: block !important;
    width: 28px !important;
    height: 28px !important;
    object-fit: contain !important;
  }

  [data-melega-mobile-header] [data-testid='header-chain-label'] {
    display: block !important;
    width: 24px !important;
    min-width: 24px !important;
    height: 18px !important;
    line-height: 18px !important;
    color: #171817 !important;
    font-size: 12px !important;
    font-weight: 750 !important;
  }

  [data-melega-mobile-header] [data-testid='header-chain-label'] > *,
  [data-melega-mobile-header] [data-testid='header-chain-label'] + * {
    display: none !important;
  }

  [data-melega-mobile-header] [data-testid='header-chain-label']:not(:empty) {
    visibility: visible !important;
  }

  [data-melega-mobile-header] [data-testid='header-chain-label'] {
    flex: 0 0 24px !important;
  }

  [data-melega-mobile-header] .melega-chain-avatar + div {
    display: block !important;
    width: 24px !important;
    min-width: 24px !important;
    height: 18px !important;
    overflow: visible !important;
  }

  [data-melega-app-shell] .melega-shell-mobile-connect {
    max-width: 96px !important;
    padding: 0 10px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  @media (max-width: 374px) {
    [data-melega-mobile-header] { padding-left: 10px !important; padding-right: 10px !important; }
    [data-melega-mobile-header] [data-melega-brand-lockup] { transform: scale(.9); transform-origin: left center; }
    [data-melega-app-shell] .melega-shell-mobile-network button,
    [data-melega-app-shell] .melega-shell-mobile-network [role='button'],
    [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'],
    [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] > div {
      width: 68px !important;
      min-width: 68px !important;
      max-width: 68px !important;
    }
    [data-melega-mobile-header] .melega-shell-wallet-pill { width: 108px !important; min-width: 108px !important; max-width: 108px !important; flex-basis: 108px !important; }
  }

  [data-testid='marco-wave1-bridge'] select,
  [data-testid='marco-wave1-bridge'] input {
    background: #F1F0EB !important;
    color: #171817 !important;
    border-color: #E5E2D9 !important;
    color-scheme: light !important;
  }
  /* R035B: approved Bridge mockup — amount sits flat on the From panel. */
  [data-testid='marco-wave1-bridge'] input[aria-label='MARCO amount'] {
    background: transparent !important;
    border: 0 !important;
  }

  [data-liquidity-studio='v3'] [data-add-surface] input,
  [data-liquidity-studio='v3'] [data-add-surface] [class*='TokenBox'],
  [data-liquidity-studio='v3'] [data-add-surface] [class*='CurrencyInput'],
  [data-liquidity-studio='v3'] [data-add-surface] [class*='InputPanel'] {
    background: #F1F0EB !important;
    color: #171817 !important;
    border-color: #E5E2D9 !important;
    background-image: none !important;
  }

  [data-liquidity-studio='v3'] [data-add-surface] input::placeholder { color: #92938D !important; }

  [data-testid='list-workspace'] {
    background: #FFFFFF !important;
    color: #171817 !important;
    color-scheme: light !important;
  }
  [data-testid='list-workspace'] input,
  [data-testid='list-workspace'] select,
  [data-testid='list-workspace'] textarea {
    background: #F1F0EB !important;
    color: #171817 !important;
    border-color: #E5E2D9 !important;
  }
  [data-testid='list-workspace'] h1,
  [data-testid='list-workspace'] h2,
  [data-testid='list-workspace'] h3,
  [data-testid='list-workspace'] strong { color: #171817 !important; }

  [data-project-page='v7'] { background: #F7F6F2 !important; color: #171817 !important; color-scheme: light !important; }
  [data-project-page='v7'] [data-testid='project-v7-market-first-identity'],
  [data-project-page='v7'] [data-testid='project-v7-terminal'],
  [data-project-page='v7'] [data-testid='project-v7-intel'],
  [data-project-page='v7'] [data-project-section] {
    background: #FFFFFF !important;
    background-image: none !important;
    border-color: #E5E2D9 !important;
    box-shadow: none !important;
  }
  [data-project-page='v7'] [data-testid='project-v7-market-first-identity'] p,
  [data-project-page='v7'] [data-testid='project-v7-market-first-identity'] span { color: #72736E; }
  [data-project-page='v7'] h1,
  [data-project-page='v7'] h2,
  [data-project-page='v7'] h3,
  [data-project-page='v7'] strong { color: #171817 !important; }
  [data-project-page='v7'] [data-testid='project-v7-boost'] { display: none !important; }

  /* R035B — bottom navigation per approved Pearl mockups (Trade/Bridge/Earn). */
  nav[aria-label='Main navigation'] {
    background: #F7F6F2 !important;
    border-top: 1px solid #EFEDE6 !important;
    box-shadow: none !important;
    min-height: 76px !important;
    padding: 8px 10px calc(6px + env(safe-area-inset-bottom, 0px)) !important;
  }
  nav[aria-label='Main navigation'] a { background: transparent !important; color: #72736E !important; }
  nav[aria-label='Main navigation'] a[aria-current='page'] { background: #FFF6D6 !important; color: #E9B10F !important; }

  /* R035B — mobile header controls: neutral white pills (chain + wallet) per approved mockups. */
  [data-melega-mobile-header] {
    border-bottom: 0 !important;
  }
  [data-melega-mobile-header] [data-testid='network-switcher-root'] > div,
  [data-melega-mobile-header] [data-testid='network-switcher-root'] > div > div {
    background: #FFFFFF !important;
    color: #171817 !important;
  }
  [data-melega-mobile-header] [data-testid='network-switcher-root'] > div {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 12px 0 6px !important;
    border: 1px solid #ECE9E1 !important;
    border-radius: 999px !important;
    box-shadow: 0 2px 8px rgba(23, 24, 23, 0.04) !important;
    position: relative !important;
    display: inline-flex !important;
    align-items: center !important;
  }
  [data-melega-mobile-header] [data-testid='network-switcher-root'] img {
    width: 26px !important;
    height: 26px !important;
    border-radius: 50% !important;
  }
  [data-melega-mobile-header] [data-testid='header-chain-label'] {
    display: block !important;
    color: #171817 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    margin-left: 6px !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  [data-melega-mobile-header] [data-testid='marco-connect'] button {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 12px !important;
    border: 1px solid #ECE9E1 !important;
    border-radius: 999px !important;
    background: #FFFFFF !important;
    color: #171817 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    gap: 6px !important;
    box-shadow: 0 2px 8px rgba(23, 24, 23, 0.04) !important;
  }
  /* R035B — desktop header controls: Pearl network pill + neutral wallet pill (same provider). */
  [data-melega-global-header] [data-testid='network-switcher-root'] > div,
  [data-melega-global-header] [data-testid='network-switcher-root'] > div > div {
    background: #FFFFFF !important;
    color: #171817 !important;
  }
  [data-melega-global-header] [data-testid='network-switcher-root'] > div {
    height: 40px !important;
    padding: 0 14px 0 6px !important;
    border: 1px solid #ECE9E1 !important;
    border-radius: 999px !important;
    box-shadow: 0 2px 8px rgba(23, 24, 23, 0.04) !important;
  }
  [data-melega-global-header] [data-testid='network-switcher-root'] img {
    width: 26px !important;
    height: 26px !important;
    border-radius: 50% !important;
  }
  [data-melega-global-header] [data-testid='header-chain-label'] {
    color: #171817 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
  }
  [data-melega-global-header] [data-testid='marco-connect'] button {
    height: 40px !important;
    padding: 0 16px !important;
    border: 1px solid #ECE9E1 !important;
    border-radius: 999px !important;
    background: #FFFFFF !important;
    color: #171817 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    gap: 8px !important;
    box-shadow: 0 2px 8px rgba(23, 24, 23, 0.04) !important;
  }
  [data-melega-global-header] [data-testid='marco-connect'] button[aria-label='Connect wallet'] > span:first-child {
    background: #C9C6BC !important;
  }
  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'],
  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] > div,
  [data-melega-mobile-header] .melega-shell-mobile-network [data-network-status-pill] > div {
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
  }
  [data-melega-mobile-header] .melega-shell-mobile-network [data-testid='network-switcher-root'] > div > div {
    width: auto !important;
    min-width: 0 !important;
  }
  /* R035B — 320px: keep brand, chain and wallet on one line without overlap. */
  @media (max-width: 359px) {
    [data-melega-mobile-header] [data-testid='header-chain-label'] { display: none !important; }
    [data-melega-mobile-header] { gap: 6px !important; padding-left: 10px !important; padding-right: 10px !important; }
    [data-melega-mobile-header] [data-testid='network-switcher-root'] > div { padding: 0 20px 0 4px !important; height: 36px !important; min-height: 36px !important; }
    [data-melega-mobile-header] [data-testid='network-switcher-root'] img { width: 24px !important; height: 24px !important; }
    [data-melega-mobile-header] [data-testid='marco-connect'] button { height: 36px !important; min-height: 36px !important; padding: 0 9px !important; font-size: 11px !important; gap: 4px !important; }
    [data-melega-mobile-header] [data-melega-brand-lockup] span { font-size: 15px !important; }
    [data-melega-mobile-header] [data-melega-brand-lockup] img { height: 30px !important; top: 7px !important; margin-left: 2px !important; }
  }
  /* Disconnected: neutral status dot (green only once a wallet is connected). */
  [data-melega-mobile-header] [data-testid='marco-connect'] button[aria-label='Connect wallet'] > span:first-child {
    background: #C9C6BC !important;
  }
`

const WalletIconBtn = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.gold};
  border-radius: 10px;
`

export const MobileWalletSlot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WalletIconBtn className="melega-shell-wallet-slot">{children}</WalletIconBtn>
)
