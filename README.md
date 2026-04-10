# Customer Support Ticket System

This project keeps your previous ticket UI and makes it full-stack with React, Express, and MySQL.

## Features

- Create ticket
- View open and closed tickets
- Update status to open or closed
- Add comments
- Filter tickets by priority

## Database tables

- `users (id, name, role)`
- `tickets (id, title, description, priority, isOpen, user_id)`
- `comments (id, ticket_id, message)`

## MySQL Setup

1. Copy `.env.example` to `.env`.
2. Add your MySQL credentials in `.env`.
3. Start the app. The Express server will create the database and tables automatically.
4. Run `server/seed.sql` in MySQL if you want sample data.

Example:

```sql
SOURCE server/seed.sql;
```

## Run

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

Vite proxies `/api` requests to the backend during development.

## API

- `GET /api/health`
- `GET /api/users`
- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/:id/status`
- `GET /api/tickets/:id/comments`
- `POST /api/tickets/:id/comments`
