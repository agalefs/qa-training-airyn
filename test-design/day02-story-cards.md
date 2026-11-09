# Day 2 story cards (self-administered, no EM send)

Write each design in its own file: `day02-RR-501.md`, `day02-RR-502.md`, `day02-RR-503.md`. Label **every** case with the technique that produced it (EP = equivalence partition, BVA = boundary value, DT = decision table, ST = state transition, PW = pairwise). Give each case an ID, preconditions that are specific (user, item, data, clock), steps, expected result, and a priority (P1 to P3).

---

## RR-501 Rental price and deposit

**As a** counter clerk **I want** the system to price a rental from the item's daily rate and the number of days **so that** I can quote the customer without a calculator.

Rules from the product owner:
- A rental is 1 to 30 whole days.
- Long rentals get a discount on the whole rental: 1-2 days none, 3-6 days 10%, 7-13 days 15%, 14-30 days 20%.
- **Contractor accounts** (credit accounts, flagged on the customer record) get an extra 5% off on top, only on rentals of 7 days or more. The two discounts add up (7+ days: 20% instead of 15%; 14+ days: 25% instead of 20%).
- The deposit is 20% of the discounted total.
- Money is rounded to 2 decimals, half up, after discount and again for the deposit.
- Contractor accounts on credit **do not pay a deposit** (deposit is 0.00).

Your task:
1. List the input partitions (valid and invalid) for days and for customer type.
2. Boundary-value cases for days (two-sided at every boundary, including the invalid ends) and for the rounding.
3. A decision table for discount % (conditions: days band, contractor yes/no, deposit yes/no) with every rule column and the expected total and deposit for a 85.00/day item.
4. **Time pressure:** you have 30 minutes before the release. Pick the 5 cases you would run first and give one line of risk reasoning each. Say what you are leaving unrun.

---

## RR-502 Rental lifecycle

States: **Reserved, Active, Returned, Cancelled.**
Events: **pick-up** (clerk hands the item over), **return** (clerk takes it back), **customer cancel**, **no-show timeout** (a Reserved rental not picked up by 12:00 on the day after its start date becomes Cancelled automatically, the deposit is forfeited).

Rules: Returned and Cancelled are final. A rental cannot be returned before it was picked up. A cancel after pick-up is not allowed (the customer must return the item instead).

Your task:
1. Draw the state-transition table: every state against every event, with the next state or "rejected (reason)". Mark each cell valid or invalid.
2. Design test cases that cover every valid transition once and **every invalid transition** (what response or behaviour do you expect?).
3. Name two sequences of 3 or more events that would catch a bug that single transitions cannot (for example, cancel then pick-up).

---

## RR-503 Checkout options

The checkout screen has four settings:

| Setting | Values |
|---|---|
| Item class | Light, Heavy, Specialty |
| Fulfilment | Pickup, Delivery |
| Payment | Card, Invoice, Cash |
| Customer | Retail, Contractor |

Constraint: **Heavy items cannot be paid in Cash.** There are 32 valid combinations. You have time for about 10 tests.

Your task: build a **pairwise** set that covers every valid pair of values at least once, without any invalid combination. State how many rows you used and show the pair-coverage check (which pairs each row covers, or a coverage table). Then add two rows you would run on top of the pairwise set and say why pairwise alone does not cover them.
