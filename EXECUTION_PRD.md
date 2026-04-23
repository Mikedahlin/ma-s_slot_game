# Lynne's Luxe Lights - Execution PRD

Version: v0.1  
Owner: Product + Engineering  
Status: Ready for planning sprint kickoff

## 1) Product Scope and Success

### Objective
Ship a mobile-first social casino slot app (virtual coins only) with premium Vegas-inspired presentation, AI-assisted content freshness, secure promo grants, and Stripe coin purchases.

### Non-negotiables
- Virtual coins only, no cash-out value.
- All grants/debits must be ledger-backed and auditable.
- Original IP only (brand/art/copy/mechanics names).
- Promo grants must be explicit, permissioned, and abuse-resistant.

### Launch KPIs
- D1 retention >= 35%
- D7 retention >= 16%
- Crash-free sessions >= 99.5%
- Purchase conversion (D30) >= 2.5%
- Promo abuse rate < 0.5% of redemptions

## 2) Personas and Jobs To Be Done

- **Primary Player (Lounge Explorer):** wants high-energy, low-friction fun, visual spectacle, and daily rewards.
- **Progression Player (Collector):** returns for events, missions, machine mastery, and cosmetic unlocks.
- **Value Player (Top-up Buyer):** buys virtual coin bundles for convenience and higher-intensity play sessions.
- **LiveOps Admin:** launches events/offers and tunes economy safely.
- **Support Admin:** resolves payment/promo/player issues with auditable controls.

## 3) MVP Feature Definition

### In Scope (MVP)
- Auth: Apple/Google/email + guest.
- Wallet and transaction ledger.
- 2 machines with original themes and 3 bonus types.
- Gameplay loop: spin -> result -> reward -> progression.
- Missions: daily + weekly.
- Store: Stripe checkout for virtual coin packs.
- Promo redemption: user-facing code input + admin-issued codes.
- Basic AI content layer: quest flavor + machine intro + event naming.
- Admin panel (minimum): promo creation + mission/event schedule + ledger lookup.

### Out of Scope (MVP)
- PvP multiplayer.
- Real-time tournaments with anti-cheat rank arbitration.
- Deep social graph/chat.
- Regionalized legal localization beyond baseline disclaimers.

## 4) System Requirements

### Functional
- User can register/login/logout and recover access.
- User receives welcome grant once.
- User can spin machines while wallet balance allows.
- Every coin change is stored in immutable ledger entries.
- Store purchases credit wallet only after verified webhook.
- Promo codes support single-use/multi-use/targeted + expiry + limits.
- AI content generation goes through moderation and fallback templates.

### Non-functional
- P95 spin resolution API < 350ms.
- P95 lobby load < 2.0s on 4G.
- Uptime target >= 99.9%.
- Idempotent payment and promo endpoints.
- Audit logs retained >= 18 months.

## 5) Architecture Baseline

- Frontend: Next.js (mobile-first web) + optional Capacitor shell.
- Backend: Node.js + TypeScript (Fastify/Nest-style modular services).
- DB: Postgres.
- Cache/queue: Redis.
- Payments: Stripe Checkout + webhooks.
- Auth: Clerk/Auth0/Firebase Auth.
- AI: Provider API with moderation layer + template library.
- Analytics: PostHog or Amplitude.
- Feature flags/experiments: Statsig/LaunchDarkly.
- Cloud: Railway/AWS/GCP (containerized services), CDN for static assets.

## 6) Security and Compliance Checklist

- [ ] JWT validation + secure session lifecycle.
- [ ] RBAC on admin routes.
- [ ] Webhook signature verification (Stripe).
- [ ] Idempotency keys for purchase and redemption routes.
- [ ] Velocity/rate limits for auth and promo redeem.
- [ ] Fraud heuristics: IP/device/account velocity.
- [ ] Audit trail for all admin operations.
- [ ] "Virtual currency only/no cash value/no cash-out" disclosure in UX and store.

## 7) Data Contracts (High Priority)

- `users`
- `wallets`
- `ledger_entries`
- `machines`
- `spins`
- `bonus_sessions`
- `missions`
- `events`
- `offers`
- `purchases`
- `promo_codes`
- `promo_redemptions`
- `ai_content_assets`
- `notifications`
- `audit_logs`

## 8) Jira Epic Plan (Ready To Create)

## EPIC A - Identity and Accounts
Goal: user can authenticate and maintain account identity.

Stories:
1. Social + email auth flow  
   - AC: login/signup works on mobile; guest upgrade preserves wallet.
2. Session and token lifecycle  
   - AC: refresh rotation and logout invalidation implemented.
3. Account profile basics  
   - AC: display name/avatar editable and validated.

## EPIC B - Wallet and Ledger
Goal: secure virtual coin accounting foundation.

Stories:
1. Wallet creation on signup  
   - AC: one wallet per user enforced by unique constraint.
2. Immutable ledger entries  
   - AC: every balance change has tx row with source/ref.
3. Balance reconciliation job  
   - AC: daily check flags mismatch and emits alert.

## EPIC C - Core Slot Gameplay
Goal: ship high-feedback spin loop with progression hooks.

