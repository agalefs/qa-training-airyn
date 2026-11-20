# POST /rentals omits the 10% multi-day discount on 3-day rentals (`days: 3`)

* **Title:** `POST /rentals` omits the 10% multi-day discount on 3-day rentals (`days: 3`)

* **Rule ID:** C5

* **Environment:** RentRight API Sandbox v1.4 (`http://localhost:4020`), User: `ana` (Role: `customer`, Customer ID: `C-1`)

* **Request:**

  * **Method & URL:** `POST {{baseUrl}}/rentals` (`http://localhost:4020/rentals`)

  * **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

  * **Body:**

    ```json
    {
      "customerId": "C-1",
      "itemId": "I-2",
      "startDate": "2026-11-21",
      "days": 3
    }
    ```

* **Expected:** Per README **Rule C5** (multi-day discount tiers: `3–6` days receive a 10% discount off the gross rental total `dailyRate * days`, and `deposit` is 20% of the discounted `rentalTotal`), renting `I-2` (`$85.00/day`) for `3` days must calculate:

  * Gross total: `$85.00 × 3 = $255.00`

  * Discounted `rentalTotal` (10% off): `$255.00 × 0.90 = 229.5`

  * `deposit` (20% of `rentalTotal`): `$229.50 × 0.20 = 45.9`

* **Actual:** The API returned HTTP `201 Created` (`7 ms`, `386 B`) with un-discounted `"rentalTotal": 255` (and `"deposit": 51`), failing to apply the 10% discount at the lower boundary of the `3–6` day tier.

* **Severity:** Medium

* **Priority:** P2

* **Evidence:**

  * Postman Collection Runner execution (`Day 4 - Postman`, `11:21:00 PM`) — request `POST Rentals - Day 3 - 10% discount` (`POST http://localhost:4020/rentals`)

  * Status & timing: `201 Created` (`7 ms`, `386 B`)

  * Failed assertion:

    * `POST /rentals passing case creates Reserved rental with C5 math | AssertionError: expected 255 to equal 229.5`

  * Follow-up verification:

    * `Follow-up GET /rentals/{id} confirms created rental exists` (`PASSED`, confirming the un-discounted rental was persisted)

* **Questions for the Product Owner:**

  * None for this specific rule; README **Rule C5** explicitly defines the `3–6` days tier as a 10% discount and specifies `deposit` as 20% of `rentalTotal`.