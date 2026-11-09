# RentRight v1.5 — release candidate package (Day 8)

Build: 1.5.0-rc2 on staging. Planned release: **Friday**. Contractor pilot (3 firms) starts the Monday after. Marketing has announced the pilot.

## Test run summary (manual regression + new features)

| | Count |
|---|---|
| Planned | 142 |
| Passed | 118 |
| Failed | 7 |
| Blocked | 5 |
| Not run | 12 |

Not run: all 4 contractor-credit cases (test customer not set up on staging), 3 promo-code stacking cases, 5 cases for the new email reminder (timer needs a real 24 h wait).
Blocked: 5 damage-charge cases waiting on DEF-309.

Environments: staging (America/Chicago clock). Production runs UTC. Browsers: Chrome 120 for everything. No mobile devices. No automation.

## Open defects

| ID | Summary | Severity (as filed) | Status |
|---|---|---|---|
| DEF-301 | 3-day rentals get no discount | High | Open, fix ready, not merged |
| DEF-305 | A customer can cancel another customer's reservation | High | **Deferred** by the PM to 1.5.1 ("not customer-visible") |
| DEF-309 | Damage charge amount rounds to the wrong cent for some amounts | Medium | Open |
| DEF-311 | Reminder email time is 6 hours off for Texas customers | Medium | Open |
| DEF-314 | Monthly report with the new per-item breakdown takes 11 s | Medium | Open, not retested |
| DEF-317 | Promo code accepted twice on one rental | Medium | Open |
| DEF-320 | Invoice shows an old late fee after a waiver | Medium | Cannot Reproduce (closed by dev, no steps in ticket) |
| 5 others | Cosmetic or minor | Low | Open |

## Other evidence

- The web framework upgrade (change 8) was merged 2 days ago, after most regression cases ran.
- Performance: the last load test was for v1.2. The new report was not load tested.
- Security: access-control cases ran; 2 of them failed (see DEF-305).
- Data check run on staging by a teammate:

```sql
SELECT COUNT(*) AS bad_rows
FROM rentals
WHERE status = 'Returned' AND (late_fee >= 0 OR late_fee IS NULL);
-- Result: 0 rows
```

## Sign-off note from a teammate

> "All test cases passed except a few minor ones. Data check clean. I recommend releasing on Friday to keep the pilot on schedule."

## Stakeholders

Product manager (Priya, decision owner for release) wants Friday. The contractor firms sign their contracts when the pilot starts. The support lead says phone volume is already high from the late-fee complaints.
