# SMARTSWAP_REVENUE_POLICY_V1

Canonical SmartSwap orchestration fee. **Shadow / non-production.**

SmartSwap is the routing product. It earns protocol revenue even when the winning venue is not Melega DEX.

The fee is **not** a Melega DEX LP fee, **not** the underlying venue fee, and **not** gas.

## Policy identity

- id: `SMARTSWAP_REVENUE_POLICY_V1`
- version: `1.0.0`
- max standard fee: **25 bps**
- target (venue structural + SmartSwap fee, excluding gas): **50 bps** (guidance, not a guarantee)
- minimum revenue: **DISABLED / OBSERVE_ONLY**

Hosts (DEX, Space, embeds) cannot override this policy.

Code: `apps/web/src/lib/smartswap-universal-engine/revenuePolicy.ts`
