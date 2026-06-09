# Stage 1

## Notification System - REST API Design, Contract & Structure

---

## 1. Core Actions

The notification platform should support the following core actions:

| # | Action | Description |
|---|--------|-------------|
| 1 | **Get All Notifications** | Retrieve all notifications for the logged-in user |
| 2 | **Get Notification by ID** | Retrieve a single notification by its ID |
| 3 | **Mark Notification as Read** | Mark a specific notification as read |
| 4 | **Mark All Notifications as Read** | Mark all notifications as read for the user |
| 5 | **Delete Notification** | Delete a specific notification |
| 6 | **Get Unread Count** | Get the count of unread notifications |
| 7 | **Create Notification** | Create a new notification (admin/system use) |

---

## 2. REST API Endpoints

### Base URL
```
/api/v1/notifications
```

### Endpoints Summary

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/v1/notifications` | Get all notifications for logged-in user |
| GET | `/api/v1/notifications/:id` | Get a single notification by ID |
| POST | `/api/v1/notifications` | Create a new notification |
| PATCH | `/api/v1/notifications/:id/read` | Mark a notification as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/v1/notifications/:id` | Delete a notification |
| GET | `/api/v1/notifications/unread-count` | Get unread notification count |

---

## 3. Request & Response Structures

### 3.1 GET `/api/v1/notifications`

**Description:** Fetch all notifications for the authenticated user with pagination.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |
| status | string | No | all | Filter: `read`, `unread`, `all` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_abc123",
        "title": "New Order Received",
        "message": "You have a new order #1234 from John Doe.",
        "type": "order",
        "status": "unread",
        "priority": "high",
        "metadata": {
          "orderId": "order_1234",
          "link": "/orders/order_1234"
        },
        "createdAt": "2026-06-09T10:30:00.000Z",
        "readAt": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 98,
      "limit": 20
    }
  }
}
```

---

### 3.2 GET `/api/v1/notifications/:id`

**Description:** Fetch a single notification by ID.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "notif_abc123",
    "title": "New Order Received",
    "message": "You have a new order #1234 from John Doe.",
    "type": "order",
    "status": "unread",
    "priority": "high",
    "metadata": {
      "orderId": "order_1234",
      "link": "/orders/order_1234"
    },
    "createdAt": "2026-06-09T10:30:00.000Z",
    "readAt": null
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "message": "Notification with the given ID does not exist."
  }
}
```

---

### 3.3 POST `/api/v1/notifications`

**Description:** Create a new notification (used by the system or admin).

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "user_xyz789",
  "title": "Payment Successful",
  "message": "Your payment of ₹500 has been processed successfully.",
  "type": "payment",
  "priority": "medium",
  "metadata": {
    "transactionId": "txn_5678",
    "link": "/transactions/txn_5678"
  }
}
```

**Validation Rules:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| userId | string | Yes | Valid user ID |
| title | string | Yes | Max 150 characters |
| message | string | Yes | Max 500 characters |
| type | string | Yes | Enum: `order`, `payment`, `alert`, `info`, `system` |
| priority | string | No | Enum: `low`, `medium`, `high`. Default: `low` |
| metadata | object | No | Additional context data |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "notif_def456",
    "userId": "user_xyz789",
    "title": "Payment Successful",
    "message": "Your payment of ₹500 has been processed successfully.",
    "type": "payment",
    "status": "unread",
    "priority": "medium",
    "metadata": {
      "transactionId": "txn_5678",
      "link": "/transactions/txn_5678"
    },
    "createdAt": "2026-06-09T11:00:00.000Z",
    "readAt": null
  }
}
```

---

### 3.4 PATCH `/api/v1/notifications/:id/read`

**Description:** Mark a specific notification as read.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "notif_abc123",
    "status": "read",
    "readAt": "2026-06-09T11:15:00.000Z"
  }
}
```

---

### 3.5 PATCH `/api/v1/notifications/read-all`

**Description:** Mark all notifications as read for the authenticated user.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read.",
    "updatedCount": 15
  }
}
```

---

### 3.6 DELETE `/api/v1/notifications/:id`

**Description:** Delete a specific notification.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully.",
    "id": "notif_abc123"
  }
}
```

---

### 3.7 GET `/api/v1/notifications/unread-count`

**Description:** Get the total count of unread notifications for the authenticated user.

**Request Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 7
  }
}
```

---

## 4. Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is missing or invalid."
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      {
        "field": "title",
        "message": "Title is required."
      }
    ]
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

---

## 5. Notification JSON Schema

```json
{
  "id": "string (unique identifier)",
  "userId": "string (owner of the notification)",
  "title": "string (short notification title)",
  "message": "string (notification body)",
  "type": "string (enum: order | payment | alert | info | system)",
  "status": "string (enum: read | unread)",
  "priority": "string (enum: low | medium | high)",
  "metadata": "object (optional additional data with links/context)",
  "createdAt": "string (ISO 8601 datetime)",
  "readAt": "string | null (ISO 8601 datetime when read)"
}
```

---

## 6. Real-Time Notifications Mechanism

### Technology: WebSocket (using Socket.IO)

