import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

/** Neutralize legacy UIkit chrome inside the Melega app shell only. */
export const AppShellUIKitNeutralizer = createGlobalStyle`
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

  /* On compact desktop the chain logo is the complete selector affordance.
     The textual label is removed instead of being visually truncated. */
  @media (min-width: 768px) and (max-width: 1279px) {
    [data-melega-global-header] [data-testid='melega-header-chain'],
    [data-melega-global-header] [data-network-status-pill] {
      width: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
    }

    [data-melega-global-header] [data-chain-label] {
      display: none !important;
    }

    [data-melega-global-header] [data-network-status-pill] > div {
      padding-left: 8px !important;
      padding-right: 8px !important;
      justify-content: center !important;
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
    min-width: 40px !important;
    width: 40px !important;
    max-width: 40px !important;
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    padding: 0 !important;
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

  /* Compact desktop keeps the official MARCO control as a contained icon so
     navigation and search remain available in a narrowed desktop window. */
  @media (min-width: 768px) and (max-width: 1023px) and (hover: hover) and (pointer: fine) {
    [data-melega-global-header] .melega-shell-connect {
      width: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
      height: 40px !important;
      padding: 0 !important;
      font-size: 0 !important;
      gap: 0 !important;
    }

    [data-melega-global-header] .melega-shell-connect img {
      margin: 0 !important;
    }
  }

  /* FARMS responsive containment. Module 001 remains visually frozen at
     desktop widths; only the demonstrably broken 768–1100px band is adapted. */
  @media (min-width: 768px) and (max-width: 1100px) {
    [data-testid='farms-hero-module'] [data-testid='farms-hero-inner'] {
      display: block !important;
      position: relative !important;
    }

    [data-testid='farms-hero-module'] [data-testid='farms-hero-left'] {
      position: relative !important;
      z-index: 3 !important;
      width: calc(100% - 246px) !important;
      max-width: 340px !important;
      height: 100% !important;
    }

    [data-testid='farms-hero-module'] [data-testid='farms-hero-left'] > :last-child {
      flex-wrap: nowrap !important;
      overflow: visible !important;
    }

    [data-testid='farms-hero-module'] [data-testid='farms-hero-inner'] > :nth-child(2) {
      position: absolute !important;
      inset: -16px !important;
      width: auto !important;
      height: auto !important;
      z-index: 0 !important;
      pointer-events: none !important;
    }

    [data-testid='farms-hero-module'] [data-testid='farms-hero-artwork'] {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
    }

    [data-testid='farms-hero-module'] [data-testid='farms-hero-inner'] > :nth-child(3) {
      position: absolute !important;
      z-index: 3 !important;
      top: 50% !important;
      right: 0 !important;
      width: 230px !important;
      height: auto !important;
      max-height: 176px !important;
      transform: translateY(-50%) !important;
    }

    [data-testid='farms-hero-featured-compact'] {
      padding: 10px 12px !important;
      gap: 5px !important;
      max-height: 176px !important;
      overflow: hidden !important;
    }

    [data-testid='farms-hero-featured-compact'] > :last-child {
      gap: 6px !important;
    }
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
