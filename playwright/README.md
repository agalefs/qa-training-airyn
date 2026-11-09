# Day 9 — Playwright API test starter

```
cd playwright
npm install
node ../sandbox/server.js            # in a second terminal
npx playwright test                  # run everything
npx playwright show-report           # HTML report
```

No browsers are needed for API tests. Docs: https://playwright.dev/docs/intro and https://playwright.dev/docs/api-testing

Do **not** commit `node_modules/`, `playwright-report/` or `test-results/` (the repo's `.gitignore` excludes them).
