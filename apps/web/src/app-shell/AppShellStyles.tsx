import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

/** Neutralize legacy UIkit chrome inside the Melega app shell only. */
export const AppShellUIKitNeutralizer = createGlobalStyle`
  [data-melega-app-shell] .melega-shell-connect {
    min-width: 138px !important;
    height: 40px !important;
    padding: 0 20px !important;
    border-radius: 10px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #000000 !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    white-space: nowrap !important;
    border: none !important;
    box-shadow: none !important;
  }

  [data-melega-app-shell] .melega-shell-connect:hover {
    filter: brightness(1.08) !important;
    transform: translateY(-1px) !important;
  }

  [data-melega-app-shell] .melega-shell-network button,
  [data-melega-app-shell] .melega-shell-network [role='button'] {
    height: 40px !important;
    padding: 0 14px !important;
    border-radius: 10px !important;
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    box-shadow: none !important;
    color: ${colors.textPrimary} !important;
  }

  [data-melega-app-shell] .melega-shell-network img,
  [data-melega-app-shell] .melega-shell-network svg {
    width: 20px !important;
    height: 20px !important;
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
    border-color: rgba(212, 175, 55, 0.35);
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
    height: 36px !important;
    max-width: 145px !important;
    border-radius: 10px !important;
    background: ${colors.surface1} !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    box-shadow: none !important;
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
`

const WalletIconBtn = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.gold};
  border-radius: 10px;
`

export const MobileWalletSlot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WalletIconBtn className="melega-shell-wallet-slot">{children}</WalletIconBtn>
)
