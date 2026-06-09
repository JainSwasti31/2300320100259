# Notification System - Full Stack Application

A full-stack notification platform with real-time delivery, built using React, Node.js, Express, MongoDB, Socket.IO, and Material UI.

## Project Structure

```
├── logging_middleware/         # Reusable logging package (sends logs to Test Server)
├── notification_system_design.md  # Stage 1: REST API design document
├── notification_app_be/        # Backend - Node.js + Express + Socket.IO
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Auth middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   └── socket/                 # WebSocket setup
└── notification_app_fe/        # Frontend - React + Material UI
    ├── public/                 # Static assets
    └── src/
        ├── components/         # React components
        └── services/           # API, Socket, Logger services
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Material UI 5 |
| Backend | Node.js + Express 4 |
| Real-time | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| Logging | Custom reusable middleware (REST API based) |

## Setup & Running

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a cloud instance

### Backend

```bash
cd notification_app_be
npm install
# Create .env file (see .env.example)
npm run dev
```

### Frontend

```bash
cd notification_app_fe
npm install
# Create .env file with REACT_APP_ variables
npm start
```

### Logging Middleware

```bash
cd logging_middleware
npm install
```

The logging middleware is consumed as a local package by both the backend and frontend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get all notifications (paginated) |
| GET | `/api/v1/notifications/:id` | Get single notification |
| POST | `/api/v1/notifications` | Create notification |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| GET | `/api/v1/notifications/unread-count` | Get unread count |

## Real-time Features

- WebSocket connection via Socket.IO
- Instant notification delivery
- Live read/unread status updates
- Automatic badge count updates

## Logging

The logging middleware sends structured logs to the Test Server with:
- **Stack**: backend / frontend
- **Level**: debug, info, warn, error, fatal
- **Package**: controller, middleware, handler, db, domain, api, component, state, etc.
- **Message**: Descriptive context about the event
