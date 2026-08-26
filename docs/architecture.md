# Architecture — Entry Vault v0.4

## System overview

Entry Vault is a **two-layer DeFi protocol**:

1. **Entry layer** — `EntryVault` (ERC-4626-style shares) accepts user deposits.
2. **Routing layer** — `YieldRouter` allocates capital to weighted strategies.
3. **Risk layer** — `IsolatedMarket` pools enforce per-asset collateral factors with no cross-asset contagion.

## Design principles

| Principle | Implementation |
|-----------|----------------|
| Isolation | Each market is a separate contract with independent utilization |
| Oracle boundary | `ChainlinkAdapter` enforces staleness checks |
| Circuit breaker | `PauseGuardian` + per-market pause flags |
| Audit surface | Invariant tests in `test/invariants/` |
| Economics | Node simulator v2 validates parameter choices before mainnet |

## Deployment topology (Q4 2026 target)

- **Ethereum** — primary vault + WETH/USDC markets
- **Arbitrum** — routed yield strategies + lower-cost operations

## Internal QA checklist (current stage)

- [x] Core contract suite v0.4
- [x] Foundry unit + fuzz tests
- [x] Invariant harness scaffold
- [x] Economic simulation v2
- [ ] External audit (August 2026)
- [ ] Mainnet deployment playbook
- [ ] Monitoring + alerting stack

## Node services

| Package | Purpose |
|---------|---------|
| `@entry-vault/simulator` | Monte-carlo style utilization / liquidation modeling |
| `@entry-vault/api` | REST surface for internal dashboards + integrators |
| `@entry-vault/cli` | Developer ergonomics (`entryvault sim run`) |
| `@entry-vault/shared` | Single source of truth for market params |
