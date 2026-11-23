# Title: Broken Object-Level Authorization (BOLA) on Reading Another Customer's Rental

- **Rule ID:** `SEC-01` (BOLA / Cross-Customer Object Ownership)
- **Environment:** RentRight v1.4 Sandbox (`http://localhost:4020`)
- **Request:** `GET http://localhost:4020/rentals/R-1007` with `Authorization: Bearer <anaToken>` (Customer `ana` / `C-1` requesting rental owned by Customer `ben` / `C-2`)
- **Expected:** `403 Forbidden` (cross-customer rental read is denied)
- **Actual:** `200 OK` (`380 B` response body returned in Postman Collection Runner)
- **Severity:** Critical
- **Evidence:** Postman Collection Runner execution of `SEC-01: Customer reads another customer's rental (403)` (`AssertionError: expected response to have status code 403 but got 200`) after seeding Customer Ben's (`C-2`) rental (`R-1007`) and authenticating as Customer Ana (`C-1`).
