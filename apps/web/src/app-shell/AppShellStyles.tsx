import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { colors, radius } from 'design-system/melega/tokens'

/** Neutralize legacy UIkit chrome inside the Melega app shell only. */
export const AppShellUIKitNeutralizer = createGlobalStyle`
  [data-melega-app-shell] .melega-shell-connect {
    min-width: 136px !important;
    height: 40px !important;
    padding: 0 20px !important;
    border-radius: ${radius.md} !important;
    background: ${colors.gold} !important;
    color: ${colors.canvas} !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    border: none !important;
    box-shadow: none !important;
  }

  [data-melega-app-shell] .melega-shell-connect:hover {
    background: ${colors.goldHover} !important;
  }

  [data-melega-app-shell] .melega-shell-network button,
  [data-melega-app-shell] .melega-shell-network [role='button'] {
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: ${radius.md} !important;
    background: ${colors.surface1} !important;
    border: 1px solid ${colors.borderStrong} !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    box-shadow: none !important;
  }

  [data-melega-app-shell] .melega-shell-settings {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bdbdbd;
  }

  [data-melega-app-shell] .melega-shell-settings:hover {
    color: ${colors.textPrimary};
  }

  [data-melega-app-shell] .melega-shell-settings button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: inherit !important;
  }

  [data-melega-app-shell] .melega-shell-mobile-network button,
  [data-melega-app-shell] .melega-shell-mobile-network [role='button'] {
    height: 36px !important;
    max-width: 145px !important;
    border-radius: ${radius.md} !important;
    background: ${colors.surface1} !important;
    border: 1px solid ${colors.borderStrong} !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    box-shadow: none !important;
  }

  [data-melega-app-shell] .melega-shell-wallet-icon {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    padding: 0 !important;
    border-radius: ${radius.md} !important;
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
  border-radius: ${radius.md};
`

export const MobileWalletSlot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WalletIconBtn className="melega-shell-wallet-slot">{children}</WalletIconBtn>
)
