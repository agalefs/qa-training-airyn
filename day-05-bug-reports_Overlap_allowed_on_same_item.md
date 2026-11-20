# POST /rentals allows partial date-range overlap on an already reserved item

* **Title:** `POST /rentals` allows partial date-range overlap on an already reserved item instead of returning `409 Conflict`

* **Rule ID:** C4

* **Environment:** RentRight API Sandbox v1.4 (`http://localhost:4020`), User: `ana` (Role: `customer`, Customer ID: `C-1`)

* **Request:**

  * **Precondition (executed earlier in the same clean run after `POST /reset`):**

    * `POST {{baseUrl}}/rentals` with `{"customerId": "C-1", "itemId": "I-2", "startDate": "2026-11-21", "days": 3}` succeeded (`201 Created`), reserving item `I-2` across `2026-11-21`, `2026-11-22`, and `2026-11-23` in `Reserved` status.

  * **Method & URL:** `POST {{baseUrl}}/rentals` (`http://localhost:4020/rentals`)

  * **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

  * **Body:**

    ```json
    {
      "customerId": "C-1",
      "itemId": "I-2",
      "startDate": "2026-11-22",
      "days": 2
    }
    ```

* **Expected:** Per README **Rule C4**, an item cannot be booked for dates that overlap with an existing `Reserved` or `Active` rental on the same `itemId`, and any overlapping request must be rejected with HTTP `409 Conflict`. Because `I-2` is already `Reserved` for `2026-11-21` through `2026-11-23`, a request for `2026-11-22` through `2026-11-23` overlaps on `2026-11-22` and `2026-11-23` and must return HTTP `409`.

* **Actual:** The API returned HTTP `201 Created` (`7 ms`, `386 B`) and created a second overlapping reservation on `I-2` for `2026-11-22` (`days: 2`). *(Note: When tested earlier with an identical `startDate` to an existing booking, the endpoint returned `409`, indicating that overlap detection checks exact `startDate` equality rather than full `[startDate, startDate + days)` range intersection.)*

* **Severity:** High

* **Priority:** P1

* **Evidence:**

  * Postman Collection Runner execution (`Day 4 - Postman`, `11:21:00 PM`) — request `POST NEG Overlap days` (`POST http://localhost:4020/rentals`) following `POST Rentals - Day 3 - 10% discount`

  * Status & timing: `201 Created` (`7 ms`, `386 B`)

  * Failed assertion:

    * `Overlapping dates on same item return 409 and fast response (C4) | AssertionError: expected response to have status code 409 but got 201`

* **Questions for the Product Owner:**

  * Does README **Rule C4** treat rental date ranges as half-open intervals `[startDate, startDate + days)` (so a new rental starting on the previous rental's end/return date is allowed) or inclusive calendar days `[startDate, startDate + days - 1]` (requiring a 1-day buffer between bookings)?