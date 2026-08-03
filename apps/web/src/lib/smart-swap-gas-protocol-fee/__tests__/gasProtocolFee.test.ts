import { describe, expect, it } from 'vitest'
import { MELEGA_TREASURY_FEE_DESTINATION, SMART_ROUTER_FEE_FROM_SCHEDULE } from 'config/constants/feeSchedule'
import {
  SMART_ROUTER_GAS_PROTOCOL_FEE_BPS,
  calculateSmartRouterGasProtocolFee,
  formatFeeWeiAsBnb,
  isCanonicalTreasuryRecipient,
  buildGasProtocolFeeSettlementPlan,
} from '../index'

describe('Smart Swap gas protocol fee (Founder 25%)', () => {
  it('matches Founder schedule 2500 bps of DEX gas fees', () => {
    expect(SMART_ROUTER_FEE_FROM_SCHEDULE.kind).toBe('percent_of_dex_gas_fees')
    expect(SMART_ROUTER_FEE_FROM_SCHEDULE.bps).toBe(2500)
    expect(SMART_ROUTER_GAS_PROTOCOL_FEE_BPS).toBe(2500)
  })

  it('calculates feeWei = gasUnits * gasPrice * 25%', () => {
    // 200_000 gas * 5 gwei = 1_000_000_000_000_000 wei gas cost
    // 25% = 250_000_000_000_000 wei
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 200_000,
      gasPriceWei: 5_000_000_000,
    })
    expect(fee.estimatedGasCostWei).toBe('1000000000000000')
    expect(fee.feeWei).toBe('250000000000000')
    expect(fee.percent).toBe(25)
    expect(fee.bps).toBe(2500)
    expect(fee.feeAsset).toBe('BNB')
    expect(fee.finalizedAtConfirmation).toBe(true)
    expect(fee.refundAllowed).toBe(false)
    expect(fee.laterAdjustmentAllowed).toBe(false)
  })

  it('routes fee exclusively to MELEGA TREASURY WALLET', () => {
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: '180000',
      gasPriceWei: '3000000000',
    })
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
    expect(fee.recipient).toBe(MELEGA_TREASURY_FEE_DESTINATION)
    expect(isCanonicalTreasuryRecipient(fee.recipient)).toBe(true)
    expect(isCanonicalTreasuryRecipient('0x0000000000000000000000000000000000000001')).toBe(false)
  })

  it('builds settlement transfer with empty calldata (native value only)', () => {
    const plan = buildGasProtocolFeeSettlementPlan({
      gasEstimateUnits: 220_000,
      gasPriceWei: '1000000000',
    })
    expect(plan.transfer.to).toBe(MELEGA_TREASURY_FEE_DESTINATION)
    expect(plan.transfer.data).toBe('0x')
    expect(plan.transfer.value).toBe(plan.fee.feeWei)
    expect(plan.display.protocolFeeLabel).toBe('25% of estimated gas (BNB)')
    expect(plan.display.destinationLabel).toContain('MELEGA TREASURY WALLET')
    expect(plan.display.destinationLabel).toContain(MELEGA_TREASURY_FEE_DESTINATION)
  })

  it('formats fee as BNB for preview', () => {
    expect(formatFeeWeiAsBnb('250000000000000')).toBe('0.00025')
    expect(formatFeeWeiAsBnb('0')).toBe('0')
  })

  it('does not depend on Treasury Runtime or KERL', () => {
    const src = [
      calculateSmartRouterGasProtocolFee.toString(),
      buildGasProtocolFeeSettlementPlan.toString(),
    ].join('\n')
    expect(src).not.toMatch(/treasury\.melega\.ai/i)
    expect(src).not.toMatch(/Treasury Runtime/i)
    expect(src).not.toMatch(/kerl/i)
  })

  it('floors fractional wei (no overcharge via rounding up)', () => {
    // 1 * 3 * 2500 / 10000 = 0 (floor)
    const fee = calculateSmartRouterGasProtocolFee({ gasEstimateUnits: 1, gasPriceWei: 3 })
    expect(fee.feeWei).toBe('0')
  })

  it('settles Base fee as native ETH to the same treasury (25% economics unchanged)', () => {
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 200_000,
      gasPriceWei: 5_000_000_000,
      chainId: 8453,
    })
    expect(fee.feeAsset).toBe('ETH')
    expect(fee.chainId).toBe(8453)
    expect(fee.feeWei).toBe('250000000000000')
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
    const plan = buildGasProtocolFeeSettlementPlan({
      gasEstimateUnits: 200_000,
      gasPriceWei: 5_000_000_000,
      chainId: 8453,
    })
    expect(plan.display.protocolFeeLabel).toContain('ETH')
  })

  it('rejects unsupported fee chains', () => {
    expect(() =>
      calculateSmartRouterGasProtocolFee({ gasEstimateUnits: 1, gasPriceWei: 1, chainId: 999 }),
    ).toThrow(/No canonical fee beneficiary|unsupported/i)
  })

  it('settles Polygon fee as native POL to the same treasury (25% economics unchanged)', () => {
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 200_000,
      gasPriceWei: 5_000_000_000,
      chainId: 137,
    })
    expect(fee.feeAsset).toBe('POL')
    expect(fee.chainId).toBe(137)
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })

  it('settles Ethereum fee as native ETH to the same treasury (25% economics unchanged)', () => {
    const fee = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 200_000,
      gasPriceWei: 5_000_000_000,
      chainId: 1,
    })
    expect(fee.feeAsset).toBe('ETH')
    expect(fee.chainId).toBe(1)
    expect(fee.percent).toBe(25)
    expect(fee.recipient.toLowerCase()).toBe('0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b')
  })
})
