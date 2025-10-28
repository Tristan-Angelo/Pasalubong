# 🧩 Task: Add Seller & Delivery Valid ID Verification Flow

## 🎯 Goal
Update the registration flow for **Seller** and **Delivery (Rider)** users to include **valid ID upload and admin approval** after email verification and login.

---

## 🔧 Requirements

### 1. Registration Flow Update
- After registration and **email verification**, when the **Seller** or **Delivery** user logs in:
  - Redirect them to a new **“Upload Valid ID”** page instead of the dashboard.
- **Buyer flow remains unchanged** (they proceed to face registration and dashboard as usual).

---

### 2. Upload Valid ID Page
- Users must upload **two images**:
  - **Front** of their valid ID  
  - **Back** of their valid ID  
- Add **preview images** so users can see their uploaded files.
- Include **validation**:
  - Both images are required.
  - Accepted file types: `.jpg`, `.jpeg`, `.png`.
- Once uploaded:
  - Store files in `/storage/valid_ids` (or a cloud storage).
  - Save references in the database (`valid_id_front`, `valid_id_back`).
  - Redirect the user to a **“Waiting for Approval”** page.

---

### 3. Waiting Page
- Display a message or animation informing users their account is pending admin approval.
- Prevent dashboard access until their account is approved.

---

## 🧑‍💼 AdminDashboard Updates

### 1. Seller & Delivery Management
- Under **Riders** and **Sellers** sections:
  - Use the **existing profile card layout**.
  - Add:
    - **Approve** button  
    - **Decline** button  
    - Make the **card clickable** to open a modal with more details.

---

### 2. Admin Review Modal
- When an admin clicks a card:
  - Show a **modal** displaying:
    - Full user details (name, email, address, etc.)
    - Uploaded **Valid ID (front & back)** images.
  - Include **Approve** and **Decline** buttons inside the modal.

---

### 3. Approve / Decline Logic
- **Approve:**
  - Update `is_approved = true` in the database.
  - Allow dashboard access.
- **Decline:**
  - Optionally delete or deactivate the account.
  - Notify user by email or dashboard message.

---

## 🧱 Backend Notes
- Extend the `users` table or create a `verifications` table with:
  - `valid_id_front`
  - `valid_id_back`
  - `approval_status` (`pending`, `approved`, `declined`)
- Modify authentication middleware:
  - Restrict dashboard access if `approval_status = pending`.
  - Redirect to **Waiting Page**.

---

## ✅ Summary Flow

### Seller / Delivery
1. Register → Verify Email  
2. Login → Redirect to Upload Valid ID  
3. Upload Front & Back → Waiting Page  
4. Admin Review → Approve / Decline  
5. If Approved → Redirect to Dashboard

### Buyer
- Flow remains unchanged (face recognition process applies).

---

## 🧩 Optional Enhancements
- Email notification to admin when a new seller/rider submits a valid ID.
- Email notification to user after approval or decline.
- Add status indicators (pending/approved/declined) to the admin list view.
- Add timestamp fields for review tracking.

---

**End of Task**