The system uses **Socket.IO** to push real-time notifications to connected clients without requiring polling.

### Architecture

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Client    │◄─────►│  Socket.IO      │◄─────►│  Node.js    │
│  (React +   │  WS   │  Server         │       │  Backend    │
│  Material UI)│       │                 │       │  (Express)  │
└─────────────┘       └─────────────────┘       └─────────────┘
```

### Connection Flow

1. **Client connects** after successful login:
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "<jwt_token>"
  }
});
```

2. **Server authenticates** the socket connection using JWT middleware:
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});
```

3. **Server joins user to a private room** based on their user ID:
```javascript
io.on("connection", (socket) => {
  socket.join(`user_${socket.userId}`);
});
```

4. **Server emits notification** when a new one is created:
```javascript
// After saving notification to DB
io.to(`user_${notification.userId}`).emit("new_notification", {
  id: notification.id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  priority: notification.priority,
  createdAt: notification.createdAt
});
```

5. **Client listens** for real-time events:
```javascript
socket.on("new_notification", (notification) => {
  // Update UI - show toast, update badge count, prepend to list
  dispatch(addNotification(notification));
});
```

### WebSocket Events

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `new_notification` | Server → Client | Notification object | A new notification was created |
| `notification_read` | Server → Client | `{ id, readAt }` | A notification was marked as read |
| `all_notifications_read` | Server → Client | `{ updatedCount }` | All notifications marked as read |
| `notification_deleted` | Server → Client | `{ id }` | A notification was deleted |

### Fallback Strategy

If WebSocket connection fails, the client falls back to **HTTP polling** every 30 seconds to fetch unread notifications, ensuring the user always receives updates.

---

## 7. Authentication Strategy

All API endpoints require a valid JWT token passed in the `Authorization` header. The token is obtained during user login and contains:

```json
{
  "userId": "user_xyz789",
  "email": "user@example.com",
  "role": "user",
  "iat": 1717920000,
  "exp": 1717963200
}
```

---

## 8. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Material UI |
| Backend | Node.js + Express.js |
| Real-time | Socket.IO |
| Database | MongoDB (with Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens) |

---

# Stage 2

## Database Design, Schema & Queries

---

## 1. Database Choice: MongoDB (NoSQL)

### Why MongoDB?

| Criteria | Justification |
|----------|---------------|
| **Schema Flexibility** | Notifications can carry varying `metadata` depending on the type (placement link, event venue, result PDF URL). MongoDB's flexible document model handles this without ALTER TABLE operations. |
| **High Write Throughput** | A campus platform generates notifications in bursts (e.g., result day, placement drive announcements). MongoDB handles high-velocity inserts efficiently with its write-optimized storage engine (WiredTiger). |
| **Horizontal Scalability** | As the student population and notification volume grow, MongoDB supports sharding natively, distributing data across multiple nodes. |
| **Natural JSON Mapping** | The API request/response bodies are JSON. MongoDB stores BSON (binary JSON), eliminating the impedance mismatch between the application layer and the database. |
| **Time-Series Friendly** | Notifications are naturally time-ordered and mostly append-only, fitting MongoDB's document model well. |
| **TTL Indexes** | MongoDB supports TTL (Time-To-Live) indexes that can automatically delete old notifications, reducing manual cleanup. |

---

## 2. Database Schema

### Collection: `notifications`

```javascript
{
  _id: ObjectId,                    // Auto-generated unique identifier
  title: String,                    // Notification title (max 200 chars)
  message: String,                  // Notification body (max 1000 chars)
  type: String,                     // Enum: "placement" | "event" | "result"
  status: String,                   // Enum: "read" | "unread" (default: "unread")
  priority: String,                 // Enum: "low" | "medium" | "high" (default: "low")
  metadata: Object,                 // Flexible additional data (links, venue, company name, etc.)
  readAt: Date | null,              // Timestamp when notification was read
  createdAt: Date,                  // Auto-generated creation timestamp
  updatedAt: Date                   // Auto-generated update timestamp
}
```

### Mongoose Schema Definition

```javascript
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      required: true,
      enum: ["placement", "event", "result"],
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
```

---

## 3. Indexes

```javascript
// Index for filtering by status (read/unread queries)
notificationSchema.index({ status: 1 });

// Index for filtering by type (placement/event/result)
notificationSchema.index({ type: 1 });

// Index for sorting by creation time (most recent first)
notificationSchema.index({ createdAt: -1 });

// Compound index for common query pattern: filter by status + sort by date
notificationSchema.index({ status: 1, createdAt: -1 });

// Compound index for type filtering + date sorting
notificationSchema.index({ type: 1, createdAt: -1 });

// TTL index to auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

---

## 4. Problems with Increasing Data Volume & Solutions

### Problem 1: Slow Queries on Large Collections

**Issue:** As notifications grow to millions of documents, queries without proper indexes result in full collection scans.

**Solution:**
- Create compound indexes that match query patterns (status + createdAt, type + createdAt).
- Use `explain()` to identify and optimize slow queries.
- Use covered queries where possible (query uses only indexed fields).

