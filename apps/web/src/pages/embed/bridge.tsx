import React from 'react'
import styled from 'styled-components'
import { MarcoBridgePanel } from 'views/MarcoBridge/MarcoBridgeWorkspace'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

const Canvas = styled.main`
  min-height: 100vh;
  padding: 12px;
  background: #070808;
  box-sizing: border-box;
`

const BridgeEmbed = () => (
  <Canvas data-melega-widget="marco-bridge">
    <MarcoBridgePanel embedded />
  </Canvas>
)

BridgeEmbed.hideMenu = true
BridgeEmbed.chains = SUPPORT_MULTI_CHAINS

export default BridgeEmbed
