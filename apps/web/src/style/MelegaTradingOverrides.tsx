import { createGlobalStyle } from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

/** Epic C — core trading & earn surface presentation overrides. */
const MelegaTradingOverrides = createGlobalStyle`
  /* Swap / liquidity card shells */
  [class*='BodyWrapper'],
  [data-melega-trading-card='true'] {
    border: 1px solid ${tokens.border} !important;
    border-bottom: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radiusLg} !important;
    background: ${tokens.surface} !important;
    box-shadow: none !important;
    overflow: hidden;
  }

  /* Inner swap header strip */
  [class*='HeaderWrapper'] {
    border-color: ${tokens.border} !important;
    border-bottom: 1px solid ${tokens.border} !important;
    background: ${tokens.surfaceSecondary} !important;
  }

  /* Token input panels */
  [class*='InputPanel'] [class*='Container'],
  [class*='CurrencyInputPanel'] > div {
    background: ${tokens.surfaceSecondary} !important;
    border: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radiusSm} !important;
  }

  /* Farm / pool legacy white-border cards */
  [class*='StyledCard'] {
    border: 1px solid ${tokens.border} !important;
    border-bottom: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radius} !important;
    background: ${tokens.surface} !important;
  }

  /* Farm table — card-like rows on mobile */
  @media (max-width: 967px) {
    #farms-table table,
    .FarmTable table {
      display: block;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 12px;
    }

    #farms-table tbody,
    .FarmTable tbody {
      display: block;
      width: 100%;
    }

    #farms-table tr,
    .FarmTable tr {
      display: block;
      width: 100%;
      margin-bottom: 12px;
      border: 1px solid ${tokens.border};
      border-radius: ${tokens.radius};
      background: ${tokens.surface};
      padding: 4px 0;
    }

    #farms-table td,
    .FarmTable td {
      display: block;
      width: 100% !important;
      border: none !important;
      padding: 8px 16px !important;
    }

    #farms-table thead,
    .FarmTable thead {
      display: none;
    }
  }

  /* Pool table mobile spacing */
  @media (max-width: 967px) {
    [class*='PoolsTable'] tr {
      border-bottom: 1px solid ${tokens.border};
    }
  }

  /* Swap arrow control */
  [class*='ArrowWrapper'] {
    border-radius: 50%;
    background: ${tokens.surfaceSecondary};
    border: 1px solid ${tokens.border};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
  }

  /* Neutralize legacy purple/teal in trading modals */
  [class*='RouterViewer'] [class*='CurrencyLogoWrapper'],
  [class*='CurrencyLogoWrapper'] {
    background: linear-gradient(180deg, ${tokens.goldHighlight} 0%, ${tokens.gold} 100%) !important;
  }

  /* Earn section subtitles */
  [data-melega-earn-section='true'] h2 {
    font-family: ${tokens.fontDisplay};
    font-size: clamp(18px, 2.5vw, 22px);
    font-weight: 600;
    color: ${tokens.text};
    margin: 8px 0 4px;
  }

  [data-melega-earn-section='true'] p[data-section-subtitle] {
    margin: 0 0 16px;
    font-size: 15px;
    color: ${tokens.textSecondary};
  }

  /* MARCO staking highlight */
  [data-melega-marco-highlight='true'] {
    border: 1px solid ${tokens.borderGold};
    border-radius: ${tokens.radius};
    background: ${tokens.surfaceSecondary};
    padding: 16px 20px;
    margin-bottom: 16px;
    font-size: 15px;
    color: ${tokens.text};
  }

  [data-melega-marco-highlight='true'] strong {
    color: ${tokens.gold};
    font-weight: 600;
  }

  /* Liquidity position cards */
  [class*='PositionCard'],
  [class*='FullPositionCard'] {
    border: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radiusSm} !important;
    background: ${tokens.surfaceSecondary} !important;
  }

  /* Trading page bottom safe area */
  [data-melega-trading-page='true'] {
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }
`

export default MelegaTradingOverrides
