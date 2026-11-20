# POST /rentals accepts non-existent calendar date `2026-11-31`

* **Title:** `POST /rentals` accepts non-existent calendar date `2026-11-31` instead of rejecting with `422`

* **Rule ID:** C2

* **Environment:** RentRight API Sandbox v1.4 (`http://localhost:4020`), User: `ana` (Role: `customer`, Customer ID: `C-1`)

* **Request:**

  * **Method & URL:** `POST {{baseUrl}}/rentals` (`http://localhost:4020/rentals`)

  * **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

  * **Body:**

    ```json
    {
      "customerId": "C-1",
      "itemId": "I-5",
      "startDate": "2026-11-31",
      "days": 2
    }
    ```

* **Expected:** Per README **Rule C2**, `startDate` must be a valid calendar date formatted as `YYYY-MM-DD`, and invalid input values must be rejected with HTTP `422`. Because November has only 30 days, `2026-11-31` is a non-existent calendar date and must return HTTP `422` without creating a rental record.

* **Actual:** The API returned HTTP `201 Created` (`7 ms`, `386 B`), accepted `"startDate": "2026-11-31"` (rolling `dueAt` into December), and persisted the rental record in `GET /rentals`.

* **Severity:** Medium

* **Priority:** P2

* **Evidence:**

  * Postman Collection Runner execution (`Day 4 - Postman`, `11:21:00 PM`) — request `POST NEG Invalid date - Nov 31` (`POST http://localhost:4020/rentals`)

  * Status & timing: `201 Created` (`7 ms`, `386 B`)

  * Failed assertions:

    * `Non-existent calendar date returns 422 and fast response (C2) | AssertionError: expected response to have status code 422 but got 201`

    * `Follow-up GET /rentals confirms invalid date rental was not created | AssertionError: expected 1 to equal +0`

* **Questions for the Product Owner:**

  * Should invalid calendar dates such as `2026-11-31` or `2026-02-29` return a specific error message string in the `422` payload (e.g., `"startDate must be a valid calendar date"` vs. `"startDate must be YYYY-MM-DD"`), or is any descriptive `422` `error` message acceptable?