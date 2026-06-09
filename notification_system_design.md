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
