import { test, expect } from '@playwright/test';
import { login, bearer, resetData } from './helpers';

// ---- Worked examples (read these, run them, then write the TODOs below) ----

test.describe('worked examples', () => {
  test.beforeEach(async ({ request }) => resetData(request));

  test('health check answers ok', async ({ request }) => {
    const res = await request.get('/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  test('no token returns 401', async ({ request }) => {
    const res = await request.get('/rentals');
    expect(res.status()).toBe(401);
  });

  test('a clerk can book an item and the rental is stored', async ({ request }) => {
    const token = await login(request, 'clerk');
    const create = await request.post('/rentals', {
      headers: bearer(token),
      data: { customerId: 'C-1', itemId: 'I-3', startDate: '2027-01-10', days: 2 },
    });
    expect(create.status()).toBe(201);
    const rental = await create.json();
    expect(rental.status).toBe('Reserved');
    expect(rental.rentalTotal).toBe(90); // 45.00 x 2 days, no discount

    // follow-up GET: confirm the state really changed, not only the response
    const read = await request.get(`/rentals/${rental.id}`, { headers: bearer(token) });
    expect(read.status()).toBe(200);
    expect((await read.json()).deposit).toBe(18);
  });
});

// ---- TODO 1: days boundary (rule C2) ----
// Data-driven test: for days = 0, 1, 30, 31 assert 422 / 201 / 201 / 422.
// Use a different startDate per booking so the item availability rule (C4) does not interfere.
// If a case fails because of a sandbox defect, keep the README assertion, mark the test with
// test.fail() and link your bug report in a comment. Do not skip it or change the expected value.

// ---- TODO 2: discount tiers (rule C5) ----
// For item I-2 (85.00 per day), assert rentalTotal for days = 1, 3, 6, 7, 13, 14.
// Work the expected values out from the README, not from what the API returns.

// ---- TODO 3: another customer's rental (rule G1) ----
// Log in as ben (C-2). GET /rentals/R-1001 (belongs to C-1) must return 403.
// Then the same for POST /rentals/R-1001/cancel (rule X1). Use resetData first.

// ---- TODO 4: cancel refund boundary (rule X3) ----
// R-1005 starts 2026-11-12 at 14:00 UTC with deposit 14.00.
// Send the cancel with header X-Test-Now set to exactly 48 hours before, and 47h59m before.
// Expect refund 14 and 7. Use resetData between the two calls.
