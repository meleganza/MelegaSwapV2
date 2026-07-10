describe('R763B founder batch 2 copy guards', () => {
  it('liquidity studio panels avoid permanent Loading and Indexing labels in source', async () => {
    const fs = await import('fs')
    const path = await import('path')

    const files = [
      '../components/MarketIntelligencePanel.tsx',
      '../components/AILiquidityAdvisorPanel.tsx',
      '../components/TopPoolsPanel.tsx',
      '../liquidityRuntime/useLiquidityTerminalData.ts',
    ]

    for (const file of files) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8')
      expect(source).not.toMatch(/Loading top pools/i)
      expect(source).not.toMatch(/Loading pool metrics/i)
      expect(source).not.toMatch(/'Indexing'/)
    }
  })
})
