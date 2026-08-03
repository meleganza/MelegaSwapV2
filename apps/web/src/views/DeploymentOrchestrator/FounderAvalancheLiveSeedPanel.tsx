/**
 * Founder Avalanche LIVE seed — create factual WAVAX-MARCO pair, add liquidity, micro-swap.
 */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { useWalletChainId } from 'hooks/useWalletChainId'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import {
  AVAX_SEED_DEFAULTS,
  AVAX_LIVE_SEED_MARCO,
  AVAX_LIVE_SEED_ROUTER,
  AVAX_LIVE_SEED_WAVAX,
  avalancheLiveSeedTargets,
  encodeAddLiquidityAvax,
  encodeGetAmountsOut,
  encodeMarcoApprove,
  encodeSwapExactAvaxForMarco,
} from 'lib/deployment-orchestrator/founderAvalancheLiveSeed'
import { isAuthorizedMelegaDeployer } from 'lib/deployment-orchestrator'
import {
  isUserRejectedError,
  resolveWalletProvider,
  walletEthCall,
  walletSendCallTransaction,
  walletSwitchChain,
} from 'lib/deployment-orchestrator/founderWalletTx'
import { AVAX_ROUTER_CHAIN_ID } from 'lib/deployment-orchestrator/founderAvalancheRouterArtifacts'

const Card = styled.section`
  margin: 0 0 22px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(80, 220, 140, 0.35);
  background: linear-gradient(165deg, rgba(16, 48, 36, 0.55), rgba(12, 18, 28, 0.72));
`
const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 720;
`
const Note = styled.p`
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  line-height: 1.45;
`
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`
const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  border: 1px solid ${(p) => (p.$primary ? 'rgba(80, 220, 140, 0.55)' : 'rgba(255, 255, 255, 0.18)')};
  background: ${(p) => (p.$primary ? 'rgba(30, 140, 80, 0.35)' : 'rgba(255, 255, 255, 0.06)')};
  color: #f5f8ff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
const Banner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
  background: rgba(30, 120, 70, 0.22);
  border: 1px solid rgba(80, 200, 120, 0.35);
  word-break: break-all;
`

export const FounderAvalancheLiveSeedPanel: React.FC = () => {
  const { address, isConnected, connector } = useAccount()
  const chainId = useWalletChainId()
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const targets = avalancheLiveSeedTargets()

  const push = (line: string) => setLog((prev) => [...prev.slice(-12), line])

  const runSeed = useCallback(async () => {
    setLog([])
    if (!address || !isAuthorizedMelegaDeployer(address)) {
      push('Connect MELEGA DEPLOYER.')
      return
    }
    try {
      setBusy(true)
      const preferred = (await connector?.getProvider?.()) as { request?: Function } | undefined
      const eth = resolveWalletProvider(preferred as any)
      if (!eth) throw new Error('Wallet provider unavailable')
      if (chainId !== AVAX_ROUTER_CHAIN_ID) {
        await walletSwitchChain(eth, AVAX_ROUTER_CHAIN_ID)
      }

      const deadline = Math.floor(Date.now() / 1000) + 1200
      const { liquidityAvaxWei, liquidityMarcoWei, swapAvaxWei } = AVAX_SEED_DEFAULTS

      // 1) Approve MARCO to Router
      push('1/4 Approve MARCO…')
      const approveHash = await walletSendCallTransaction(eth, {
        from: address,
        to: AVAX_LIVE_SEED_MARCO,
        data: encodeMarcoApprove(AVAX_LIVE_SEED_ROUTER, liquidityMarcoWei),
      })
      push(`Approve tx ${approveHash}`)

      // 2) addLiquidityETH — Router wraps AVAX; creates pair if missing
      push('2/4 addLiquidityETH (creates factual pair + liquidity)…')
      const liq = encodeAddLiquidityAvax({
        marcoAmount: liquidityMarcoWei,
        avaxAmount: liquidityAvaxWei,
        to: address,
        deadline,
      })
      const liqHash = await walletSendCallTransaction(eth, {
        from: address,
        to: AVAX_LIVE_SEED_ROUTER,
        data: liq.data,
        valueWei: liq.valueWei,
      })
      push(`Liquidity tx ${liqHash}`)

      // 3) Quote
      push('3/4 getAmountsOut quote…')
      const amountsRaw = await walletEthCall(eth, AVAX_LIVE_SEED_ROUTER, encodeGetAmountsOut(swapAvaxWei))
      push(`getAmountsOut ok · ${amountsRaw.slice(0, 66)}…`)

      // 4) Micro swap
      push('4/4 Controlled swapExactETHForTokens…')
      const swap = encodeSwapExactAvaxForMarco({ avaxIn: swapAvaxWei, to: address, deadline })
      const swapHash = await walletSendCallTransaction(eth, {
        from: address,
        to: AVAX_LIVE_SEED_ROUTER,
        data: swap.data,
        valueWei: swap.valueWei,
      })
      push(`Swap tx ${swapHash}`)

      const fee = calculateSmartRouterGasProtocolFee({
        gasEstimateUnits: 180_000,
        gasPriceWei: 25_000_000_000,
        chainId: 43114,
      })
      push(
        `Smart Swap fee model: ${fee.percent}% ${fee.feeAsset} → ${fee.recipient} (settle on Smart Swap confirmation)`,
      )
      push('Avalanche LIVE seed complete · Factory pair + liquidity + swap proven.')
    } catch (e) {
      if (isUserRejectedError(e)) push('Wallet rejected — no broadcast.')
      else push(e instanceof Error ? e.message.slice(0, 220) : 'Seed failed')
    } finally {
      setBusy(false)
    }
  }, [address, chainId, connector])

  return (
    <Card data-testid="founder-avalanche-live-seed">
      <Title>Avalanche LIVE · Founder seed</Title>
      <Note>
        Router {targets.router} is bound. Factory still needs a factual WAVAX–MARCO pair, real liquidity, and one
        controlled swap. Fee settlement: {targets.feePercent}% estimated gas as {targets.feeAsset} →{' '}
        {targets.treasury}.
      </Note>
      <Actions>
        <Btn
          type="button"
          $primary
          disabled={busy || !isConnected}
          onClick={() => void runSeed()}
          data-testid="founder-avalanche-seed-cta"
        >
          Seed pair · liquidity · swap
        </Btn>
      </Actions>
      {log.length > 0 && (
        <Banner data-testid="founder-avalanche-seed-log">
          {log.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </Banner>
      )}
    </Card>
  )
}

export default FounderAvalancheLiveSeedPanel
