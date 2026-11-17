# RentRight v1.5 — Release Test Strategy

**Release:** RentRight v1.5 (Ships Friday in 2 weeks; coincides with **3-firm construction contractor pilot**)  
**Capacity:** 2 Testers × 4 Working Days = **8 Tester-Days (64 hours)** | **Baseline Volume:** ~400 rentals/week

---

## 1. Scope (In vs. Out)

* **In Scope:**
  * All 8 v1.5 release changes: `RR-520` damage charges + invoice updates (#1), contractor credit accounts + 5% discount (#2), checkout promo codes & non-stacking rules (#3), monthly per-item revenue report (#4), 5-day late-fee cap (#5), UI cancel countdown (#6), 24h email reminder (#7), and web framework minor upgrade (#8).
  * End-to-end financial integrity across quoting, checkout, return, invoicing, and reporting.
  * Risk-based regression of existing core flows (auth, inventory availability, standard pricing, lifecycle transitions).
* **Out of Scope (and Why):**
  * **Third-party card payment processing:** Handled externally by PCI-compliant processor; we verify our app sends/receives the right invoice totals and status callbacks, not gateway internals.
  * **Full 140-case manual regression suite:** Takes 1 tester 2 full days (25% of total capacity) with nothing automated. With 2 straight releases leaking customer-found pricing bugs, running blind low-risk UI checks wastes capacity needed for pricing/billing combinations and framework smoke checks. We will run a **curated ~55-case high-risk regression pack (1.5 tester-days)** instead.
  * **High-concurrency load testing (>400 rentals/week):** Volume is ~400 rentals/week (~8/hour); only targeted query timing on the Monthly Report (#4) is needed.

---

## 2. Risk Assessment Table

*Scoring: Likelihood (1–3) × Impact (1–3) = Risk Score (1–9). Weighted toward **pricing/billing** (2 prior releases leaked pricing bugs) and **contractor pilot readiness**.*

| Area / Change # | Likelihood (1–3) | Impact (1–3) | Score | Priority | Risk Rationale |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Contractor Credit & Pricing (#2, `RR-501`)** | 3 | 3 | **9** | **P1** | Touches core pricing used by every rental; directly impacts 3 launch pilot firms; recent history of pricing bugs. |
| **Damage Charge & Post-Rental Invoice (#1, `RR-520`)** | 3 | 3 | **9** | **P1** | New endpoint + invoice schema; first time charging money post-return; high risk of deposit/tax/rounding math errors. |
| **Promo Codes & Stacking Rules (#3)** | 3 | 3 | **9** | **P1** | Must strictly enforce single-code limit and **non-stacking** with contractor 5% discount; high revenue-leakage risk. |
| **Web Framework Minor Upgrade (#8)** | 2 | 3 | **6** | **P1** | Touches every endpoint, middleware, serialization, and auth session; silent breaking changes possible. |
| **Monthly Per-Item Revenue Report (#4)** | 2 | 3 | **6** | **P2** | Larger DB query used by admins/auditors at month-end; risk of timeout, double-counted damage/promo rows, or rounding drift. |
| **24h Pick-Up Email Reminder (#7)** | 2 | 2 | **4** | **P2** | Time zone / DST scheduling bugs or duplicate sends; uses existing email service. |
| **Late-Fee Cap 3 $\rightarrow$ 5 Days (#5)** | 1 | 3 | **3** | **P2** | XS constant + invoice text change, but wrong cap math directly over/under-bills overdue customers. |
| **UI Cancel Countdown (#6)** | 2 | 1 | **2** | **P3** | UI-only display timer; backend enforcement at 12:00 next day (`RR-502`) is unchanged. |

---

## 3. Test Approach & Effort Allocation (64 Hours Total)

| Test Type | Target Areas | Key Techniques & Coverage Focus | Allocation |
| :--- | :--- | :--- | :---: |
| **Functional & Financial Math** | #1 (`RR-520`), #2 (`RR-501`), #3 (Promos), #5 (Late fee) | **BVA** (days `6/7`, `13/14`, `30/31`; late days `3/5/6`; rounding `.xx5`), **DT** (contractor × days × promo × damage × deposit), **PW** (checkout options). | **35% (22 hrs)** |
| **API & Integration** | #1, #2, #3, #4, #7, #8 | Direct REST calls on new damage endpoint, framework upgrade smoke across all routes, time-zone cron triggers for 24h email (#7), invoice line-item schema. | **20% (13 hrs)** |
| **Risk-Based Regression** | #8 (Framework) + Core Flows | Curated 55-case pack covering standard pricing, lifecycle (`RR-502`), checkout (`RR-503`), and auth/session handling post-framework upgrade. | **20% (13 hrs)** |
| **Exploratory Testing** | #1, #2, #3, #6 | Time-boxed 90-min charters: promo + contractor stacking bypasses, post-return damage edits, stale UI tabs across 12:00 timeout & cancel countdown. | **15% (10 hrs)** |
| **Security & Performance** | #1, #4, #8 | Role/authz checks (non-clerk calling damage API; cross-contractor data access); Monthly Report (#4) query timing against prod-sized dataset. | **10% (6 hrs)** |

---

## 4. Entry, Exit, and "Not Done" Criteria

* **Entry Criteria (Must hold before Day 1 execution):**
  1. All 8 changes merged and deployed to Staging on the latest framework version (#8).
  2. Dana confirms `RR-520` acceptance criteria defaults (deposit offset, damage types, inventory status).
  3. Staging refreshed from Monday sanitized prod snapshot + test accounts/items seeded.
  4. Smoke test passes (login, quote creation, checkout, return, and report endpoint respond `200 OK`).
* **Exit Criteria (Release Readiness):**
  1. 100% of **P1** test cases executed; **0 open Critical/High (Sev 1–2) defects** (especially any pricing, invoice math, or contractor pilot blockers).
  2. $\ge 95\%$ of **P2** cases executed; all open Medium/Low defects triaged with documented workarounds signed off by PO.
  3. Curated regression pack passes with zero framework-upgrade regressions.
* **What "Not Done" Looks Like (No-Go Triggers):**
  * Any unresolved penny-rounding, tax, deposit-offset, or promo-stacking bug in pricing/invoicing.
  * Unverified framework upgrade impact on any production endpoint or background cron job.
  * Unconfirmed assumptions on `RR-520` accounting behavior or untested Monthly Report performance on full-volume data.

---

## 5. Environment & Test Data Needs (Pre-Start Checklist)

* **Environment:** Staging aligned with production configuration, email sandbox/sink enabled (to inspect 24h reminder headers/timestamps without spamming real users), and controllable system clock / job runner for 24h email (#7), 12:00 no-show (`RR-502`), and 5-day late-fee (#5) triggers.
* **Seed Data Required:**
  * **Users:** 2 Counter Clerks, 1 Store Manager, 1 Admin/Auditor (for Monthly Report #4).
  * **Customers:** 3 Pilot Contractor credit accounts (`contractor_credit = true`, `$0` deposit), 3 Standard retail accounts, 1 account with past-due balance.
  * **Inventory:** Light, Heavy, and Specialty items (`$85.00/day` and rounding-edge rates like `$33.50/day`) in `Available`, `Reserved`, `Active` (overdue 3, 5, and 6 days), and `Maintenance` states.
  * **Promos & History:** Active 10% and 20% promo codes, 1 expired promo code, and $\ge 1$ month of historical rental/damage records for Monthly Report (#4) volume testing.

---

## 6. Daily Reporting Plan

* **Audience:** Product Owner (Dana — Austin CST), Dev Lead, and QA Peers (posted async by **5:30 PM PHT / 3:30 AM CST** so Austin wakes up to a current status).
* **Format (Slack `#rentright-v15-release` + Test Tracker Link):**
  1. **Release Traffic Light (Green / Amber / Red)** + 1-sentence confidence summary for Friday launch & contractor pilot.
  2. **Execution Progress:** Planned vs. executed vs. passed/failed across P1/P2/P3 buckets.
  3. **Top Blockers & New Bugs:** Severity, affected change (#1–#8), financial/pilot impact, and owner needed.
  4. **Decisions / Unblocks Needed Today:** Specific questions for Dana or Dev Lead before next PHT morning.