### Problem 2: Unbounded Collection Growth

**Issue:** Notifications accumulate indefinitely, consuming disk space and degrading performance.

**Solution:**
- Implement TTL indexes to auto-expire old notifications (e.g., 90 days).
- Use capped collections for a sliding window of recent notifications if archival is needed.
- Implement archival: move old notifications to a separate `notifications_archive` collection.

### Problem 3: Memory Pressure from Large Result Sets

**Issue:** Fetching thousands of notifications in a single query causes memory spikes and slow responses.

**Solution:**
- Enforce pagination (limit/skip or cursor-based).
- Use projection to return only required fields.
- Implement cursor-based pagination using `_id` for consistent performance regardless of offset size.

### Problem 4: Write Contention During Bulk Updates

**Issue:** "Mark All as Read" updates potentially thousands of documents simultaneously, causing write locks.

**Solution:**
- Use `updateMany` with appropriate write concern.
- For very large batches, implement chunked updates (process 500 documents at a time).
- Consider eventual consistency for non-critical status updates.

### Problem 5: Horizontal Scaling Needs

**Issue:** A single MongoDB instance cannot handle the load of a growing campus.

**Solution:**
- Use MongoDB Replica Sets for read scaling (read from secondaries).
- Implement sharding with `type` or `createdAt` as the shard key for even data distribution.
- Use read preferences to distribute read load across replica members.

---

## 5. NoSQL Queries for Each REST API Endpoint

### 5.1 GET `/api/v1/notifications` — Fetch All Notifications (Paginated)

```javascript
// Basic paginated query
db.notifications.find({})
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

// With status filter
db.notifications.find({ status: "unread" })
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(20);

// With type filter
db.notifications.find({ type: "placement" })
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(20);

// Count for pagination metadata
db.notifications.countDocuments({ status: "unread" });
```

### 5.2 GET `/api/v1/notifications/:id` — Fetch Single Notification

```javascript
db.notifications.findOne({ _id: ObjectId("664f1a2b3c4d5e6f7a8b9c0d") });
```

### 5.3 POST `/api/v1/notifications` — Create Notification

```javascript
db.notifications.insertOne({
  title: "TCS Placement Drive - June 2026",
  message: "TCS is conducting on-campus placement drive on 15th June. Eligible branches: CSE, IT, ECE. Register on the placement portal.",
  type: "placement",
  status: "unread",
  priority: "high",
  metadata: {
    company: "TCS",
    date: "2026-06-15",
    eligibleBranches: ["CSE", "IT", "ECE"],
    registrationLink: "/placement/tcs-june-2026"
  },
  readAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 5.4 PATCH `/api/v1/notifications/:id/read` — Mark as Read

```javascript
db.notifications.findOneAndUpdate(
  { _id: ObjectId("664f1a2b3c4d5e6f7a8b9c0d") },
  {
    $set: {
      status: "read",
      readAt: new Date(),
      updatedAt: new Date()
    }
  },
  { returnDocument: "after" }
);
```

### 5.5 PATCH `/api/v1/notifications/read-all` — Mark All as Read

```javascript
db.notifications.updateMany(
  { status: "unread" },
  {
    $set: {
      status: "read",
      readAt: new Date(),
      updatedAt: new Date()
    }
  }
);
```

### 5.6 DELETE `/api/v1/notifications/:id` — Delete Notification

```javascript
db.notifications.findOneAndDelete({
  _id: ObjectId("664f1a2b3c4d5e6f7a8b9c0d")
});
```

### 5.7 GET `/api/v1/notifications/unread-count` — Get Unread Count

```javascript
db.notifications.countDocuments({ status: "unread" });
```

---

## 6. Sample Documents

### Placement Notification
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c01",
  "title": "TCS Placement Drive - June 2026",
  "message": "TCS is conducting on-campus placement drive on 15th June. Eligible branches: CSE, IT, ECE.",
  "type": "placement",
  "status": "unread",
  "priority": "high",
  "metadata": {
    "company": "TCS",
    "date": "2026-06-15",
    "eligibleBranches": ["CSE", "IT", "ECE"],
    "registrationLink": "/placement/tcs-june-2026"
  },
  "readAt": null,
  "createdAt": "2026-06-09T09:00:00.000Z",
  "updatedAt": "2026-06-09T09:00:00.000Z"
}
```

### Event Notification
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c02",
  "title": "Annual Tech Fest - Hackathon Registration Open",
  "message": "Register for the 24-hour hackathon at the annual tech fest. Teams of 2-4 members. Prizes worth 50K.",
  "type": "event",
  "status": "unread",
  "priority": "medium",
  "metadata": {
    "eventName": "Tech Fest 2026",
    "venue": "Main Auditorium",
    "date": "2026-06-20",
    "registrationDeadline": "2026-06-18"
  },
  "readAt": null,
  "createdAt": "2026-06-09T10:30:00.000Z",
  "updatedAt": "2026-06-09T10:30:00.000Z"
}
```

### Result Notification
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c03",
  "title": "6th Semester Results Declared",
  "message": "Results for 6th semester examinations have been published. Check the results portal.",
  "type": "result",
  "status": "read",
  "priority": "high",
  "metadata": {
    "semester": 6,
    "resultLink": "/results/sem6-2026",
    "publishedBy": "Examination Cell"
  },
  "readAt": "2026-06-09T12:00:00.000Z",
  "createdAt": "2026-06-09T11:00:00.000Z",
  "updatedAt": "2026-06-09T12:00:00.000Z"
}
```

