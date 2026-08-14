import { describe, expect, it } from 'vitest'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  AUTHORIZED_MELEGA_DEPLOYER,
  assessFounderDeployGates,
  assessFounderGasReadiness,
  weiToBnb,
  WEI_PER_BNB,
  buildLbDeploySteps,
  activeLbStep,
  buildContractCreationRequest,
  resolveFounderOperationalState,
} from 'lib/deployment-orchestrator'
import { formatWeiToDecimal, toSafeBigInt, weiLte } from 'utils/safeBigInt'

const LOW_NATIVE_BALANCE = parseUnits('0.002', 'ether')
const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER
const WEB_SRC = path.resolve(__dirname, '../../..')

describe('wallet-connect BigInt safety (reproduction of production crash)', () => {
  it('reproduces TypeError: value.lte is not a function on wagmi bigint', () => {
    const value = BigInt('1000000000000000000')
    expect(() => {
      // historical WalletModal / WalletUserMenuItem path
      ;(value as unknown as { lte: (n: unknown) => boolean }).lte(LOW_NATIVE_BALANCE)
    }).toThrow(/lte is not a function/)
  })

  it('weiLte safely compares wagmi bigint to ethers parseUnits threshold', () => {
    expect(weiLte(BigInt('1000000000000000'), LOW_NATIVE_BALANCE)).toBe(true) // 0.001 < 0.002
    expect(weiLte(BigInt('5000000000000000'), LOW_NATIVE_BALANCE)).toBe(false) // 0.005 > 0.002
    expect(weiLte(null, LOW_NATIVE_BALANCE)).toBe(false)
  })

  it('formatWeiToDecimal never calls ethers BigNumber.mod', () => {
    expect(formatWeiToDecimal(WEI_PER_BNB, 6)).toBe('1')
    expect(formatWeiToDecimal(BigNumber.from(WEI_PER_BNB.toString()), 6)).toBe('1')
    expect(formatWeiToDecimal(undefined, 6)).toBe('0')
  })

  it('toSafeBigInt coerces ethers BigNumber before gas assessment', () => {
    const coerced = toSafeBigInt(BigNumber.from(WEI_PER_BNB.toString()))
    expect(coerced).toBe(WEI_PER_BNB)
    const gas = assessFounderGasReadiness({
      balanceWei: coerced,
      estimateStatus: 'pending',
    })
    expect(gas.balanceBnb).toBe('1')
    expect(gas.pauseCode).toBeNull()
  })
})

