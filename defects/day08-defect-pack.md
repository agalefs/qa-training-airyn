# Day 8 — defect pack (self-administered, no EM send)

## Part 1 — Severity and priority (45 min)

Rate each defect **severity** (how bad is the failure itself: Critical, High, Medium, Low) and **priority** (how soon should we fix it, given business context: Urgent, High, Medium, Low) **separately**, with a one-line reason each, and say **who confirms the priority** (you do not set it alone). Then pick the **two you would raise today** and write the message (Cliq-style, under 80 words each).

Context: RentRight has 14 branches. About 400 rentals a week. A contractor pilot starts in two weeks. Card payments are third party.

| # | Defect |
|---|---|
| 1 | The company name is misspelled ("RentRite") in the header of the invoice PDF every customer receives. |
| 2 | A logged-in customer can cancel another customer's reservation by changing the rental ID in the request. Found by a tester, not reported by any customer. |
| 3 | 3-day rentals are charged with no discount. The spec says 10%. Every 3-6 day rental is wrong in the first 2 days of the band. |
| 4 | The monthly report takes 9 seconds the first time it runs on the 1st of the month and 1 second afterwards. Used by 6 people. |
| 5 | Rentals returned just after midnight UTC are charged one late day too many. Customers have complained twice by phone. |
| 6 | On iPad Safari, the date picker defaults to last month. Only branch 9 uses iPads. Typing the date works. |
| 7 | The counter app freezes when the barcode scanner sends a trailing newline. It happens on every scan at branches 3 and 11. Clerks restart the app and type the code by hand, about 2 minutes per customer. |
| 8 | Two customers can reserve the same excavator if they book within the same second. Seen once in 6 months. Two customers arrived for the same machine. |

## Part 2 — Rewrite three bug reports (40 min)

Rewrite each report so a developer can act **without asking you anything**. Use: title, environment (build, user and role, browser or tool, time zone), steps with exact data, expected result (cite the rule), actual result, how often, evidence you would attach, scope (what else might be affected), severity.

**Report A**
> Cancel doesn't work. Please fix.

**Report B**
> Invoice is wrong sometimes. Customer called, they were not happy.

**Report C**
> Slow!!! Report page is unusable. Happens on my machine. Ticket 441.

## Part 3 — Isolate an intermittent defect (45 min)

In the sandbox, the invoice endpoint `GET /rentals/{id}/invoice` sometimes returns an amount that does not match the rental's current state. It does not fail every time. Using Postman (Console and Collection Runner) and `X-Test-Now` where needed:

1. List your hypotheses (at least 4) before you test anything.
2. Design the smallest experiments that separate them. Record each request and response.
3. State the **minimal reproduction**: the exact sequence of requests that triggers it every time, or the odds if it is not deterministic.
4. Write the bug report with your isolation notes. Say what you ruled out.

Save to `defects/day08/isolation-invoice.md` and export the Postman run.

## Part 4 — Release call (45 min)

Read `day08-release-package.md`. Write a one-page **go / no-go memo** `defects/day08/go-no-go-v1.5.md`:
- Tested vs not tested (say what the numbers mean, do not repeat them)
- Ranked risks, each with who is affected and how badly
- Your recommendation with conditions
- Two or three options for the product manager, with a trade-off for each
- Who owns the decision
- Your plan for the next hour after you send it