---

## 7. Aggregation Queries (Analytics)

### Count notifications by type
```javascript
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
]);
```

### Count unread by type
```javascript
db.notifications.aggregate([
  { $match: { status: "unread" } },
  { $group: { _id: "$type", unreadCount: { $sum: 1 } } }
]);
```

### Notifications per day (last 7 days)
```javascript
db.notifications.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: -1 } }
]);
```

---

## 8. Data Retention Strategy

| Age | Action |
|-----|--------|
| 0–30 days | Active — fully queryable |
| 30–90 days | Warm — available but lower priority |
| 90+ days | Auto-deleted via TTL index |

The TTL index on `createdAt` automatically removes documents older than 90 days, keeping the collection size manageable without manual intervention.

---

# Stage 3

## Query Analysis, Optimization & Indexing Strategy

---

## 1. Analyzing the Given Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is this query accurate?

Yes and no. Functionally, it does what it intends to do — it pulls all unread notifications for student 1042 sorted by time. But there are a few issues that make it less than ideal for a table with 5 million rows:

1. **`SELECT *` pulls every column** — this forces the DB engine to read the entire row from disk even if the frontend only needs `title`, `message`, and `createdAt`. On a wide table with metadata/BLOB columns, this wastes I/O bandwidth significantly.

2. **`ORDER BY createdAt ASC`** — sorting 5M rows (or even the subset matching the WHERE clause) requires either an index that already stores data in that order, or an expensive filesort operation in memory/disk. Without a proper index, MySQL will create a temporary table to sort.

3. **No LIMIT clause** — if a student has 500 unread notifications, the query dumps all of them in one shot. In practice you'd want pagination.

4. **Boolean handling** — `isRead = false` works but depending on the DB engine and how the column was defined (BOOLEAN vs TINYINT), the optimizer might handle it differently. Not a major issue, just something to be aware of.

---

## 2. Why is this query slow?

With 5,000,000 notifications and 50,000 students, here's what's happening under the hood:

### Without proper indexes:

The DB performs a **full table scan** — it reads all 5M rows one by one, checks if `studentID = 1042` AND `isRead = false`, collects the matches, then sorts them by `createdAt`. 

Let me break down the cost:

| Operation | What happens | Cost |
|-----------|-------------|------|
| Full table scan | Engine reads every row from disk | O(n) where n = 5,000,000 |
| Filter (WHERE) | Check two conditions per row | Still O(n) — every row is checked |
| Sort (ORDER BY) | Sort matching rows by createdAt | O(k log k) where k = matched rows |
| Return (`SELECT *`) | Fetch all columns for matched rows | Extra I/O for wide rows |

Even if only 100 rows match for student 1042, the engine still touches all 5M rows to find them. That's the core problem.

### Estimated computation cost:

- **Disk I/O**: ~5M row reads × average row size. If each row is 500 bytes, that's ~2.5 GB of data scanned.
- **CPU**: 5M comparisons for the WHERE clause
- **Memory**: Temporary sort buffer for matched rows
- **Time**: On a typical server, this could take 10-30 seconds depending on hardware and disk type.

---

## 3. What would I change?

### Fix 1: Add a composite index

```sql
CREATE INDEX idx_student_unread_date 
ON notifications (studentID, isRead, createdAt);
```

This one index solves all three problems:
- Directly jumps to studentID = 1042 (no full scan)
- Within that, narrows to isRead = false
- Data is already sorted by createdAt, so no filesort needed

### Fix 2: Don't use SELECT *

```sql
SELECT id, title, message, type, priority, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC
LIMIT 20 OFFSET 0;
```

