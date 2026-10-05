# JobAllocate Notification System Specification

> **Document Version:** 1.0.0

---

## 1. Notification Architecture
- **In-App Notification Inbox**: Queryable via `GET /api/v1/notifications` displaying title, message body, created timestamp, and read status.
- **Unread Count**: `GET /api/v1/notifications/unread-count` populates bell badge.
- **Mark All Read**: `POST /api/v1/notifications/read-all`.
- **FCM Push Messaging**: FCM token registration via `POST /api/v1/device-token`.
