# Architecture

## System Overview
- **Client-Server**: Separated `frontend` and `backend`.
- **Stateless Backend**: Express server with API endpoints.
- **Persistent Data**: Firebase Firestore (NoSQL).
- **Scheduled Tasks**: `node-cron` handle background notifications.

## Frontend
- **SPA**: React with Router.
- **Modular Components**: `src/components`, `src/admin`, `src/pages`.
- **State Management**: React Hooks.

## Backend
- **Core Strategy**: CRUD operations + Third-party API integrations.
- **File Handling**: Local disk storage (`uploads/`).
- **Security Middleware**: CORS, Rate limiting (if implemented later).