Only grab what the API actually returns. If the index covers these columns, we get a **covering index** (the engine doesn't even need to touch the main table).

### Fix 3: Add pagination

The LIMIT + OFFSET prevents returning massive result sets. For cursor-based pagination (better at scale):

```sql
SELECT id, title, message, type, priority, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false AND createdAt > '2026-06-01T00:00:00'
ORDER BY createdAt ASC
LIMIT 20;
```

### After optimization — new cost:

| Operation | What happens | Cost |
|-----------|-------------|------|
| Index seek | B-tree traversal to studentID=1042, isRead=false | O(log n) |
| Index scan | Read matching entries in order | O(k) where k = matched rows |
| No sort needed | Index already in createdAt order | O(1) |
| Limited output | Return max 20 rows | Constant |

From 10-30 seconds down to **< 10 milliseconds**. That's the power of proper indexing.

---

## 4. Should you add indexes on every column?

A colleague suggested "just add indexes on every column to be safe." Here's why that's bad advice:

### Why indexing every column is NOT effective:

| Problem | Explanation |
|---------|-------------|
| **Write performance degrades** | Every INSERT, UPDATE, or DELETE must now update every single index. With 10+ indexes on a table getting hundreds of writes per second, this becomes a serious bottleneck. |
| **Disk space bloat** | Each index is essentially a copy of that column's data in a B-tree structure. 10 indexes on a 5M-row table could easily double or triple storage requirements. |
| **Optimizer confusion** | When too many indexes exist, the query planner might pick a suboptimal index. It spends more time evaluating which index to use (query planning overhead). |
| **Maintenance overhead** | Index fragmentation accumulates over time. More indexes = more OPTIMIZE TABLE operations needed. |
| **Composite queries ignored** | Single-column indexes don't help multi-column WHERE clauses efficiently. The DB can only use one index per table access (in most cases), or it does an index merge which is slower than a proper composite index. |

### What to do instead:

- Look at your actual query patterns (the WHERE, ORDER BY, and JOIN clauses your app uses)
- Create **composite indexes** that match those patterns
- Follow the left-prefix rule: put the most selective column first
- Use `EXPLAIN` to verify the optimizer uses your indexes
- Monitor slow query logs to identify missing indexes over time

**Rule of thumb**: 3-5 well-designed composite indexes beat 15 single-column indexes every time.

---

## 5. Query: Students who got a placement notification in the last 7 days

The table has a `notificationType` column with enum values: "Event", "Result", "Placement".

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

### Why this works:

- `notificationType = 'Placement'` filters to only placement-type entries
- `createdAt >= NOW() - INTERVAL 7 DAY` limits to the last week
- `DISTINCT studentID` ensures each student appears once even if they received multiple placement notifications

### Supporting index:

```sql
CREATE INDEX idx_type_date_student 
ON notifications (notificationType, createdAt, studentID);
```

This index:
1. Jumps straight to `notificationType = 'Placement'` entries
2. Within those, scans only rows from the last 7 days (range scan on createdAt)
3. Has `studentID` in the index so DISTINCT can be resolved from the index alone (covering index)

### Estimated cost with this index:

Assuming ~1M placement notifications total, and ~50K from the last 7 days:
- Index seek: O(log n) to find "Placement" + start date
- Index range scan: reads ~50K index entries
- No table access needed (covering index)
- Execution time: **< 50ms**

### Without the index:

Full table scan of 5M rows, filter, then sort/distinct. Easily 15-20 seconds.

---

## 6. Summary of Recommendations

| # | Action | Impact |
|---|--------|--------|
| 1 | Replace `SELECT *` with specific columns | Reduces I/O, enables covering indexes |
| 2 | Add composite index `(studentID, isRead, createdAt)` | Eliminates full scan, removes filesort |
| 3 | Add LIMIT for pagination | Prevents memory issues on large result sets |
| 4 | Don't index every column blindly | Saves write performance and storage |
| 5 | Create targeted composite indexes based on query patterns | Best performance-to-cost ratio |
| 6 | Use EXPLAIN regularly | Catch slow queries before they hit production |
| 7 | Consider partitioning by date for tables > 10M rows | Faster range queries and easier maintenance |

---

# Stage 4

## Performance Optimization — Reducing DB Load on Page Loads

---

## The Problem

Every time a student opens the notification page, the app fires a query to the database. With 50,000 students and frequent page loads (think: students refreshing before placement results), the DB gets hammered with thousands of identical or near-identical queries per minute. The database becomes the bottleneck — response times climb from milliseconds to seconds, and eventually the connection pool gets exhausted.

The root cause is straightforward: we're treating the database as if it's cheap to query, but at scale, every round trip costs CPU, memory, disk I/O, and a connection slot.

---

## Strategy 1: Caching Layer (Redis)

### How it works

Place a Redis cache between the application and MongoDB. When a student requests their notifications:

1. Check Redis first — if the data exists and isn't stale, return it immediately
2. If cache miss, query MongoDB, store the result in Redis with a TTL, then return
3. When a new notification is created or marked as read, invalidate the relevant cache entry

### Implementation sketch

```javascript
const redis = require("redis");
const client = redis.createClient();

async function getNotifications(page, limit) {
  const cacheKey = `notifications:page:${page}:limit:${limit}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    Log("backend", "info", "cache", `Cache HIT for ${cacheKey}`);
    return JSON.parse(cached);
  }

  // Cache miss — hit the DB
  Log("backend", "info", "cache", `Cache MISS for ${cacheKey}, querying DB`);
  const result = await Notification.find({})
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Store in cache with 60-second TTL
  await client.setEx(cacheKey, 60, JSON.stringify(result));
  return result;
}
```

### Cache invalidation

```javascript
// When a notification is created or modified
async function invalidateCache() {
  const keys = await client.keys("notifications:*");
  if (keys.length > 0) {
    await client.del(keys);
  }
  Log("backend", "info", "cache", `Invalidated ${keys.length} cache entries`);
}
```

### Tradeoffs

| Advantage | Disadvantage |
|-----------|--------------|
| Massive read performance boost (sub-ms responses from Redis) | Adds infrastructure complexity (another service to maintain) |
| DB load drops by 80-95% for repeated queries | Stale data risk — students might not see the newest notification for up to TTL seconds |
| Redis is dirt cheap on memory for this data size | Cache invalidation is tricky to get right (can lead to bugs) |
| Horizontal scaling is easy — Redis Cluster handles partitioning | Extra cost — need to run and monitor a Redis instance |
| Works great for data that's read far more than it's written | Cold start problem — first request after invalidation still hits DB |

### When to use this

Best fit when read-to-write ratio is high (our case: notifications are read 100x more than they're written). The 60-second TTL is a good balance — new notifications appear within a minute.

---

## Strategy 2: WebSocket Push (Eliminate Polling Entirely)

### How it works

Instead of students refreshing the page to check for new notifications, the server pushes updates to the client the instant something happens. The frontend maintains a persistent WebSocket connection — no repeated DB queries needed.

Flow:
1. Student opens the page → one initial DB query loads notifications
2. WebSocket connection stays open
3. When a new notification is created → server emits event → client prepends it to the list
4. No more page reload queries for "what's new"

### What this means for DB load

- **Before**: 50,000 students × 3 page loads per hour = 150,000 queries/hour
- **After**: 50,000 initial queries + only N queries when new notifications are actually created
- If 20 notifications are created per hour, that's 20 DB writes vs 150,000 reads eliminated

### Already implemented in our codebase

We already have Socket.IO in `notification_app_be/socket/index.js` and the frontend listens for `new_notification`, `notification_read`, etc. The client state updates in real-time without polling.

### Tradeoffs

| Advantage | Disadvantage |
|-----------|--------------|
| Truly real-time — instant delivery, no lag | WebSocket connections consume server memory (~10KB per connection) |
| Eliminates most read queries entirely | 50,000 concurrent connections need a beefy server or horizontal scaling |
| Better UX — notifications appear without refresh | If connection drops, client needs reconnection logic + a catch-up mechanism |
| Less bandwidth than polling (no repeated HTTP overhead) | Harder to debug than simple REST (stateful connection) |
| | Load balancers need sticky sessions or Redis adapter for Socket.IO |

### Scaling WebSockets

For 50K concurrent connections:
- Use `@socket.io/redis-adapter` so multiple Node.js processes can share socket state
- Deploy behind a load balancer with WebSocket support (nginx with `proxy_pass` upgrade)
- Each Node process can handle ~10K connections, so 5 processes covers the load

---

## Strategy 3: HTTP Response Caching (ETag / Conditional Requests)

### How it works

Add ETag headers to API responses. When the client makes a request, it sends the ETag from the last response. If nothing changed, the server returns `304 Not Modified` without hitting the DB or transferring the payload again.

```javascript
app.use((req, res, next) => {
  // Generate ETag based on response content hash
  res.set("Cache-Control", "private, max-age=30");
  next();
});
```

### Tradeoffs

| Advantage | Disadvantage |
|-----------|--------------|
| Zero infrastructure addition — works with standard HTTP | Still makes a round trip to the server (just saves bandwidth, not server-side DB query unless combined with server cache) |
| Browsers handle it natively | Only useful if data hasn't changed — if notifications update frequently, ETags rarely match |
| Reduces bandwidth by 90%+ on cache hits | Doesn't reduce DB load unless the server also caches internally |
| Easy to implement with Express middleware | Limited to GET requests |

### Verdict

Helpful as a supplementary strategy but doesn't solve the core DB load problem on its own. Best combined with Strategy 1.

---

## Strategy 4: Pagination + Lazy Loading

### How it works

Instead of fetching all notifications at once, load only the first 15-20 items. As the student scrolls down, fetch the next page. This is already partially implemented but can be improved with cursor-based pagination.

### Cursor-based pagination (better than offset)

```javascript
// First page
db.notifications.find({})
  .sort({ createdAt: -1 })
  .limit(20);

