# RentRight v1.5 — change list (for the Day 3 test strategy)

Release date: Friday in two weeks. Business context: a contractor pilot with 3 construction firms starts the same week. Contractors rent heavy equipment for 7-30 days on credit accounts.

| # | Change | Dev size | Notes from dev lead |
|---|---|---|---|
| 1 | Damage charge on return (RR-520): clerk records damage and an amount, shown on the invoice | M | New endpoint plus invoice change. First time we charge money after the rental ended |
| 2 | Contractor credit accounts: no deposit, extra 5% on 7+ days (RR-501) | L | Touches pricing, which every rental uses. New customer flag |
| 3 | Promo codes at checkout | M | Percent-off codes, one per rental, cannot stack with contractor discount |
| 4 | Monthly report: add a per-item revenue breakdown | S | Same endpoint as today, bigger query. Admins and the auditor run it at month end |
| 5 | Late-fee cap raised from 3 days to 5 days | XS | One constant, plus the invoice text |
| 6 | Customer cancel window shown in the UI as a countdown | S | UI only, backend rule unchanged |
| 7 | New "Reserved items" email reminder 24 h before pick-up | M | Uses the existing email service. Time zones matter |
| 8 | Upgrade the web framework to the next minor version | M | No functional change intended. Touches every endpoint |

Production facts: about 400 rentals a week. Card payments are handled by a third party and are out of scope. The last two releases each shipped one pricing bug that was found by a customer. There is a regression suite of 140 manual cases that takes one tester about 2 days. Nothing is automated yet. A staging environment exists, refreshed from a sanitized copy of production every Monday.
