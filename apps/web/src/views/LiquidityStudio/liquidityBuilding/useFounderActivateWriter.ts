/**
 * Browser-wallet writer for Founder LB canary:
 * createProgram → approve → depositBudget → activate
 */
import { useCallback, useMemo } from 'react'
import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { MaxUint256 } from '@ethersproject/constants'
import { useAccount } from 'wagmi'
import { useContract } from 'hooks/useContract'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { callWithEstimateGas } from 'utils/calls/estimateGas'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from './addresses'
import {
  ERC20_APPROVE_ABI,
  LB_FACTORY_WRITE_ABI,
  LB_PROGRAM_VIEW_ABI,
} from './abi/fragments'
import {
  buildCreateProgramArgs,
  canSubmitFounderWalletActivate,
  parseBudgetWei,
  resolveCanaryOrientation,
  runFounderActivateFlow,
  type FounderActivateResult,
  type FounderActivateWallet,
  type StrategyModeInput,
} from './founderActivateFlow'

const PROGRAM_CREATED_IFACE = new Interface([
  'event ProgramCreated(bytes32 indexed programId, address indexed owner, address indexed program, address projectToken, address quoteAsset, address pair, uint64 generation, bytes32 factoryVersion)',
])

export function useFounderActivateWriter() {
  const { address } = useAccount()
  const { callWithGasPrice } = useCallWithGasPrice()
  const factoryAddress = LB_DEPLOYED_ADDRESSES.lbFactory
  const factoryBound = isDeployedAddress(factoryAddress)

  const factory = useContract(
    factoryBound ? factoryAddress : undefined,
    LB_FACTORY_WRITE_ABI as unknown as any,
    true,
  )

  const buildWallet = useCallback((): FounderActivateWallet | null => {
    if (!factory || !address) return null
    const provider = factory.provider
    const signer = factory.signer
    if (!provider || !signer) return null

    return {
      createProgram: async (args) => {
        const methodArgs = [
          args.projectToken,
          args.quoteAsset,
          args.pair,
          [args.strategy.mode, args.strategy.minimumRateBps, args.strategy.maximumRateBps],
          args.epochDurationSeconds,
        ] as const
        return callWithEstimateGas(factory, 'createProgram', methodArgs as any)
      },
      approve: async (token, spender, amountWei) => {
        const erc20 = new Contract(token, ERC20_APPROVE_ABI, signer)
        return callWithGasPrice(erc20, 'approve', [spender, amountWei])
      },
      depositBudget: async (program, amountWei) => {
        const prog = new Contract(program, LB_PROGRAM_VIEW_ABI, signer)
        return callWithEstimateGas(prog, 'depositBudget', [amountWei] as any)
      },
      activate: async (program) => {
        const prog = new Contract(program, LB_PROGRAM_VIEW_ABI, signer)
        return callWithEstimateGas(prog, 'activate', [] as any)
      },
      readAllowance: async (token, owner, spender) => {
        const erc20 = new Contract(token, ERC20_APPROVE_ABI, provider)
        const allowance = await erc20.allowance(owner, spender)
        return allowance.toString()
      },
      parseProgramCreated: (receipt) => {
        for (const log of receipt.logs ?? []) {
          try {
            const parsed = PROGRAM_CREATED_IFACE.parseLog(log)
            if (parsed.name === 'ProgramCreated') {
              return {
                program: String(parsed.args.program),
                programId: String(parsed.args.programId),
              }
            }
          } catch {
            // not our event
          }
        }
        return null
      },
    }
  }, [factory, address, callWithGasPrice])

  const activateProgram = useCallback(
    async (input: {
      projectToken: string
      quoteAsset: string
      pair: string
      budgetHuman: string
      decimals: number
      strategyMode?: StrategyModeInput
      minimumRateBps?: number
      maximumRateBps?: number
      epochDurationSeconds?: number
      quoteEnabled: boolean
      correctChain: boolean
    }): Promise<FounderActivateResult> => {
      const gate = canSubmitFounderWalletActivate({
        walletConnected: Boolean(address),
        correctChain: input.correctChain,
        factoryBound,
      })
      if (!gate.ok) {
        return { ok: false, reason: gate.reason ?? 'GATE_BLOCKED', step: 'FAILED', txs: [] }
      }
      if (!address) {
        return { ok: false, reason: 'WALLET_NOT_CONNECTED', step: 'FAILED', txs: [] }
      }

      const orientation = resolveCanaryOrientation({
        projectToken: input.projectToken,
        quoteAsset: input.quoteAsset,
        quoteEnabled: input.quoteEnabled,
      })
      if (!orientation.ok) {
        return { ok: false, reason: orientation.reason, step: 'FAILED', txs: [] }
      }

      const args = buildCreateProgramArgs({
        projectToken: input.projectToken,
        quoteAsset: input.quoteAsset,
        pair: input.pair,
        strategyMode: input.strategyMode,
        minimumRateBps: input.minimumRateBps,
        maximumRateBps: input.maximumRateBps,
        epochDurationSeconds: input.epochDurationSeconds,
      })
      if ('error' in args) {
        return { ok: false, reason: args.error, step: 'FAILED', txs: [] }
      }

      const amountWei = parseBudgetWei(input.budgetHuman, input.decimals)
      if (!amountWei) {
        return { ok: false, reason: 'INVALID_BUDGET', step: 'FAILED', txs: [] }
      }

      const wallet = buildWallet()
      if (!wallet) {
        return { ok: false, reason: 'WALLET_WRITER_UNAVAILABLE', step: 'FAILED', txs: [] }
      }

      return runFounderActivateFlow({
        owner: address,
        createArgs: args,
        amountWei,
        projectToken: args.projectToken,
        wallet,
      })
    },
    [address, factoryBound, buildWallet],
  )

  return useMemo(
    () => ({
      factoryBound,
      activateProgram,
      maxApprove: MaxUint256.toString(),
    }),
    [factoryBound, activateProgram],
  )
}
