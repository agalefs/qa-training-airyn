# Day 9 — what would you automate first? (self-administered, no EM send)

The team has a manual regression suite of 140 cases. The cases below are a sample. For each one, you decide whether to automate it.

| # | Case | How often it runs | Stability of the feature | Notes |
|---|---|---|---|---|
| 1 | Price for every discount tier (1, 3, 7, 14 days) for 3 items | Every release | Stable | Pure arithmetic through the API |
| 2 | Customer A cannot read or cancel customer B's rental | Every release | Stable | Failed in production once last year |
| 3 | Cancel refund at 48, 24 and 23 hours before start | Every release | Stable | Uses a clock override |
| 4 | Late fee after grace period, and the cap | Every release | Stable | Clock override |
| 5 | A clerk picks an item up in the counter UI using a barcode scanner | Every release | Hardware dependent | Scanner reads USB input |
| 6 | The new damage-charge screen layout looks right on a tablet | Once | UI is still changing weekly | Visual check |
| 7 | Login, token expiry after 30 minutes | Every release | Stable | Takes 30 minutes in real time unless the clock is overridden |
| 8 | Monthly report numbers match a SQL total | Monthly | Stable | Needs a known data set |
| 9 | Exploratory session on the contractor flow | Once | New feature | Open-ended |
| 10 | Overlapping bookings of the same item | Every release | Stable | Several date combinations |

Pick **5 to automate first** and **2 you would never automate** (or not yet). For each pick, give the reasons (frequency, stability, business risk, cost to automate, recent failures). Put the answer in `playwright/AUTOMATION-CANDIDATES.md`.
