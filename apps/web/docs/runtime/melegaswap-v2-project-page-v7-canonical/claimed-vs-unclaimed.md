# Claimed vs unclaimed — Project Page V7

## Claimed (`/@slug`)

Shows when available (factual only):

- Logo, name, symbol, chain
- Verified / Featured badges when factual
- Description (max 3 lines; omit if missing)
- Social icons when registry resources exist
- Full contract + Copy + Explorer + MetaMask
- Smart Swap (primary) + Official trust chip when ownership evidence exists
- Chart + market strip + economy + activity + Melega Score
- Growth Hub (CommercialCheckoutModal / ClaimProjectWizard)
- About / Links / Related (ProjectCard V3)

## Unclaimed (`/token/{chain}/{address}`)

Shows:

- Logo, name, symbol, chain from indexed token metadata
- Full contract + Copy + Explorer + MetaMask
- Smart Swap + **Claim Project** CTA
- Chart when pair history exists (else compact empty / swap expands)
- Market strip + economy (address-matched farms/pools)
- Activity / holders / score when factual; empty states otherwise

Does **not** show:

- Fake project description
- Fake socials
- Fake ownership / Official chip
