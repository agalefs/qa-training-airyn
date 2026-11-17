# Day 3 — Story RR-520: Damage Charge on Return (Requirements Analysis)

> **User Story:** As a counter clerk, I want to record damage when an item comes back and charge the customer for it, so that repair costs are covered.  
> **PO Context:** Dana (Product Owner, Austin, TX — replies within 1 day): *"Clerks will pick the damage type and enter an amount. The customer sees the charge on the invoice. Keep it simple for the first release. We ship in two weeks."*  
> **Release Context:** RentRight v1.5 ships Friday in two weeks, coinciding with a **3-firm contractor pilot** renting heavy equipment for 7–30 days on credit accounts.

---

## 1. Proposed Acceptance Criteria (Given / When / Then)

* **AC-01 (Record Damage Charge on Active Return):**
  * **Given** a logged-in counter clerk is processing a return for an `Active` rental,
  * **When** the clerk selects a valid damage type from the predefined list (`Cosmetic`, `Mechanical`, `Missing Parts`, `Total Loss`), enters an amount of `$45.00`, and submits the return,
  * **Then** the rental transitions to `Returned`, the damage record is saved with timestamp and clerk ID, and a `$45.00` line item labeled `"Damage Charge - [Damage Type]"` is added to the customer's invoice.

* **AC-02 (Return Without Damage):**
  * **Given** a counter clerk is processing a return for an `Active` rental with no damage reported,
  * **When** the clerk completes the return without selecting a damage type or entering a damage amount,
  * **Then** the rental transitions to `Returned` and no damage charge line item appears on the customer's invoice.

* **AC-03 (Damage Amount Validation — Range & Format):**
  * **Given** a counter clerk has selected a damage type during a return,
  * **When** the clerk enters an amount less than `$0.01` (e.g., `$0.00` or `-$10.00`), greater than `$10,000.00`, or with more than 2 decimal places (e.g., `$12.345`),
  * **Then** the system blocks submission and displays an inline validation error (`"Enter a valid damage amount between $0.01 and $10,000.00"`).

* **AC-04 (Mandatory Pairing of Damage Type and Amount):**
  * **Given** a counter clerk is on the return screen,
  * **When** the clerk selects a damage type but leaves the amount blank (or enters an amount `> $0.00` without selecting a damage type),
  * **Then** the system blocks submission and prompts the clerk to complete both fields before finalizing the return.

* **AC-05 (Deposit Offset — Standard Customer with Deposit Paid):**
  * **Given** a standard customer paid a `$60.00` deposit on the rental and incurs a `$45.00` damage charge upon return,
  * **When** the return is finalized,
  * **Then** the `$45.00` damage charge is deducted from the `$60.00` deposit, and the invoice reflects `$45.00` retained and `$15.00` deposit refunded.

* **AC-06 (Contractor Credit Account & Damage Exceeding Deposit):**
  * **Given** a pilot contractor account has a `$0.00` deposit (or a standard customer has a `$34.00` deposit that is less than a `$120.00` damage charge),
  * **When** the return is finalized with a `$120.00` damage charge,
  * **Then** the net balance due (`$120.00` for Contractor credit account; `$86.00` for Standard customer after retaining `$34.00` deposit) is billed on the post-rental invoice.

* **AC-07 (Item Inventory Lock on Severe Damage):**
  * **Given** a counter clerk records damage of type `Mechanical` or `Total Loss` upon return,
  * **When** the return is saved,
  * **Then** the item's inventory status is set to `Maintenance` (not `Available`) so it cannot be rented out again until repaired.

* **AC-08 (Immutability After Return Finalization):**
  * **Given** a rental has already transitioned to the `Returned` state,
  * **When** a counter clerk or unauthorized API caller attempts to modify or add a damage charge on that closed rental,
  * **Then** the system blocks the edit (read-only UI; HTTP `409 Conflict` / `403 Forbidden` on API).

---

## 2. Assumptions and Questions Log