// Next page — use last item's createdAt as cursor
db.notifications.find({ createdAt: { $lt: lastSeenCreatedAt } })
  .sort({ createdAt: -1 })
  .limit(20);
```

### Why cursor-based beats offset/skip

With `skip(1000)`, MongoDB still scans and discards 1000 documents. With a cursor, it seeks directly to the right position using the index. On page 50, offset pagination scans 1000 docs to skip; cursor pagination scans 0.

### Tradeoffs

| Advantage | Disadvantage |
|-----------|--------------|
| Each query returns a small, fixed-size result set | Only helps if students actually scroll gradually (if they jump to "page 50", cursor can't do that) |
| Cursor-based is O(1) regardless of page depth | Slightly more complex client logic (track cursor state) |
| DB reads fewer documents per query | Doesn't reduce total queries — just makes each one cheaper |
| Memory-friendly on both server and client | Still hits DB on every page load without caching |

---

## Strategy 5: Database Read Replicas

### How it works

Set up MongoDB replica set with one primary (handles writes) and 2-3 secondaries (handle reads). Point all notification GET queries to read replicas, spreading the load.

```javascript
mongoose.connect(MONGODB_URI, {
  readPreference: "secondaryPreferred"
});
```

### Tradeoffs

| Advantage | Disadvantage |
|-----------|--------------|
| Linear read scaling — add more replicas as users grow | Replication lag — reads might be slightly behind (eventual consistency) |
| Zero code changes (just a connection config) | Doesn't reduce individual query cost, just distributes load |
| Built into MongoDB — no extra tools needed | More infrastructure to manage (monitoring, failover) |
| Write path unaffected | Storage cost multiplied by replica count |

---

## My Recommended Approach (Combination)

No single strategy is a silver bullet. Here's what I'd actually deploy:

```
┌──────────────────────────────────────────────────────────┐
│                    Client (React)                         │
│  1. Initial load → REST API (cached)                     │
│  2. Real-time updates → WebSocket (no more polling)      │
│  3. Scroll → Cursor-based pagination                     │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                   Node.js Server                          │
│  - Redis cache (60s TTL) for GET /notifications          │
│  - Socket.IO for real-time push                          │
│  - Cache invalidation on POST/PATCH/DELETE               │
└───────────┬────────────────────────────┬─────────────────┘
            │                            │
            ▼                            ▼