describe('disconnected → connected transition (no Error Boundary)', () => {
  it('disconnected assess path does not require balance and does not throw', () => {
    const gates = assessFounderDeployGates({
      connectedWallet: null,
      chainId: 56,
      balanceWei: null,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(gates.codes).toContain('WALLET_DISCONNECTED')
    const gas = assessFounderGasReadiness({ balanceWei: null, estimateStatus: 'pending' })
    const state = resolveFounderOperationalState({
      gates,
      gas,
      artifactStatus: 'ARTIFACTS_VALID',
    })
    expect(state).toBe('CONNECT_WALLET')
  })

  it('connect transition with delayed balance then gas estimate stays typed/safe', () => {
    const gates1 = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 56,
      balanceWei: null,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    const gas1 = assessFounderGasReadiness({ balanceWei: null, estimateStatus: 'pending' })
    expect(resolveFounderOperationalState({ gates: gates1, gas: gas1, artifactStatus: 'ARTIFACTS_VALID' })).toBe(
      'GAS_ESTIMATE_PENDING',
    )

    const balance = WEI_PER_BNB + WEI_PER_BNB
    const gas2 = assessFounderGasReadiness({ balanceWei: balance, estimateStatus: 'pending' })
    expect(gas2.balanceBnb).toBe('2')
    expect(gas2.pauseCode).toBeNull()

    const cost = BigInt('10000000000000000')
    const gas3 = assessFounderGasReadiness({
      balanceWei: balance,
      estimateStatus: 'ready',
      estimatedTotalCostWei: cost,
      gasPriceWei: BigInt('3000000000'),
      perTx: [
        {
          stepId: 'LiquidityBuildingExecutionMathV1',
          contractName: 'LiquidityBuildingExecutionMathV1',
          gasUnits: '100000',
          gasPriceWei: '3000000000',
          costWei: cost.toString(),
          costBnb: weiToBnb(cost),
        },
      ],
    })
    expect(gas3.fundingSufficient).toBe(true)
    expect(
      resolveFounderOperationalState({
        gates: gates1,
        gas: gas3,
        artifactStatus: 'ARTIFACTS_VALID',
      }),
    ).toBe('READY_TO_DEPLOY')
  })

  it('gas estimation rejection becomes unavailable — never FUNDING_REQUIRED', () => {
    const gas = assessFounderGasReadiness({
      balanceWei: WEI_PER_BNB,
      estimateStatus: 'unavailable',
      error: 'eth_estimateGas failed',
    })
    expect(gas.pauseCode).toBeNull()
    expect(gas.message).toMatch(/unavailable/i)
  })

  it('wrong wallet / wrong chain become UI codes, not exceptions', () => {
    const wrongWallet = assessFounderDeployGates({
      connectedWallet: '0x1111111111111111111111111111111111111111',
      chainId: 56,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(wrongWallet.codes).toContain('WRONG_WALLET')

    const wrongChain = assessFounderDeployGates({
      connectedWallet: DEPLOYER,
      chainId: 1,
      artifactValid: true,
      constructorValid: true,
      subsystemReady: true,
    })
    expect(wrongChain.codes).toContain('WRONG_CHAIN')
  })

  it('Step 1 creation request remains deployable after connect (no broadcast)', () => {
    const built = buildLbDeploySteps({})
    const step = activeLbStep(built.steps, [])
    expect(step?.contractName).toBe('LiquidityBuildingExecutionMathV1')
    expect(step?.deploymentData?.startsWith('0x')).toBe(true)
    const req = buildContractCreationRequest({
      from: DEPLOYER,
      data: step!.deploymentData!,
      gasUnits: BigInt('500000'),
    })
    expect(req).toMatchObject({
      from: DEPLOYER,
      data: step!.deploymentData,
      value: '0x0',
    })
    expect(req).not.toHaveProperty('to')
  })
})

describe('source guards — no ethers .lte on wagmi balance', () => {
  it('WalletModal and WalletUserMenuItem use weiLte, not value.lte', () => {
    const modal = readFileSync(path.join(WEB_SRC, 'components/Menu/UserMenu/WalletModal.tsx'), 'utf8')
    const item = readFileSync(path.join(WEB_SRC, 'components/Menu/UserMenu/WalletUserMenuItem.tsx'), 'utf8')
    const info = readFileSync(path.join(WEB_SRC, 'components/Menu/UserMenu/WalletInfo.tsx'), 'utf8')
    expect(modal).toContain('weiLte')
    expect(modal).not.toMatch(/data\.value\.lte\(/)
    expect(item).toContain('weiLte')
    expect(item).not.toMatch(/data\.value\.lte\(/)
    expect(info).toContain('formatWeiToDecimal')
    expect(info).not.toMatch(/formatBigNumber\(nativeBalance/)
  })

  it('FounderDeploymentShell coerces balance and guards provider promises', () => {
    const shell = readFileSync(
      path.join(WEB_SRC, 'views/DeploymentOrchestrator/FounderDeploymentShell.tsx'),
      'utf8',
    )
    expect(shell).toContain('toSafeBigInt')
    expect(shell).toContain('providerStatus')
    expect(shell).toContain('LOADING BALANCE')
    expect(shell).toMatch(/getProvider\(\)/)
    expect(shell).toContain("typeof (fromConnector as { then?: unknown }).then")
  })
})
