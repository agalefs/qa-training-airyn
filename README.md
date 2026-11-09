# Airyn de Gracia — QA training repo (FS Learning, training-plan-1)

Everything you produce in the plan lands here through pull requests. Nothing is pushed straight to `main`.

## Folder layout

| Folder | What goes in it | Days |
|---|---|---|
| `sandbox/` | RentRight Equipment Rentals API (seeded, run with `node server.js`, see its README) | 1, 4, 5, 6, 7, 9 |
| `test-design/` | Story cards (seeded) and your test designs, acceptance criteria, test strategy | 2, 3 |
| `postman/` | Your exported Postman collections and environments (JSON) | 1, 4, 5, 6 |
| `security/` | Your security charter and summary | 6 |
| `performance/` | Your load test script, raw results and report | 7 |
| `defects/` | Bug reports, defect pack (seeded), isolation notes, go/no-go memo | 5, 6, 8 |
| `playwright/` | Playwright starter (seeded) and your tests | 9 |
| `.github/workflows/` | CI workflow (a layout check is seeded; you extend it on Day 9) | 1, 9 |

## How a day's work gets in

1. Create a branch named for the day, for example `day-02-test-design` (GitHub web: branch dropdown, type a name, *Create branch*).
2. Add or upload your files on that branch (*Add file*, *Upload files* works fine until Day 9).
3. Open a pull request into `main`. Title it `Day N — <what>`, and paste the day's deliverable item id(s) in the description.
4. An AI reviewer posts first-pass feedback. Approved PRs are merged for you. You do not merge your own PRs.

From Day 9 you also use Git on your own machine (`git clone`, `git checkout -b`, `git add`, `git commit`, `git push`).

## Seeded material

Files that came with the repo on Day 1 are training material, not assessments. You can read them any time.
