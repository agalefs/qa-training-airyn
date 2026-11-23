# Title: Broken Function-Level Authorization (BFLA) Allowing Clerk to Waive Late Fees

- **Rule ID:** `SEC-06` / Rule `W1` (`Admin only` late-fee waiver on `Returned` rental with `lateFee > 0`)
- **Environment:** RentRight v1.4 Sandbox (`http://localhost:4020`)
- **Request:** `PATCH http://localhost:4020/rentals/R-1008/late-fee` with `Authorization: Bearer <clerkToken>` (`clerk1`) and JSON body `{"waive": true, "reason": "Testing clerk role on late fee waiver"}` on a `Returned` rental with `lateFee > 0`
- **Expected:** `403 Forbidden` (`Admin only` per Rule `W1`)
- **Actual:** `200 OK` (`214 B` response body returned in Postman Collection Runner)
- **Severity:** High
- **Evidence:** Postman Collection Runner execution of `SEC-06: Clerk attempts to waive late fee (403)` (`AssertionError: expected response to have status code 403 but got 200`) after creating `R-1008`, activating it, returning it past `dueAt` (`2026-12-20T10:00:00Z` after `2026-12-16T23:00:00.000Z`) so `status` was `Returned` and `lateFee > 0`, and calling the endpoint as `clerk1`.