Stories:
1. Machine config and reel outcome resolver  
   - AC: deterministic resolution from config + seed hash persisted.
2. Spin API with coin debit/credit transaction  
   - AC: atomic debit + payout + result persistence.
3. Bonus entry and completion flow  
   - AC: bonus session state tracked and resumable.

## EPIC D - UX, Motion, and Feedback
Goal: premium visual/audio slot feel.

Stories:
1. Mobile gameplay HUD and control ergonomics  
   - AC: touch targets pass mobile accessibility thresholds.
2. Win tier animations and haptics  
   - AC: distinct tiers (small, big, mega, jackpot-style) in UI.
3. Audio engine tuning  
   - AC: no clipping/static on target devices; volume normalized.

## EPIC E - Missions, Events, Progression
Goal: build daily return and long-term progression loop.

Stories:
1. Daily/weekly missions backend + claims  
   - AC: mission progress increments from spin events.
2. Event scheduler + rewards  
   - AC: event windows activate/deactivate automatically.
3. Progression pass (free track MVP)  
   - AC: XP milestones unlock rewards and persist state.

## EPIC F - Store and Stripe
Goal: secure virtual coin purchases.

Stories:
1. Offer catalog and SKU management  
   - AC: active offers served from backend config.
2. Stripe Checkout integration  
   - AC: successful payment credits wallet once.
3. Refund-aware adjustment handling  
   - AC: refund webhook posts compensating ledger entry.

## EPIC G - Promo Code Platform
Goal: secure admin-issued free coin grants.

Stories:
1. Promo code model and admin creation UI  
   - AC: supports single/multi/targeted with expiry/limits.
2. Redemption endpoint with fraud checks  
   - AC: ineligible/expired/limit reached paths are blocked.
3. Promo audit and reporting  
   - AC: full create/edit/redeem trail exportable.

## EPIC H - AI Content Layer
Goal: keep narrative/live-ops copy fresh and controlled.

Stories:
1. Prompt template registry  
   - AC: event names, quest flavor, machine intro templates versioned.
2. AI generation service with moderation  
   - AC: blocked outputs never publish to players.
3. Fallback and dedup logic  
   - AC: service outage still returns valid non-repetitive copy.

## EPIC I - Admin and LiveOps Console
Goal: operating system for content/economy safely.

Stories:
1. RBAC roles and permissions  
   - AC: actions gated by role, unauthorized actions denied.
2. Event/mission/offer controls  
   - AC: publish requires approval for high-impact changes.
3. Economy tuning controls with guardrails  
   - AC: bounds prevent extreme payout misconfiguration.

## EPIC J - Analytics, Experimentation, and Observability
Goal: run product scientifically and reliably.

Stories:
1. Event tracking schema implementation  
   - AC: all key events validated and visible in analytics.
2. Feature flag + A/B test framework  
   - AC: users deterministically assigned per experiment.
3. Runtime monitoring and alerting  
   - AC: alerting for API latency, error spikes, webhook failures.

## 9) Sprint-by-Sprint Execution (Template)

### Sprint 1-2
- EPIC A + B foundations
- Deliverable: auth + wallet + ledger baseline

### Sprint 3-4
- EPIC C + D core gameplay
- Deliverable: playable machine with polished baseline feedback

### Sprint 5-6
- EPIC E + F progression and store
- Deliverable: daily loop + Stripe purchase flow

### Sprint 7-8
- EPIC G + H promo + AI narrative
- Deliverable: secure promo grants + moderated AI content

### Sprint 9-10
- EPIC I + J admin + analytics hardening
- Deliverable: live-ops-ready beta candidate

## 10) Acceptance Gate for Beta

- [ ] Ledger is authoritative and reconciles.
- [ ] Purchase and promo flows are idempotent and audited.
- [ ] App passes performance and crash targets.
- [ ] AI outputs pass moderation and brand checks.
- [ ] Legal and disclosure copy approved.
- [ ] Admin can run at least one full live event end-to-end.

## 11) Resource Matrix

- Product: 1 PM
- Design: 1 product designer, 1 motion/sound designer (shared)
- Engineering: 2 frontend, 2 backend, 1 full-stack/platform
- QA: 1 automation + 1 manual
- Data: 1 analytics engineer (part-time)
- Ops: 1 live-ops producer (beta onward)

## 12) Risk Register

- **Economy inflation** -> mitigation: bounded config + experiment gates.
- **Payment duplication** -> mitigation: idempotency + webhook replay protection.
- **Promo abuse** -> mitigation: velocity checks + targeted code modes + audits.
- **AI brand drift** -> mitigation: template constraints + moderation + approval queue.
- **Performance decay on mid-tier phones** -> mitigation: budgeted effects, perf profiling.

## 13) Immediate Next Actions (This Week)

1. Decide final brand direction and visual style board.
2. Freeze MVP scope and create Jira project with Epics A-J.
3. Confirm stack and provisioning strategy.
4. Implement wallet + ledger schema migrations first.
5. Stand up Stripe sandbox and webhook test harness.
6. Build promo service with abuse controls before public launch.
7. Define analytics event schema and naming conventions.
8. Produce 2 machine vertical slices with full feedback stack.

