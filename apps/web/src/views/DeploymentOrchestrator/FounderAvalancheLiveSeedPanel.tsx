/**
 * Founder Avalanche LIVE seed — create factual WAVAX-MARCO pair, add liquidity,
 * settle Smart Swap protocol fee (25% estimated gas as AVAX), micro-swap.
 * Browser-wallet only. No KMS. No automatic broadcast.
 */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { useWalletChainId } from 'hooks/useWalletChainId'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import {
  AVAX_SEED_DEFAULTS,
  AVAX_LIVE_SEED_FACTORY,
  AVAX_LIVE_SEED_MARCO,
  AVAX_LIVE_SEED_ROUTER,
  AVAX_LIVE_SEED_WAVAX,
  avalancheLiveSeedTargets,
  decodeAddressCallResult,
  decodeGetAmountsOutFinal,
  decodeUintCallResult,
  encodeAddLiquidityAvax,
  encodeFactoryAllPairsLength,
  encodeFactoryGetPair,
  encodeGetAmountsOut,
  encodeMarcoApprove,
  encodeSwapExactAvaxForMarco,
} from 'lib/deployment-orchestrator/founderAvalancheLiveSeed'
import { isAuthorizedMelegaDeployer } from 'lib/deployment-orchestrator'
import {
  isUserRejectedError,
  resolveWalletProvider,
  walletEthCall,
  walletGetGasPrice,
  walletGetTransactionReceipt,
  walletSendCallTransaction,
  walletSwitchChain,
  type EthereumProvider,
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

async function waitReceipt(eth: EthereumProvider, hash: string, attempts = 40): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    const receipt = await walletGetTransactionReceipt(eth, hash)
    if (receipt?.status != null) {
      const ok = receipt.status === 1 || receipt.status === '0x1'
      if (!ok) throw new Error(`Tx reverted ${hash}`)
      return
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(`Receipt timeout ${hash}`)
}

async function walletEstimateCallGas(
  eth: EthereumProvider,
  input: { from: string; to: string; data: string; valueWei?: bigint },
): Promise<bigint> {
  const est = await eth.request({
    method: 'eth_estimateGas',
    params: [
      {
        from: input.from,
        to: input.to,
        data: input.data,
        value: `0x${(input.valueWei ?? 0n).toString(16)}`,
      },
    ],
  })
  if (typeof est !== 'string' || !est.startsWith('0x')) throw new Error('eth_estimateGas failed')
  return BigInt(est)
}

export const FounderAvalancheLiveSeedPanel: React.FC = () => {
  const { address, isConnected, connector } = useAccount()
  const chainId = useWalletChainId()
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const targets = avalancheLiveSeedTargets()

  const push = (line: string) => setLog((prev) => [...prev.slice(-20), line])

  const runSeed = useCallback(async () => {
    setLog([])
    if (!address || !isAuthorizedMelegaDeployer(address)) {
      push('Connect MELEGA DEPLOYER 0xB6eEb3…3EE0 on Avalanche.')
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

      push('1/6 Approve MARCO…')
      const approveHash = await walletSendCallTransaction(eth, {
        from: address,
        to: AVAX_LIVE_SEED_MARCO,
        data: encodeMarcoApprove(AVAX_LIVE_SEED_ROUTER, liquidityMarcoWei),
      })
      push(`Approve tx ${approveHash}`)
      await waitReceipt(eth, approveHash)

      push('2/6 addLiquidityETH (creates factual pair + liquidity)…')
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
      await waitReceipt(eth, liqHash)

      push('3/6 Capture pair…')
      const pairsLenRaw = await walletEthCall(eth, AVAX_LIVE_SEED_FACTORY, encodeFactoryAllPairsLength())
      const pairRaw = await walletEthCall(eth, AVAX_LIVE_SEED_FACTORY, encodeFactoryGetPair())
      const pair = decodeAddressCallResult(pairRaw)
      push(`allPairsLength=${decodeUintCallResult(pairsLenRaw)} · pair=${pair}`)
      if (pair === '0x0000000000000000000000000000000000000000') {
        throw new Error('Factory getPair returned zero — liquidity did not create market')
      }

      push('4/6 getAmountsOut quote…')
      const amountsRaw = await walletEthCall(eth, AVAX_LIVE_SEED_ROUTER, encodeGetAmountsOut(swapAvaxWei))
      const amountOut = decodeGetAmountsOutFinal(amountsRaw)
      if (amountOut <= 0n) throw new Error('getAmountsOut returned zero')
      push(`expectedOut=${amountOut.toString()} wei MARCO`)

      const swapForEstimate = encodeSwapExactAvaxForMarco({
        avaxIn: swapAvaxWei,
        to: address,
        deadline,
        amountOutMin: 0n,
      })
      const gasEstimate = await walletEstimateCallGas(eth, {
        from: address,
        to: AVAX_LIVE_SEED_ROUTER,
        data: swapForEstimate.data,
        valueWei: swapForEstimate.valueWei,
      })
      const gasPrice = await walletGetGasPrice(eth)
      const fee = calculateSmartRouterGasProtocolFee({
        gasEstimateUnits: gasEstimate,
        gasPriceWei: gasPrice,
        chainId: 43114,
      })

      push(`5/6 Protocol fee ${fee.percent}% ${fee.feeAsset} → ${fee.recipient} (${fee.feeWei} wei)…`)
      let feeHash: string | null = null
      if (BigInt(fee.feeWei) > 0n) {
        feeHash = await walletSendCallTransaction(eth, {
          from: address,
          to: fee.recipient,
          data: '0x',
          valueWei: BigInt(fee.feeWei),
        })
        push(`Fee tx ${feeHash}`)
        await waitReceipt(eth, feeHash)
      }

      push('6/6 swapExactETHForTokens…')
      const amountOutMin = (amountOut * 95n) / 100n
      const swapExec = encodeSwapExactAvaxForMarco({
        avaxIn: swapAvaxWei,
        to: address,
        deadline,
        amountOutMin,
      })
      const swapHash = await walletSendCallTransaction(eth, {
        from: address,
        to: AVAX_LIVE_SEED_ROUTER,
        data: swapExec.data,
        valueWei: swapExec.valueWei,
      })
      push(`Swap tx ${swapHash}`)
      await waitReceipt(eth, swapHash)

      push(
        JSON.stringify({
          pair,
          approveHash,
          liqHash,
          feeHash,
          swapHash,
          router: AVAX_LIVE_SEED_ROUTER,
          inputAvaxWei: swapAvaxWei.toString(),
          expectedOutWei: amountOut.toString(),
          amountOutMinWei: amountOutMin.toString(),
          gasEstimate: gasEstimate.toString(),
          gasPriceWei: gasPrice.toString(),
          feeWei: fee.feeWei,
        }),
      )
      push('Avalanche LIVE seed complete · pair + liquidity + fee + swap proven.')
    } catch (e) {
      if (isUserRejectedError(e)) push('Wallet rejected — no broadcast.')
      else push(e instanceof Error ? e.message.slice(0, 280) : 'Seed failed')
    } finally {
      setBusy(false)
    }
  }, [address, chainId, connector])

  return (
    <Card data-testid="founder-avalanche-live-seed">
      <Title>Avalanche LIVE · Founder seed</Title>
      <Note>
        Router {targets.router} is bound. Factory still needs a factual WAVAX–MARCO pair, real liquidity, fee
        settlement ({targets.feePercent}% estimated gas as {targets.feeAsset} → {targets.treasury}), and one
        controlled swap. Browser wallet only — no KMS, no auto-broadcast.
      </Note>
      <Actions>
        <Btn
          type="button"
          $primary
          disabled={busy || !isConnected}
          onClick={() => void runSeed()}
          data-testid="founder-avalanche-seed-cta"
        >
          Seed pair · liquidity · fee · swap
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
