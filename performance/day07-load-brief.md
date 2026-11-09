# Day 7 — load brief (self-administered, no EM send)

**Situation.** At month end, about 5 admins and the auditor open the monthly report, and from v1.5 it also gets a per-item breakdown. Product wants to know if it will hold up. The rule is **P1** in the sandbox README: `GET /reports/monthly` should have a 95th-percentile response time under **300 ms** with **10 concurrent users**, and an error rate under **1%**.

**Test target.** Your own sandbox on `localhost:4020` (run it as in the README). This is a learning environment: your laptop runs both the server and the load tool, which is itself a finding to note.

## Tools

Use **Apache JMeter** if you can install it within 30 minutes (it needs Java). If you cannot, say so in your report and use Postman's Collection Runner with a large iteration count only as a fallback. Grafana k6 is also acceptable. State which you used.

## Your task

1. **Workload model (written first).** Who uses this endpoint, how often, with what think time, and what is the target load? State the assumptions. A load test without a workload model is not a test.
2. **Script.** Log in once per virtual user (or reuse one admin token), then call `GET /reports/monthly?month=2026-10`. Assert status 200 and that the body has `month`.
3. **Run a step test:** 1, 5, 10, 20 and 40 concurrent users, about 60 seconds each (ramp-up 10 s). For every step record: average, median, 95th percentile, maximum, throughput (requests per second), error rate.
4. **Analyse.** Where does the response time start to climb? At what load does throughput stop growing (the saturation point)? Does the result meet rule P1? What would you check on the server side if this were a real system (CPU, memory, database, logs)? What did you not test, and why does that matter?
5. **Report** in `performance/day07-load-report.md`: workload model, test setup (machine, tool version, data), the results table, a chart or the raw numbers file, findings ranked by impact, and a **recommendation in plain English** for the product owner (can we release, what condition). Commit the JMeter `.jmx` file (or the script) and the raw results.

## Rules for good evidence

- Run each step from a clean sandbox (`POST /test/reset`, restart if throughput looks odd) and say whether you discarded a warm-up.
- Never report an average alone. Show the 95th percentile and the error rate next to it.
- Say the conditions: same machine, one run or several, anything else running.
