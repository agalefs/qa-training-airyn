# RentRight API (v1.4) One-Page Test Checklist
**Target:** `http://localhost:4020` | **Accounts:** `ana` (`customer`, `C-1`), `clerk1` (`clerk`), `admin` (`admin`) | **Rules:** C1–C5, G1, I1, S1, S2, X3, T2, T3

---

## 1. Pre-Run Setup & State Hygiene (Track 2)
- [ ] **Reset State First:** Execute `POST {{baseUrl}}/reset` at the start of every Collection Runner execution so seed data and IDs (`R-1001`, etc.) start cleanly.
- [ ] **Dynamic Auth & Scoped Tokens:** Authenticate via login requests (`ana`, `clerk1`, `admin`) and read active headers with `pm.request.headers.get("Authorization")` or role-specific environment tokens rather than hardcoding expired tokens.
- [ ] **Non-Colliding Positive Seed Data:** Assign distinct `itemId`s or non-overlapping `startDate` + `days` windows across positive `POST /rentals` tests (e.g., `I-2` starting `2026-11-21` for `3` days; `I-3` starting `2026-11-30` for `30` days) so earlier passing tests do not block later tests.
- [ ] **Save Before Running:** Confirm zero unsaved indicators on open Postman tabs/requests prior to running the collection.

---

## 2. Boundary & Input Validation — Rules C1–C3 (Track 1)
- [ ] **Duration Lower/Upper Boundaries (`days`):** Test `days: 0` (`422`), `days: 1` (`201`, 0% discount), `days: 30` (`201`, 20% discount), and `days: 31` (`422`).
- [ ] **Invalid Data Types & Missing Fields:** Send missing required fields (`customerId`, `itemId`, `startDate`, `days`), non-numeric/decimal `days` (e.g., `"3"` or `2.5`), and malformed `startDate` strings (e.g., `"2026-11-x1"`) -> verify `422` and no persisted rental.
- [ ] **Non-Existent Calendar Dates:** Test calendar-invalid dates such as `"2026-11-31"` and `"2026-02-29"` (non-leap year) -> verify `422` and follow-up `GET /rentals` shows no record created.

---

## 3. Pricing, Discounts & Overlap Logic — Rules C4–C5 (Track 1)
- [ ] **Multi-Day Discount Math (Rule C5):** Verify `rentalTotal` and `deposit` (`20%` of discounted `rentalTotal`) across tiers on known item rates (`I-2` = `$85/day`, `I-3` = `$45/day`):
  - `1–2` days: `0%` discount
  - `3–6` days: `10%` discount (e.g., `I-2` × `3` days -> gross `255`, `rentalTotal: 229.5`, `deposit: 45.9`)
  - `30` days: `20%` discount (e.g., `I-3` × `30` days -> gross `1350`, `rentalTotal: 1080`, `deposit: 216`)
- [ ] **Exact & Partial Date-Range Overlaps (Rule C4):** After a `201` booking on a target item (e.g., `I-2`, `2026-11-21`, `days: 3` -> Nov 21–23), attempt both an exact-start overlap and a partial-range overlap starting mid-window (e.g., `2026-11-22`, `days: 2`) -> verify `409 Conflict` and confirm via `GET /rentals` that no duplicate/overlapping booking was persisted.

---

## 4. Authorization, Lifecycle & Clock Rules — G1, I1, S1–S2, X3, T2–T3 (Track 1 + Track 2)
- [ ] **Role & Account Boundaries (G1, I1):** Verify forbidden actions across `customer` (`ana`), `clerk1`, and `admin` return `403` (or `401` when unauthenticated) and do not mutate state.
- [ ] **State Transitions & Cancellation/Return Rules (S1, S2, X3):** Verify invalid state transitions (e.g., returning a non-`Active` rental or cancelling outside allowed state/window) return `409` and leave rental status intact; verify valid transitions update status and invoice (`GET /rentals/{id}/invoice`) accurately.
- [ ] **Test Clock & Late Fee Caps (T2, T3):** When testing grace periods or late-return fee caps (e.g., `> 3` days late), align `X-Test-Now` / timestamps and target rental state, then verify both the action response and resulting invoice math.

---

## 5. Post-Run Triage & Defect Logging (Track 2)
- [ ] **Save IDs Before Value Assertions:** Store created IDs (e.g., `pm.environment.set("createdRentalId", rental.id)`) *before* price/business assertions so follow-up `GET /rentals/{id}` checks target the newly created record rather than stale IDs.
- [ ] **Wrap Async `pm.sendRequest` Assertions:** Always use `try { ... done(); } catch (e) { done(e); }` inside `pm.sendRequest` callbacks and pass a token authorized for the follow-up endpoint.
- [ ] **File One Defect per Sandbox Bug:** For each confirmed API discrepancy, log a report in `defects/day05/` containing **Title**, **Rule ID**, **Environment** (sandbox version, user, role), **Request**, **Expected** (citing README rule), **Actual**, **Severity**, **Priority**, and **Evidence**. Route unspecified edge cases to **Questions for the Product Owner** rather than guessing.