| # | Question or Assumption | Why It Matters | Risk if Wrong (H/M/L) | Proposed Default | Who Decides |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Q1** | **Deposit Offset vs. Separate Charge:** Does a damage charge deduct from a held deposit first, or always bill as a new post-rental invoice charge? | Contractors in the v1.5 pilot pay `$0.00` deposit (`RR-501`), while standard customers pay 20%. Mixing up deposit math causes double-billing or uncollected damage fees. | **H** | Deduct from held deposit first; refund surplus if `deposit > damage`, or bill net balance due (`damage - deposit`) on the invoice (full amount for `$0`-deposit contractors). | Product Owner (Dana) & Finance |
| **Q2** | **Damage Types List:** What exact values belong in the damage type dropdown for v1.5, and is a free-text note included? | Drives UI dropdown options, database enum/validation rules, and whether certain damage types lock inventory. | **M** | Predefined list: `Cosmetic`, `Mechanical`, `Missing Parts`, `Total Loss` plus an optional 250-char text note. | Product Owner (Dana) |
| **Q3** | **Item Inventory Status Post-Damage:** Should `Mechanical` or `Total Loss` damage move the item to `Maintenance` instead of `Available`? | Heavy equipment rented to the 3 construction pilot firms must not automatically return to `Available` (`RR-502`) if broken. | **H** | `Mechanical` and `Total Loss` set item status to `Maintenance`; `Cosmetic` keeps item `Available`. | Product Owner (Dana) & Operations Lead |
| **Q4** | **Discounts & Promo Codes Exclusion:** Are damage charges exempt from the 20%–25% contractor discounts (`RR-501`) and checkout promo codes (Change #3)? | Applying a rental discount or promo code to a repair charge under-recovers actual repair costs. | **H** | Damage charges are flat repair recoveries: **0% rental discount and 0% promo code discount** apply. | Product Owner (Dana) & Finance |
| **Q5** | **Post-Rental Payment Capture:** Since card payments are handled by an out-of-scope third party and contractors are on credit accounts, how is the damage invoice settled? | Dev notes highlight this is the *"first time we charge money after the rental ended."* Attempting an unsupported off-session card charge will fail. | **H** | Generate an open post-rental invoice balance (`Due on Receipt` at counter for retail; added to monthly statement for contractor credit accounts). | Product Owner (Dana) & Tech Lead |
| **Q6** | **Maximum Amount & Permissions:** Is there a dollar cap per damage entry or manager approval threshold? | Heavy equipment repairs can be costly, but uncapped fields risk clerk typos (e.g., `$5,000` instead of `$50`). | **M** | Allow `$0.01` to `$10,000.00` for any counter clerk in v1.5 (keep simple; defer manager approval to v1.6). | Product Owner (Dana) |
| **Q7** | **Single vs. Multiple Damage Lines:** Can a clerk record multiple damage types on one returned item? | Determines whether the new return endpoint takes a single damage object or an array of line items. | **L** | One damage type and one amount per returned item for v1.5 ("keep it simple"). | Product Owner (Dana) |

---

## 3. Traceability Map (Acceptance Criteria $\leftrightarrow$ Test Ideas)

| AC ID | Acceptance Criterion Summary | Covered by Test Idea ID(s) | Test Idea Description & Technique | Coverage Status |
| :--- | :--- | :--- | :--- | :---: |
| **AC-01** | Record damage type + `$45.00` on `Active` return; invoice updated | `TI-520-01` | Happy-path return with `Cosmetic` `$45.00` via UI & new API endpoint; verify `Returned` state & invoice line item (`ST`, API). | **Covered** |
| **AC-02** | Return without damage produces no damage line item | `TI-520-02` | Standard return with blank damage fields; verify zero regression on `RR-502` return flow (`ST`, Regression). | **Covered** |
| **AC-03** | Amount validation (`$0.01`–`$10,000.00`, max 2 decimals) | `TI-520-03`, `TI-520-04` | Two-sided BVA on amount (`$0.00`, `$0.01`, `$10,000.00`, `$10,000.01`) & 3-decimal `$12.345` (`BVA`, `EP`). | **Covered** |
| **AC-04** | Mandatory pairing of damage type and amount | `TI-520-05` | Decision table test: Type selected + blank amount; blank type + `$25.00` amount (`DT`). | **Covered** |
| **AC-05** | Deposit offset when `deposit > damage` (`$60` dep, `$45` dmg) | `TI-520-06` | Retail customer return with `$45.00` damage; verify `$15.00` deposit refund & `$45.00` retained (`DT`, `BVA`). | **Covered** |
| **AC-06** | Contractor `$0` deposit & damage exceeding deposit (`$120` dmg) | `TI-520-07`, `TI-520-08` | Pilot contractor (`$0` dep) + `$120` damage; Retail (`$34` dep) + `$120` damage (`$86` due); exact tie `$34 = $34` (`DT`, `BVA`). | **Covered** |
| **AC-07** | Item status set to `Maintenance` for `Mechanical` / `Total Loss` | `TI-520-09` | Return heavy item with `Total Loss`; verify item is blocked from new rentals in `RR-501` (`ST`, Integration). | **Covered** |
| **AC-08** | Damage fields read-only once rental is `Returned` | `TI-520-10` | Attempt UI edit and direct API call to alter damage on a closed `Returned` rental (`ST`, Security/API). | **Covered** |
| *Gap* | *Monthly report inclusion (Change #4) for post-rental damage revenue* | *None yet* | *Pending confirmation on whether damage fees appear under per-item revenue in the Monthly Report.* | **No Test Yet** |

---

## 4. Message to Product Owner (Dana)

**Channel:** Slack / Email (Async — Austin CST vs. Philippines PHT)  
**Word Count:** 137 words  

> Hi Dana,  
>  
> Excited to join the team and help get RentRight v1.5 ready for the contractor pilot!  
>  
> To keep **RR-520 (Damage charge on return)** simple for our two-week release, I drafted 8 proposed acceptance criteria and a short assumptions table (linked here). A few key defaults I assumed so dev and QA can move forward right away:  
> 1. Damage charges deduct from any held deposit first, billing the net balance on the invoice (full amount for `$0`-deposit contractor accounts) with 0% rental/promo discounts applied.  
> 2. Clerks select one damage type (`Cosmetic`, `Mechanical`, `Missing Parts`, `Total Loss`) and enter `$0.01–$10,000.00`.  
> 3. `Mechanical` or `Total Loss` moves the item to `Maintenance` instead of `Available`.  
>  
> Could you please confirm or adjust these defaults by **Thursday, Nov 19 at 5:00 PM CST** (Friday morning my time)?  
>  
> Thanks!