┌──────────────────┐         ┌─────────────────────┐
│   Redis Cache    │         │  MongoDB Replica Set │
│   (hot data)     │         │  Primary + 2 Replicas│
└──────────────────┘         └─────────────────────┘
```

### Priority order of implementation:

1. **Redis caching** — biggest bang for buck, eliminates 90%+ of DB reads
2. **WebSocket push** — already in place, eliminates refresh-based polling
3. **Cursor-based pagination** — makes remaining queries cheap
4. **Read replicas** — for when you outgrow a single node

This layered approach means the DB is only queried on cache misses and writes. For our 50K student scenario, the DB goes from handling 150K+ queries/hour to maybe 5K queries/hour — a 97% reduction.

---

# Stage 5

## Bulk Notification System — Reliability & Fault Tolerance

---

## 1. The Original Implementation

```pseudocode
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)    # calls Email API
        save_to_db(student_id, message)    # DB insert
        push_to_app(student_id, message)   # real-time via Socket.IO
```

---

## 2. Shortcomings I See

### Problem 1: Sequential processing of 50,000 students

The loop runs one student at a time. If `send_email` takes 200ms per call (typical for external SMTP APIs), that's:
- 50,000 × 200ms = 10,000 seconds = **~2.7 hours** just for emails
- Meanwhile, students at the end of the list get their notification hours after the HR clicked the button

### Problem 2: No error handling — one failure kills the rest

If `send_email` throws an error at student #24,801, the entire loop crashes. Students #24,802 through #50,000 get nothing — no email, no DB record, no push notification. There's no retry, no tracking of what succeeded vs failed.

### Problem 3: Tightly coupled operations

Email, DB save, and push notification are bundled in sequence for each student. If the email API is slow (rate limited, timeout), it blocks the DB insert and push — even though those two would complete instantly. One slow dependency holds everything hostage.

### Problem 4: No idempotency

If the server crashes at student #30,000 and you restart the function, how do you know which students already got notified? Running it again sends duplicate emails to the first 30,000 students. There's no way to safely resume.

### Problem 5: Memory and connection exhaustion

Processing 50K students in a tight loop keeps DB connections and socket connections pinned. The email API might rate-limit you after a few hundred requests. No backpressure handling exists.

---

## 3. What happens when send_email fails for 200 students?

With the current implementation — nothing good. Since there's no error handling:
- Those 200 students never got their email
- Depending on where `send_email` is in the sequence, they might also not have gotten their DB insert or push notification
- We have no record of which students failed
- We can't retry just the failed ones without re-running the whole batch

---

## 4. Should DB save and email happen together?

**No. They absolutely should not happen in the same synchronous operation.** Here's why:

### Different reliability profiles

| Operation | Speed | Reliability | Can retry safely? |
|-----------|-------|-------------|-------------------|
| `save_to_db` | 2-5ms | 99.99% (local MongoDB) | Yes (upsert with idempotency key) |
| `send_email` | 100-500ms | ~95% (external API, network dependent) | Yes, but might send duplicates |
| `push_to_app` | 1-2ms | ~99% (local Socket.IO) | Yes (client handles duplicates) |

The DB insert is fast and reliable. The email is slow and flaky. Coupling them means a perfectly good DB operation gets blocked or fails because some external email server is having a bad day.

### The right mental model

Think of it as two separate concerns:
1. **Record the notification** (DB + push) — this must happen immediately and reliably
2. **Deliver via email** — this can happen asynchronously, with retries, at its own pace

---

## 5. Redesigned Architecture

### Core principle: Separate the "record" from the "deliver"

```
HR clicks "Notify All"
        │
        ▼
