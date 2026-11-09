# RentRight Equipment Rentals API (practice sandbox v1.4)

A small REST API for an equipment-rental business: customers reserve items (excavators, mixers, scaffolds...), clerks hand them out and take them back, admins handle fees. It is **practice software with known and unknown defects**. Your job is to test it against the rules below.

Treat it as a black box. Test through Postman or Playwright. Reading `server.js` to find bugs is out of scope.

## Run it

```
node server.js            # port 4020 (set PORT to change)
GET http://localhost:4020/health      -> {"status":"ok","version":"1.4"}
POST http://localhost:4020/test/reset -> restores the seed data (tokens stay valid)
```

Needs Node.js 18 or newer. No `npm install`. Restart it any time you want a clean state.

**Sandbox-only helpers:** the header `X-Test-Now: 2026-11-05T12:00:00Z` overrides the server clock for that request (use it for time-based rules). A pre-expired token is available for testing: `tok-expired-demo`.

## Users (fictional)

| Username | Password | Role | Customer |
|---|---|---|---|
| admin | Admin#2026 | admin | |
| clerk1 | Clerk#2026 | clerk | |
| auditor1 | Audit#2026 | auditor | |
| ana | Ana#2026 | customer | C-1 |
| ben | Ben#2026 | customer | C-2 |

Items: I-1 Compact excavator 320.00/day · I-2 Concrete mixer 85.00 · I-3 Pressure washer 45.00 · I-4 Scaffold tower 60.00 · I-5 Generator 5kW 70.00.
Seed rentals R-1001 to R-1005 (see `GET /rentals` as admin). The seed "today" is about 2026-11-05.

## Endpoints

| Method and path | Who | Purpose |
|---|---|---|
| POST /auth/login | anyone | Get a token |
| GET /items | any logged-in user | Item catalog |
| GET /rentals?status= | any logged-in user | List rentals (customers see only their own) |
| POST /rentals | admin, clerk, customer | Reserve an item |
| GET /rentals/{id} | see G1 | One rental |
| PATCH /rentals/{id}/status | admin, clerk | Move a rental between statuses |
| POST /rentals/{id}/cancel | owner, admin, clerk | Cancel a reservation and compute the refund |
| POST /rentals/{id}/return | admin, clerk | Record the return and compute late fees |
| PATCH /rentals/{id}/late-fee | admin | Waive a late fee |
| GET /rentals/{id}/invoice | see G1 | Balance due |
| GET /reports/monthly?month=YYYY-MM | admin, auditor | Month totals |

Send the token as `Authorization: Bearer <token>`. Bodies are JSON.

## Business rules (the spec you test against)

Each rule has an id. Cite it in your bug reports.

**Access**
- **A1** Login with a wrong username or password returns 401. A missing field returns 400. Tokens last 30 minutes.
- **A2** A missing, invalid or expired token returns 401 on every endpoint except `/health`, `/auth/login` and `/test/reset`.
- **A3** A valid token that is not allowed to do the action returns 403.
- **A4** Roles. *admin*: everything. *clerk*: everything except waiving late fees. *auditor*: read-only (GET), including reports. *customer*: only their own rentals (read, create, cancel) and the item catalog.

**Create a rental (POST /rentals)**
- **C1** Body: `customerId`, `itemId`, `startDate` (YYYY-MM-DD), `days`. A missing field, or an unknown `itemId`, returns 400. A customer can create only for their own `customerId` (otherwise 403). An auditor gets 403.
- **C2** `days` is a whole number from 1 to 30. Anything else returns 422. A `startDate` that is not a real YYYY-MM-DD date returns 422.
- **C3** `startDate` cannot be before today's date **in the branch time zone (America/Chicago)**. Otherwise 422.
- **C4** The item must be free. Occupied dates are `startDate` through `startDate + days - 1`. Overlapping an existing Reserved or Active rental of the same item returns 409. Back-to-back bookings (one ends the day before the next starts) are allowed.
- **C5** `rentalTotal = dailyRate x days x (1 - discount)`, rounded to 2 decimals. Discount: 1-2 days 0%, 3-6 days 10%, 7-13 days 15%, 14-30 days 20%. `deposit` = 20% of `rentalTotal`, rounded to 2 decimals. New rentals start as `Reserved`. `dueAt` = `startDate + days` at 23:00 UTC.

**Status (PATCH /rentals/{id}/status)**
- **S1** Admin and clerk only. Allowed moves: Reserved to Active, Reserved to Cancelled. Returned and Cancelled are final. A rental becomes Returned only through `/return`. Any other move returns 409.
- **S2** An unknown or missing `status` value returns 422.

**Cancel (POST /rentals/{id}/cancel)**
- **X1** Only the owning customer, an admin or a clerk may cancel. Another customer gets 403. An auditor gets 403.
- **X2** Only `Reserved` rentals can be cancelled (otherwise 409).
- **X3** Refund of the deposit, by time before the start (the start is `startDate` 14:00 UTC): **48 hours or more: 100%**. 24 hours or more but under 48: 50%. Under 24: 0%. Response: `{id, status, refund}`.

**Return and late fees (POST /rentals/{id}/return)**
- **T1** Admin and clerk only. Body: `returnedAt` (ISO date-time). Missing or invalid returns 400. Only `Active` rentals can be returned (otherwise 409).
- **T2** There is a 2-hour grace period after `dueAt`. A return is late only if it is **strictly after** `dueAt + 2 hours`.
- **T3** `daysLate` = number of started 24-hour periods after the end of grace (a late return is at least 1). `lateFee = daysLate x 15% x dailyRate`, **counting at most 3 days**. Response: `{id, status, daysLate, lateFee}`.

**Waive a late fee (PATCH /rentals/{id}/late-fee)**
- **W1** Admin only. Body `{waive: true, reason}`. `reason` must be at least 5 characters, otherwise 422. The rental must be `Returned` with a late fee above 0, otherwise 409.

**Reading**
- **G1** A customer can read only their own rental and its invoice. Another customer's rental returns 403. An unknown id returns 404. Admin, clerk and auditor can read any.
- **I1** `GET /rentals/{id}/invoice` returns `{rentalId, rentalTotal, deposit, lateFee, balance, status}` where `lateFee` is 0 if waived and `balance = rentalTotal - deposit + lateFee`. It must always reflect the current state of the rental.
- **P1** `GET /reports/monthly?month=YYYY-MM` is for admin and auditor only. Performance target: 95th percentile under 300 ms with 10 concurrent users, error rate under 1%.

Anything the rules do not cover is a question for the product owner, not a defect. Write it down as a question.
