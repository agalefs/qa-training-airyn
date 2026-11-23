# Security Testing Summary - RentRight v1.4

Hi team, here is a quick summary of what I found during my security testing of RentRight v1.4:

### What Is Exposed

Right now, our system does not properly verify **who owns a rental** or **who has permission to waive fees**. Specifically:

1. **Customer Rentals:** Any logged-in customer can view or cancel another customer's rental simply by knowing or guessing the rental ID.

2. **Late-Fee Waivers:** A regular store clerk can waive late fees, even though our rules state that only an Admin should be able to do this.

### What Someone Could Do

* **A curious customer or attacker** could look up private rental details belonging to other customers—or maliciously cancel someone else's reservation without their permission.

* **An unauthorized staff member (clerk)** could waive late fees on returned rentals, leading to unapproved discounts and lost revenue.

*(On the positive side, login protections, auditor restrictions, and basic error handling all worked as expected.)*

### What I Recommend Before Launch

1. **Enforce ownership checks:** Ensure customers can only view or cancel rentals that belong to their own account.

2. **Lock down late-fee waivers:** Restrict the late-fee waiver action strictly to Admin accounts.

3. **Re-test before release:** Once these fixes are in place, I will re-run my security suite to verify everything is locked down before we launch.