┌─────────────────────────┐
│  1. Create bulk job     │  (one DB record for the batch)
│  2. Queue all students  │  (push 50K messages into a queue)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│              Message Queue (Bull/Redis)           │
│  50,000 individual jobs, each with student_id    │
└──────┬──────────────────┬───────────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│  Worker 1    │   │  Worker 2    │   ... (N workers)
│  Process job │   │  Process job │
└──────┬───────┘   └──────┬───────┘
       │                   │
       ▼                   ▼
  For each student:
  ┌──────────────────────────────┐
  │ 1. save_to_db (fast, local)  │  ← MUST succeed
  │ 2. push_to_app (fast, local) │  ← best effort
  │ 3. send_email (slow, retry)  │  ← async with retries
  └──────────────────────────────┘
```

---

## 6. Revised Pseudocode

```pseudocode
// =========================================================
// STEP 1: HR triggers bulk notification
// =========================================================
function notify_all(student_ids: array, message: string):
    // Create a batch record to track this bulk operation
    batch_id = save_batch_record(student_ids.length, message)
    
    // Split into chunks of 500 and queue them
    chunks = split_into_chunks(student_ids, 500)
    for chunk in chunks:
        queue.add("process_notification_chunk", {
            batch_id: batch_id,
            student_ids: chunk,
            message: message
        })
    
    Log("backend", "info", "controller", 
        "Bulk notification queued: batch={batch_id}, students={student_ids.length}")
    
    return { batch_id, status: "queued", total: student_ids.length }


// =========================================================
// STEP 2: Worker processes each chunk (runs in background)
// =========================================================
function process_notification_chunk(job):
    batch_id = job.data.batch_id
    student_ids = job.data.student_ids
    message = job.data.message
    
    for student_id in student_ids:
        try:
            // DB insert — fast and reliable, do this first
            notification = save_to_db(student_id, message)
            
            // Push via Socket.IO — fast, fire-and-forget
            push_to_app(student_id, message)
            
            // Queue email separately (don't block on it)
            email_queue.add("send_single_email", {
                student_id: student_id,
                message: message,
                notification_id: notification.id
            }, { 
                attempts: 3,           // retry up to 3 times
                backoff: { type: "exponential", delay: 5000 }
            })
            
            update_batch_progress(batch_id, "success")
            
        catch error:
            Log("backend", "error", "service", 
                "Failed for student={student_id}: {error.message}")
            update_batch_progress(batch_id, "failed", student_id)


// =========================================================
// STEP 3: Email worker (separate queue, own retry logic)
// =========================================================
function send_single_email(job):
    student_id = job.data.student_id
    message = job.data.message
    
    try:
        send_email(student_id, message)
        mark_email_sent(job.data.notification_id)
        Log("backend", "info", "service", 
            "Email sent to student={student_id}")
    catch error:
        Log("backend", "error", "service", 
            "Email failed for student={student_id}, attempt {job.attemptsMade}/3")
        throw error  // let the queue retry with backoff


// =========================================================
// STEP 4: Batch tracking (so HR can see progress)
// =========================================================
function get_batch_status(batch_id):
    batch = get_batch_record(batch_id)
    return {
        total: batch.total,
        processed: batch.success_count + batch.fail_count,
        succeeded: batch.success_count,
        failed: batch.fail_count,
        failed_students: batch.failed_student_ids,
        status: batch.fail_count == 0 ? "completed" : "completed_with_errors"
    }
```

---

## 7. How This Handles the "200 Failed Emails" Scenario

With the redesigned system:

1. **DB saves and push notifications succeed for all 50,000 students** — these aren't blocked by email failures
2. **Email queue retries failed emails automatically** — 3 attempts with exponential backoff (5s, 10s, 20s)
3. **After 3 failed attempts, the job lands in a "dead letter" queue** — we know exactly which 200 students failed
4. **HR can check batch status** — sees "49,800 succeeded, 200 failed" with the list of failed student IDs
5. **Admin can retry just the 200 failures** — no risk of duplicate emails for the 49,800 who already got theirs

---

## 8. Why This Design is Reliable and Fast

| Aspect | Before | After |
|--------|--------|-------|
| **Speed** | Sequential, ~2.7 hours | Parallel workers, ~2-5 minutes |
| **Email failures** | Kills entire process | Retried individually, doesn't affect others |
| **DB + Push** | Blocked by slow email | Completes instantly, decoupled from email |
| **Observability** | No idea what happened | Batch tracker shows real-time progress |
| **Resume after crash** | Impossible, start over | Queue persists jobs, workers pick up where they left off |
| **Duplicate protection** | None | Idempotency keys on DB inserts, deduplication on email |
| **Scalability** | One loop, one server | N workers across multiple servers |

---

## 9. Key Design Decisions

1. **Queue over loop** — a message queue (Bull + Redis) gives persistence, retries, concurrency control, and crash recovery for free

2. **Separate email from DB** — treating email as an async side-effect rather than a synchronous requirement means the core notification logic can't be derailed by external API issues

3. **Chunked processing** — processing 500 students per job (instead of 1 or 50,000) balances memory usage with throughput. If a job fails, we only retry 500, not 50K

4. **Exponential backoff** — if the email API is rate-limiting us, hammering it immediately makes things worse. Waiting 5s, then 10s, then 20s gives it breathing room

5. **Dead letter queue** — permanently failed jobs don't disappear. They sit in a known place where someone can investigate and manually intervene
