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
