import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { MarcoBridgePanel } from 'views/MarcoBridge/MarcoBridgeWorkspace'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

const Canvas = styled.main`
  min-height: 100vh;
  padding: 12px;
  background: #070808;
  box-sizing: border-box;
`

const Brand = styled(Link)`
  width: fit-content;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;

  img {
    width: 23px;
    height: 23px;
    border-radius: 50%;
  }
  span {
    color: #f4c430;
  }
`

const BridgeEmbed = () => (
  <Canvas data-melega-widget="marco-bridge">
    <Brand href="https://www.melega.finance" target="_blank" rel="noopener noreferrer">
      <img src="/images/melega.png" alt="" /> Melega<span>DEX</span>
    </Brand>
    <MarcoBridgePanel embedded />
  </Canvas>
)

BridgeEmbed.hideMenu = true
BridgeEmbed.chains = SUPPORT_MULTI_CHAINS

export default BridgeEmbed
