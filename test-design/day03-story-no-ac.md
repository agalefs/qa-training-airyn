# Day 3 story RR-520 (no acceptance criteria) — self-administered, no EM send

> **RR-520 Damage charge on return**
> As a counter clerk, I want to record damage when an item comes back and charge the customer for it, so that repair costs are covered.
>
> Notes from the product owner (Dana, based in Austin, Texas, replies within a day): "Clerks will pick the damage type and enter an amount. The customer sees the charge on the invoice. Keep it simple for the first release. We ship in two weeks."

There are no acceptance criteria. You are the tester joining the team today.

## Part 1 — Requirements

1. Write **6 to 10 proposed acceptance criteria** in Given/When/Then. Each must be testable, with a concrete value where one is needed.
2. Write a shareable **assumptions and questions log** (a table, 6 or more rows): Question or assumption · Why it matters · Risk if wrong (H/M/L) · Your proposed default · Who decides.
3. Write a **traceability map**: which of your test ideas covers which criterion, and which criteria have no test yet.
4. Write the **message you would send the product owner** proposing your criteria and asking her to confirm by a date. Written, under 150 words, no call. Dana is in Austin; you are in the Philippines.

## Part 2 — Test strategy for the release (one page)

Read `day03-release-change-list.md`. The release is **RentRight v1.5**. You have **2 testers and 4 working days**. Write a one-page test strategy in `test-design/day03-test-strategy.md` with:
- Scope in and out (and why)
- A risk table: area · likelihood · impact · test priority (a risk score you can defend)
- Test types you will use per area (functional, API, security, performance, regression, exploratory) and roughly how much time each gets
- Entry and exit criteria, including what "not done" looks like
- Environment and test data needs (what must exist before you start)
- What you will report daily and to whom
