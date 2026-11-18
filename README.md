# TransitPass – Online Bus Pass Management System

A full-stack B.Tech project: students apply for bus passes online, pay (simulated), and get a digital QR pass. Admins review applications and manage routes, pass types, users and payments.

**Stack:** React + Vite + Tailwind CSS · Node.js + Express · MySQL · JWT + bcrypt · Multer · qrcode

## Folder structure
```
transitpass/
  client/      React app (pages, components, API client)
  server/      Express API (routes → controllers → MySQL)
  database/    schema.sql
  .env.example
```

## Setup (about 5 minutes)

**You need:** Node.js 18+ and MySQL 8 running locally.

1. **Backend config**
   ```bash
   cd server
   cp .env.example .env        # then edit DB_PASSWORD and JWT_SECRET
   npm install
   ```
2. **Create the database and demo data** (this drops and recreates the TransitPass tables)
   ```bash
   npm run seed
   ```
3. **Start the API** (http://localhost:5000)
   ```bash
   npm run dev
   ```
4. **Start the frontend** in a second terminal (http://localhost:5173)
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Demo accounts
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@transitpass.com    | Admin@123   |
| Student | student@transitpass.com  | Student@123 |

## How the main flow works
1. Student registers, logs in and completes the 6-step application (route → pass type → start date → document → review). The price comes from the `pass_types` table.
2. Student pays (simulated UPI / Card / Net Banking). A transaction ID is saved in `payments`.
3. Admin opens **Applications**, checks the uploaded document and approves or rejects (a reason is required for rejection).
4. When an application is **approved and paid**, a pass with a unique number (`TP-2026-XXXXXX`) is created and the status becomes **Pass Issued**.
5. Student opens **My pass** to see the QR card and print or save it as PDF. Admin can check any pass number in **Verify pass**.

## Database tables
`users`, `routes`, `pass_types`, `applications`, `documents`, `payments`, `bus_passes` (foreign keys defined in `database/schema.sql`).

## API overview
| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `PUT /api/users/profile`, admin: `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id/status` |
| Routes / Pass types | `GET /api/routes`, `GET /api/pass-types` (public); admin: `POST`, `PUT /:id`, `DELETE /:id` (deactivates), `GET /admin/all` |
| Applications | `POST /api/applications` (multipart with `document`), `GET /api/applications`, `GET /:id`, admin: `PATCH /:id/approve`, `PATCH /:id/reject` |
| Payments | `POST /api/payments`, `GET /api/payments` |
| Passes | `GET /api/passes`, `GET /api/passes/:id` (includes QR), admin: `GET /api/passes/verify/:number` |
| Stats | `GET /api/stats/student`, `GET /api/stats/admin`, `GET /api/stats/notifications` |

## Notes
- Passwords are hashed with `bcryptjs` (a pure-JS bcrypt, so it installs without build tools). Admin routes are protected by JWT plus a role check.
- Payment is a simulation. No card or UPI details are sent to the server or stored.
- Uploaded files are saved in `server/uploads/`. For a production system you would serve them through an authenticated route.
- Print the pass with the **Download / Print Pass** button and choose "Save as PDF".
