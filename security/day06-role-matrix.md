# Day 6 — RentRight access model (self-administered, no EM send)

Use this with `sandbox/README.md` (rules A1 to A4, G1, X1, S1, W1). Run everything against the sandbox with Postman.

## What each role is meant to do

| Action | admin | clerk | auditor | customer (own) | customer (someone else's) |
|---|---|---|---|---|---|
| List items | yes | yes | yes | yes | n/a |
| List rentals | all | all | all | own only | n/a |
| Read a rental / invoice | yes | yes | yes | yes | **no (403)** |
| Create a rental | yes | yes | no | yes (own customerId only) | **no (403)** |
| Change status | yes | yes | no | no | no |
| Cancel | yes | yes | no | yes | **no (403)** |
| Record a return | yes | yes | no | no | no |
| Waive a late fee | yes | **no** | no | no | no |
| Monthly report | yes | no | yes | no | no |

## Your task

1. **Charter and design (45 min).** Write a security test charter in `security/day06-security-charter.md`: scope, assets worth protecting (money, other customers' data, audit trail), threats, and at least **16 test cases** grouped under these headings: broken object-level authorization (changing IDs), broken function-level authorization (role vs action), authentication and token handling, input and error handling (what does an error reveal?), and one resource-consumption idea. Give each case an expected status code and a severity (Critical, High, Medium, Low) with a one-line reason.
2. **Execute (90 min).** Build the cases in Postman under `postman/day06-security.json` and run them. Use the `X-Test-Now` header where time matters. Record pass or fail for each.
3. **Report.** One bug report per distinct finding in `defects/day06/` (title, rule id, environment, request, expected, actual, severity, evidence). Also list **observations** that are not rule violations (things the spec is silent about) as questions for the product owner.
4. **One-page summary** `security/day06-summary.md` for a non-technical product owner: what is exposed, what an attacker or a curious customer could do, and what you recommend before launch. Under 250 words.

Look at the token you get from login. Does its shape tell you anything?
