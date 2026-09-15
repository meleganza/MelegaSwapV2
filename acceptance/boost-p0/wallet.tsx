import React from 'react'
export const useAccount = () => ({ address: undefined })
export const useSigner = () => ({ data: undefined })
export default function WalletButton(props: any) { return <button {...props}>Connect Wallet</button> }
export const MarcoPay = () => <button disabled>MARCO Pay test gate</button>
