# Day 7 — RentRight Monthly Report Load Test Report

## 1. Executive Summary & Recommendation (For Product Owner)

* **Release Decision:** **CONDITIONAL GO (Approved for release up to 20 concurrent users).**
* **Plain-English Summary:** Under expected normal traffic (**10 concurrent users**), the Monthly Report feature is fast and reliable—95% of report requests finish in **47 ms** (well under our **300 ms** target) with **zero errors**. It continues performing smoothly up to **20 concurrent users** (**43 ms** 95th-percentile response time). However, when traffic climbs to **32–40 concurrent users**, the server hits its processing ceiling (~25 requests/second) and requests begin queuing, pushing response times to **~600–660 ms** (over 2× slower than our 300 ms limit).
* **Conditions for Release:**
  1. **Safe to release now** if expected peak concurrency stays **at or below 20–25 concurrent users**.
  2. **Before marketing pushes or high-traffic month-end billing periods (>25 concurrent users):** Optimize the `/reports/monthly` query/caching and verify server worker/connection pool sizing so response times stay under 300 ms at 40+ concurrent users.
  3. **Follow-up validation required:** Re-test with realistic multi-month production data volumes (rather than small reset seed data) and a longer soak test (15–30 minutes).

---

## 2. Workload Model

The load test simulates authenticated administrators repeatedly viewing the monthly financial report on the RentRight API:

* **Test Setup (`setUp` Thread Group):** Executes `POST /test/reset` once prior to load generation to ensure a clean baseline database state.
* **Virtual User Flow (`Monthly Report Users` Thread Group):**
  1. **Authenticate (Once per VU):** `POST /auth/login` with JSON credentials (`admin`) to retrieve a Bearer JWT (`adminToken`).
  2. **Loop (`DURATION = 60s`):**
     * `GET /reports/monthly?month=2026-10` with `Authorization: Bearer ${adminToken}`.
     * **Assertions:** HTTP status `200` and response body contains `"month"`.
     * **Think Time:** Constant `1000 ms` (`1.0 s`) pause between iterations per virtual user.
* **Step-Load Profile (5 Independent Runs):**
  * **Step 1:** `1` user, `10s` ramp-up, `60s` duration (`step1-1u.jtl`)
  * **Step 2:** `5` users, `10s` ramp-up, `60s` duration (`step2-5u.jtl`)
  * **Step 3:** `10` users, `10s` ramp-up, `60s` duration (`step3-10u.jtl`) — **Rule P1 Target Load**
  * **Step 4:** `20` users, `10s` ramp-up, `60s` duration (`step4-20u.jtl`)
  * **Step 5:** `40` users, `10s` ramp-up, `60s` duration (`step5-40u.jtl`)

---

## 3. Test Setup

* **Target System:** RentRight API (`http://localhost:4020`), co-located on the same host as the load generator (`localhost`).
* **Load Testing Tool:** Apache JMeter `5.6.3` (Test Plan `version="1.2"`, `properties="5.0"`, HTTP implementation `HttpClient4` with Keep-Alive enabled).
* **Test Plan Script:** `day07-monthly-report-clean.jmx`
* **Test Data:** Clean reset state via `POST /test/reset`; static query parameter `month=2026-10` returning a `222-byte` HTTP `200 OK` response payload per request.
* **Pass/Fail Criteria (Rule P1):** At **10 concurrent users**, `GET /reports/monthly` must achieve **`p95 < 300 ms`** and **`error rate < 1%`**.

---

## 4. Results Table

### `GET /reports/monthly?month=2026-10` Across Concurrency Steps

| Step | Target Users | Samples | Full-Window Throughput (req/s) | Steady-State Throughput (`t ≥ 10s`, req/s) | Min (ms) | Median / p50 (ms) | Mean (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Max (ms) | Error Rate | Rule P1 (`p95 < 300ms`, `<1%` err) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Step 1** | 1 | 56 | 0.98 | 0.98 | 39 | 41.0 | 40.52 | 41.0 | 41.0 | 42.0 | 42 | 0.00% | N/A (Baseline) |
| **Step 2** | 5 | 260 | 4.51 | 4.83 | 39 | 40.0 | 41.66 | 41.0 | 43.0 | 88.4 | 132 | 0.00% | N/A (Warm-up) |
| **Step 3** | **10** | **515** | **8.96** | **9.68** | **39** | **40.0** | **41.49** | **42.6** | **47.0** | **79.9** | **91** | **0.00%** | **PASS** |
| **Step 4** | 20 | 1,031 | 17.77 | 19.18 | 39 | 40.0 | 41.21 | 42.0 | 43.0 | 77.1 | 99 | 0.00% | Within SLA |
| **Step 5** | 40 | 1,387 | 23.68 | 24.71 | 39 | 602.0 | 550.60 | 624.4 | 660.0 | 712.0 | 716 | 0.00% | **FAIL (Exceeds 300ms)** |

### Supporting Endpoints Summary

| Step | `POST /test/reset` (Count / Elapsed) | `POST /auth/login (Admin)` Count | Login Median (ms) | Login Mean (ms) | Login p95 (ms) | Login Max (ms) | Login Error Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Step 1 (1u)** | 1 / 4 ms | 1 | 3.0 | 3.00 | 3.0 | 3 | 0.00% |
| **Step 2 (5u)** | 1 / 5 ms | 5 | 3.0 | 4.00 | 6.6 | 7 | 0.00% |
| **Step 3 (10u)** | 1 / 5 ms | 10 | 4.0 | 11.60 | 45.0 | 45 | 0.00% |
| **Step 4 (20u)** | 1 / 5 ms | 20 | 4.0 | 7.85 | 44.0 | 44 | 0.00% |
| **Step 5 (40u)** | 1 / 4 ms | 40 | 40.5 | 105.03 | 512.4 | 609 | 0.00% |

---

## 5. Scaling & Saturation Progression (`step5-40u.jtl` Time-Series)

```text
Steady-State Throughput (req/s) vs. Virtual Users
 1u  | █ 0.98 req/s (p95: 41 ms)
 5u  | █████ 4.83 req/s (p95: 43 ms)
10u  | ██████████ 9.68 req/s (p95: 47 ms)   <-- Rule P1 Target (PASS)
20u  | ███████████████████ 19.18 req/s (p95: 43 ms)
40u  | █████████████████████████ 24.71 req/s (p95: 660 ms) <-- Saturated (~25 req/s ceiling)