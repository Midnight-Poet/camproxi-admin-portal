# Camproxi Admin Portal: Manual Test Plan

This document outlines a comprehensive manual testing strategy for the Camproxi Admin Portal. The tests are separated by route to ensure every page and feature is verified for correctness, performance, and user experience.

---

## 1. Authentication & Onboarding Routes

### `/login`
> [!IMPORTANT]
> This route is the gateway to the application. Ensure token handling is secure.

* **Valid Login:** Enter correct email/password. Verify redirection to `/dashboard` and persistence of session.
* **Invalid Login:** Enter incorrect credentials. Verify a clear error message is displayed and access is denied.
* **Session Persistence:** After logging in, refresh the page. Ensure the session persists and you aren't forced to log in again.
* **Protected Routes:** While logged out, manually navigate to `/dashboard`. Verify you are redirected back to `/login`.

### `/forgot-password`
* **Valid Request:** Enter a registered admin email and submit. Verify a success message is shown and the app redirects to `/reset-password` with the email pre-populated in state.
* **Invalid Request:** Enter an unregistered or malformed email. Verify proper error handling.
* **Loading State:** Observe the submit button during the API request. Verify the button is disabled and shows "Sending OTP...".

### `/reset-password`
> [!WARNING]
> This page relies on the router state. Navigating directly without router state should fail gracefully.

* **Direct Access:** Navigate directly to `/reset-password`. Verify you are immediately redirected back to `/forgot-password`.
* **Validation:** Enter an OTP, a new password (< 8 chars), and mismatching passwords. Verify form validations prevent submission.
* **Successful Reset:** Enter a valid OTP and matching secure passwords. Verify the success state animation, and ensure it redirects to `/login` after 3 seconds.

---

## 2. Core Operational Routes

### `/dashboard`
* **Data Fetching:** Verify that all metrics (Total Students, Agents, Pending Approvals, Open Reports) render correctly and match backend data.
* **Date Filtering:**
  * Select a `startDate` and `endDate`. Verify the network request fires with the new query parameters and data updates accordingly.
  * Click the "Clear" button. Verify the dates reset and data is fetched without date parameters.
* **Quick Actions:** Click through the quick action links (Review Content, Manage Students, Add New School) to ensure they navigate to the correct routes.

### `/approvals`
* **Tab Navigation:** Switch between "Properties", "Products", and "Services". Verify the list updates to reflect the active tab.
* **Approval Flow:** Click "Approve" on an item. Verify a success notification, the item disappears from the queue, and the total pending count decreases.
* **Rejection Flow:** Click "Reject" on an item. 
  * Verify the Rejection Modal opens. 
  * Ensure the rejection requires a reason (disabled button when empty).
  * Submit the rejection and verify the item is removed from the queue.
* **Global Search:** Type a keyword in the top bar search. Verify the approvals list filters down to matching items.

---

## 3. User & Support Routes

### `/users` & `/users/:type/:id`
* **Tab Navigation:** Toggle between "Students" and "Agents" tabs. Ensure the data sets match the selected type.
* **Suspend/Reactivate:** Test the Suspend/Reactivate toggle on a user row. Verify the status indicator updates in real-time.
* **Detail View Navigation:** Click "View Details" on a user. Verify it navigates to `/users/:type/:id` with the correct ID.
* **Profile Verification:** In the details view, verify that all personal info, uploaded documents, and metrics load correctly.
* **Agent Approvals (If applicable):** If an agent requires verification, verify the "Approve/Reject" buttons function and change the user's status.

### `/complaints` & `/complaints/:id`
* **Status Tabs:** Switch between "ALL", "OPEN", and "RESOLVED". Verify that the list filters correctly and the count badges on the tabs reflect reality.
* **Detail View:** Click "View Details" on a report. Verify the conversation thread, reporter info, and targeted item info render properly.
* **Reply Functionality:** Type a message in the reply box and click Send. Verify the message is added to the thread and the report status updates.
* **Status Toggles:** If available, manually change the status of the complaint from OPEN to RESOLVED and vice versa.

---

## 4. Administrative Routes

### `/regions` (School Management)
> [!IMPORTANT]
> Schools govern where OFFICIALs can operate. Creating/editing requires accuracy.

* **Create School:** Click "Add School". Fill the modal with valid data and submit. Verify the school appears in the list.
* **Edit School:** Click "Edit" on a school. Verify the modal populates with existing data. Change the status or name and save. Verify updates in the list.
* **Delete School:** Click the "Delete" trash icon. 
  * Verify a confirmation prompt appears.
  * Confirm deletion and ensure the school is removed from the list.

### `/admins`
* **List View:** Verify that the list displays all admins with their correct roles and assigned schools.
* **Role Based Rendering:** Verify that `SUPER_ADMIN`, `ADMIN`, and `OFFICIAL` badges are styled correctly and distinctly.
* **Create Admin:** Click "Create Admin". 
  * Ensure the "Assigned School" dropdown appears ONLY if the role selected is `OFFICIAL`.
  * Submit the form and verify the new admin appears in the list.

### `/settings`
* **Preferences Toggle:** Go to the "System Preferences" tab.
  * Toggle "Maintenance Mode" and "Service Fees".
  * Verify that changing the toggle immediately triggers a backend mutation and updates the system state.
* **Profile Management:** In the "My Profile" tab, update your display name or email. Verify the changes save successfully and reflect in the TopBar.

### `/audit-logs`
> [!TIP]
> Ensure the search functionality is responsive, as audit logs can grow very large over time.

* **Data Loading:** Verify that a chronological list of system actions (actor, action, target, timestamp) is rendered.
* **Search Filtering:** Type a specific action (e.g., "DELETED_SCHOOL") or actor email into the search bar. Verify the list filters accurately and instantly (with debounce).
* **Severity Badges:** Ensure `INFO`, `WARNING`, and `CRITICAL` logs have distinct visual badges to aid in scanning.

---
**Testing Final Sign-off:**
Ensure you test these scenarios on both Desktop and Mobile viewports to verify responsive design implementations.
