# Title: Broken Object-Level Authorization (BOLA) on Canceling Another Customer's Rental

- **Rule ID:** `SEC-04` (BOLA / Cross-Customer Rental Cancellation)
- **Environment:** RentRight v1.4 Sandbox (`http://localhost:4020`)
- **Request:** `POST http://localhost:4020/rentals/R-1007/cancel` with `Authorization: Bearer <anaToken>` (Customer `ana` / `C-1` attempting to cancel rental owned by Customer `ben` / `C-2`)
- **Expected:** `403 Forbidden` (cross-customer rental cancellation is denied)
- **Actual:** `200 OK` (`211 B` response body returned in Postman Collection Runner)
- **Severity:** Critical
- **Evidence:** Postman Collection Runner execution of `SEC-04: Customer cancels another customer's rental (403)` (`AssertionError: expected response to have status code 403 but got 200`) after seeding Customer Ben's (`C-2`) rental (`R-1007`) and authenticating as Customer Ana (`C-1`).
