# Camproxi — Admin Portal API Documentation

> All protected routes require the `AdminAuthGuard`.
> The new modules heavily utilize Role-Based Access Control (RBAC). 
> Admins have roles: `OFFICIAL`, `ADMIN`, or `SUPER_ADMIN`.
> `OFFICIAL` roles are location-scoped to their assigned `schoolId`.

---

## 1. Authentication
**Base Route:** `/api/admin/auth`  
**Guard:** Public

### `POST /api/admin/auth/login`
Authenticate an admin and return a JWT token. Also sets an `access_token` HttpOnly cookie.
- **Payload:**
  ```json
  {
    "email": "superadmin@camproxi.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "...",
      "name": "Super Admin",
      "email": "superadmin@camproxi.com",
      "role": "SUPER_ADMIN",
      "schoolId": null,
      "campusName": null,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "ey..."
  }
  ```

### `POST /api/admin/auth/logout`
Logout an admin. Clears the `access_token` cookie.
- **Payload:** None
- **Response (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### `POST /api/admin/auth/forgot-password`
Generates a 6-digit OTP, saves it in `resetOtp` with a 10 min expiry, and emails it via Resend.
- **Payload:** `{ "email": "admin@camproxi.com" }`
- **Response (200 OK):** `{ "message": "Password reset email sent" }`

### `POST /api/admin/auth/reset-password`
Validates the OTP and updates the password.
- **Payload:** 
  ```json
  { 
    "email": "admin@camproxi.com",
    "otp": "123456",
    "newPassword": "newSecurePassword123"
  }
  ```
- **Response (200 OK):** `{ "message": "Password reset successfully" }`

---

## 2. Admin Management
**Base Route:** `/api/admin/auth` and `/api/admin/admins`  

### `POST /api/admin/auth/create`
Create a new admin.
- **Guard:** `AdminCreateGuard` (Requires `SUPER_ADMIN` via JWT, or bootstrap mode via `reqPassword.key` if DB is empty).
- **Payload:**
  ```json
  {
    "user": {
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@camproxi.com",
      "password": "password123",
      "role": "OFFICIAL",          // SUPER_ADMIN, ADMIN, OFFICIAL
      "schoolId": "school_uuid",   // Required if OFFICIAL
      "campusName": "Main Campus"  // Optional
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "...",
    "name": "John Doe",
    "email": "john@camproxi.com",
    "role": "OFFICIAL",
    "schoolId": "school_uuid",
    "createdAt": "..."
  }
  ```

### `GET /api/admin/admins`
Fetch a list of all admins.
- **Guard:** `AdminAuthGuard`, `RolesGuard` (Requires `SUPER_ADMIN` or `ADMIN`).
- **Response (200 OK):**
  ```json
  [
    {
      "id": "...",
      "name": "John Doe",
      "email": "john@camproxi.com",
      "role": "OFFICIAL",
      "schoolId": "school_uuid",
      "campusName": "Main Campus",
      "createdAt": "..."
    }
  ]
  ```

---

## 3. School Management
**Base Route:** `/api/admin/school`  

### `POST /api/admin/school/new`
Create a new school.
- **Guard:** `AdminAuthGuard`, Requires `SUPER_ADMIN` or `ADMIN`.
- **Payload:**
  ```json
  {
    "name": "Federal University of Technology",
    "code": "FUTMINNA",
    "campus": [
      {
        "name": "Main Campus",
        "location": {
          "latitude": 9.6538,
          "longitude": 6.5259
        }
      }
    ]
  }
  ```
- **Response (201 Created):** 
  ```json
  {
    "id": "6a69...",
    "name": "Federal University of Technology",
    "code": "FUTMINNA",
    "campus": [
      {
        "name": "Main Campus",
        "location": {
          "latitude": 9.6538,
          "longitude": 6.5259
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### `PATCH /api/admin/school/:id`
Update an existing school.
- **Guard:** `AdminAuthGuard`, Requires `SUPER_ADMIN` or `ADMIN`.
- **Payload:** Partial `LocationDto` (name, code, campus)

### `DELETE /api/admin/school/:id`
Deletes a school. Note: This will be rejected with a `400 Bad Request` if there are any active agents or students registered to this school to prevent orphaned data.
- **Guard:** `AdminAuthGuard`, Requires `SUPER_ADMIN` or `ADMIN`.

### `GET /api/admin/school`
List all schools.
- **Guard:** Public / Configurable
- **Response (200 OK):**
  ```json
  [
    {
      "id": "6a69...",
      "name": "Federal University of Technology",
      "code": "FUTMINNA",
      "campus": [
        {
          "name": "Main Campus",
          "location": {
            "latitude": 9.6538,
            "longitude": 6.5259
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### `GET /api/admin/school/:id`
Get a specific school by ID.
- **Guard:** Public / Configurable
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "name": "Federal University of Technology",
    "code": "FUTMINNA",
    "campus": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

---

## 4. Metrics & Analytics Dashboard
**Base Route:** `/api/admin/metrics`  

### `GET /api/admin/metrics/dashboard`
Fetches aggregate counts of Students, Agents, Pending Content, Open Reports, and Recent Registrations. (`OFFICIAL`s see counts scoped to their school).
- **Query Parameters:** `startDate` (optional ISO string), `endDate` (optional ISO string). Filters all counts by `createdAt` within the range.
- **Guard:** `AdminAuthGuard`, `RolesGuard` (`SUPER_ADMIN`, `ADMIN`, `OFFICIAL`)
- **Response (200 OK):**
  ```json
  {
    "totalStudents": 150,
    "totalAgents": 45,
    "pendingProperties": 12,
    "pendingProducts": 5,
    "pendingServices": 3,
    "openReports": 2,
    "recentRegistrations": {
      "students": [ /* Array of 5 most recent students */ ],
      "agents": [ /* Array of 5 most recent agents */ ]
    }
  }
  ```

---

## 5. User Management (Students & Agents)
**Base Route:** `/api/admin/users`  
**Guard:** `AdminAuthGuard`, `RolesGuard` (`SUPER_ADMIN`, `ADMIN`, `OFFICIAL`)

### `GET /api/admin/users/students?page=1&limit=20`
Fetches all students (paginated). `OFFICIAL`s only see students in their school.
- **Response (200 OK):**
  ```json
  {
    "data": [ /* Array of Student objects */ ],
    "meta": { "total": 150, "page": 1, "lastPage": 8 }
  }
  ```

### `GET /api/admin/users/agents?page=1&limit=20`
Fetches all agents (paginated). `OFFICIAL`s only see agents in their school.
- **Response (200 OK):**
  ```json
  {
    "data": [ /* Array of Agent objects */ ],
    "meta": { "total": 45, "page": 1, "lastPage": 3 }
  }
  ```

### `GET /api/admin/users/students/:id`
Fetches detailed profile of a specific student.
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890",
    "isverified": true,
    "isSuspended": false,
    "schoolId": "6a69...",
    "campusName": "Main Campus",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### `PATCH /api/admin/users/students/:id/suspend`
Suspend or unsuspend a student.
- **Payload:**
  ```json
  {
    "suspend": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "firstName": "John",
    "lastName": "Doe",
    "isSuspended": true
  }
  ```

### `GET /api/admin/users/agents/:id`
Fetches detailed profile of a specific agent.
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "companyName": "Jane Realty",
    "category": "AGENT",
    "email": "jane@example.com",
    "phone": "0987654321",
    "isverified": true,
    "isSuspended": false,
    "schoolId": "6a69...",
    "campusName": "Main Campus",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### `PATCH /api/admin/users/agents/:id/suspend`
Suspend or unsuspend an agent.
- **Payload:**
  ```json
  {
    "suspend": false
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "firstName": "Jane",
    "lastName": "Smith",
    "isSuspended": false
  }
  ```

---

## 6. Content Moderation
**Base Route:** `/api/admin/content`  
**Guard:** `AdminAuthGuard`, `RolesGuard` (`SUPER_ADMIN`, `ADMIN`, `OFFICIAL`)

### `GET /api/admin/content/all?page=1&limit=20&status=all&category=ALL`
Fetches all properties, products, and services according to filters.
- **Query Parameters**:
  - `status`: Filter by status (`pending`, `verified`, `rejected`, or `all` to see all). Default is `all`.
  - `category`: Filter by category (`PROPERTY`, `PRODUCT`, `SERVICE`, or `ALL` to see all). Default is `ALL`.
- **Role Restrictions**:
  - `OFFICIAL`s only see items posted by agents in their school.
  - `SUPER_ADMIN` and `ADMIN` can see all items globally.
- **Response (200 OK):**
  ```json
  {
    "properties": { "data": [...], "meta": { "total": 12, "page": 1, "lastPage": 1 } },
    "products": { "data": [...], "meta": { "total": 5, "page": 1, "lastPage": 1 } },
    "services": { "data": [...], "meta": { "total": 3, "page": 1, "lastPage": 1 } }
  }
  ```

### `GET /api/admin/content/pending?page=1&limit=20`
Fetches all properties, products, and services with `status: "pending"`. `OFFICIAL`s only see items posted by agents in their school. All 3 lists are paginated.
- **Response (200 OK):**
  ```json
  {
    "properties": { "data": [...], "meta": { "total": 12, "page": 1, "lastPage": 1 } },
    "products": { "data": [...], "meta": { "total": 5, "page": 1, "lastPage": 1 } },
    "services": { "data": [...], "meta": { "total": 3, "page": 1, "lastPage": 1 } }
  }
  ```

### `PATCH /api/admin/content/properties/:id/verify`
Marks a property as `status: "verified"` and triggers a real-time WebSocket notification to the Agent.
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "name": "Luxury Apartment",
    "status": "verified",
    "agentId": "6a69..."
  }
  ```

### `PATCH /api/admin/content/products/:id/verify`
Marks a product as `status: "verified"` and triggers a real-time WebSocket notification to the Agent.
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "name": "Mini Fridge",
    "status": "verified",
    "agentId": "6a69..."
  }
  ```

### `PATCH /api/admin/content/services/:id/verify`
Marks a service as `status: "verified"` and triggers a real-time WebSocket notification to the Agent.
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "name": "Plumbing",
    "status": "verified",
    "agentId": "6a69..."
  }
  ```

### `PATCH /api/admin/content/:type/:id/reject`
Where `:type` is `properties`, `products`, or `services`. Marks the item as `status: "rejected"`, saves the rejection reason, and notifies the agent via WebSockets.
- **Payload:** `{ "reason": "Inappropriate images" }`
- **Response (200 OK):** Item object with updated status and `rejectReason`.

### `GET /api/admin/content/:type/:id`
Where `:type` is `properties`, `products`, or `services`. Fetches detailed information for a single item.
- **Role Restrictions:** `OFFICIAL` admins are restricted to items belonging to agents in their school location.
- **Response (200 OK):** Full item details.

### `PATCH /api/admin/content/:type/:id/reset`
Where `:type` is `properties`, `products`, or `services`. Resets a rejected item back to `"pending"` status and clears the `rejectReason`.
- **Role Restrictions:** Scoped to `schoolId` for `OFFICIAL` admins.
- **Notification:** Triggers a real-time WebSocket notification to the Agent informing them that their item is under re-review.
- **Response (200 OK):** The updated item object.

### `PATCH /api/admin/content/:type/:id/takedown`
Where `:type` is `properties`, `products`, or `services`. Takes down a verified item by setting its status to `"rejected"` and setting `rejectReason`.
- **Payload:** `{ "reason": "Reason for takedown" }`
- **Role Restrictions:** Scoped to `schoolId` for `OFFICIAL` admins.
- **Notification:** Triggers a real-time WebSocket notification to the Agent informing them that their item was taken down.
- **Response (200 OK):** The updated item object.

---

## 7. Profile Management
**Base Route:** `/api/admin/admins`
**Guard:** `AdminAuthGuard`

### `GET /api/admin/admins/me`
Fetch the logged-in admin's profile data.
- **Response (200 OK):**
  ```json
  {
    "id": "...",
    "name": "Super Admin",
    "email": "superadmin@camproxi.com",
    "role": "SUPER_ADMIN",
    "schoolId": null,
    "campusName": null,
    "createdAt": "..."
  }
  ```

### `PATCH /api/admin/admins/update`
Update admin profile.
- **Payload:**
  ```json
  {
    "name": "New Name",
    "email": "newemail@camproxi.com"
  }
  ```
- **Response (200 OK):** Returns the updated Admin object (excluding password).

### `PATCH /api/admin/admins/change-password`
Change password securely.
- **Payload:**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newSecurePassword456"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

---

## 8. Reports & Support Tickets
**Base Route:** `/api/admin/reports`  
**Guard:** `AdminAuthGuard`, `RolesGuard` (`SUPER_ADMIN`, `ADMIN`, `OFFICIAL`)

### `GET /api/admin/reports`
Fetches all reports. `OFFICIAL`s only see reports filed by agents/students in their assigned school.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "6a69...",
      "subject": "App Bug",
      "message": "The app is crashing...",
      "reporterId": "6a69...",
      "reporterType": "STUDENT",
      "reporter": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "targetType": "ITEM",
      "targetId": "6a69...",
      "itemCategory": "PRODUCT",
      "target": {
        "name": "Mini Fridge",
        "businessCategory": "ELECTRONICS"
      },
      "status": "OPEN",
      "reply": null,
      "repliedById": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### `GET /api/admin/reports/:id`
Fetches the full details of a specific report (including populated reporter and target objects).
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "subject": "App Bug",
    "message": "The app is crashing...",
    "reporterId": "6a69...",
    "reporterType": "STUDENT",
    "reporter": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "targetType": "ITEM",
    "targetId": "6a69...",
    "itemCategory": "PRODUCT",
    "target": {
      "name": "Mini Fridge",
      "businessCategory": "ELECTRONICS"
    },
    "status": "OPEN",
    "reply": null,
    "repliedById": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### `PATCH /api/admin/reports/:id/reply`
Adds a reply to the report and sets status to `RESOLVED`.
- **Payload:**
  ```json
  {
    "reply": "We have looked into this and resolved the issue."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "6a69...",
    "subject": "App Bug",
    "message": "The app is crashing...",
    "reporterId": "6a69...",
    "reporterType": "STUDENT",
    "status": "RESOLVED",
    "reply": "We have looked into this and resolved the issue.",
    "repliedById": "6a69... (Admin ID)",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

---

## 9. Notifications & WebSockets
**Namespace:** `/notifications`  

Admins (including Officials) can connect to the real-time Notification WebSocket to receive instant alerts (e.g. when new content is submitted for moderation).

### WebSockets Connection
- **URL**: `ws://<backend-url>/notifications`
- **Authentication**: Automatically authenticated via the `access_token` cookie sent during the HTTP handshake.

#### Events Emitted from Client (Frontend -> Backend)
- `markAsRead`: Send this event to mark a specific notification as read.
  - **Payload:** `{ "notificationId": "string" }`
- `markAllAsRead`: Send this event to mark all notifications as read.
  - **Payload:** None (or `{}`)

#### Events Received by Client (Backend -> Frontend)
- `newNotification`: Triggered when the backend creates a new notification for you.
  - **Payload:** The saved `Notification` object.
- `notificationRead`: Acknowledgment that a notification was marked as read.
  - **Payload:** `{ "notificationId": "string" }`
- `allNotificationsRead`: Acknowledgment that all notifications were marked as read.
  - **Payload:** `{ "success": true }`

---

## 10. Audit Logs (Super Admin Only)
**Base Route:** `/api/admin/audit-logs`  
**Guards:** `AdminAuthGuard`, `RolesGuard(SUPER_ADMIN)`

### `GET /api/admin/audit-logs`
Fetches a reverse-chronological list of administrative actions taken on the platform.
- **Expected Response (200 OK):**
```json
[
  {
    "id": "ObjectId",
    "adminId": "ObjectId",
    "action": "SUSPENDED_USER",
    "details": "{\"userId\":\"...\"}",
    "createdAt": "DateTime",
    "admin": {
      "id": "ObjectId",
      "email": "admin@example.com",
      "name": "Admin Name",
      "username": "admin123",
      "role": "SUPER_ADMIN | ADMIN | OFFICIAL"
    }
  }
]
```

---

## 11. Global Settings (Super Admin Only)
**Base Route:** `/api/admin/settings`  
**Guards:** `AdminAuthGuard`, `RolesGuard(SUPER_ADMIN)`

### `GET /api/admin/settings`
Fetches all global configurations as a key-value object.
- **Expected Response (200 OK):**
```json
{
  "maintenance_mode": "false",
  "service_fee_percentage": "5"
}
```

### `PATCH /api/admin/settings`
Creates or updates a setting.
- **Payload:**
```json
{
  "key": "maintenance_mode",
  "value": true
}
```
- **Expected Response (200 OK):** The updated setting record.

---

## 12. Global Search
**Base Route:** `/api/admin/search`  
**Guards:** `AdminAuthGuard`

### `GET /api/admin/search?q=Term`
Executes a parallel wildcard search across Users, Agents, Schools, Products, Properties, and Services.
- **Response (200 OK):**
```json
[
  { "id": "...", "name": "John Doe", "type": "STUDENT" },
  { "id": "...", "name": "FUTMINNA", "type": "SCHOOL" }
]
```
