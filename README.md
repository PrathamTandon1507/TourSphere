# TourSphere

Full-stack tour booking platform with a Node.js/Express API, MongoDB data layer, and React (Vite) frontend.  
It supports authentication, tour management, reviews, geospatial queries, image uploads, and payment-driven bookings.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Available Scripts](#available-scripts)
- [High-Level Route Map](#high-level-route-map)
- [Data Seeding](#data-seeding)
- [Security and Middleware](#security-and-middleware)
- [Troubleshooting](#troubleshooting)
- [Production Notes](#production-notes)

## Overview

TourSphere is a travel/tour platform where users can:

- browse and filter tours
- view location-aware tour data
- create accounts and authenticate with JWT-based sessions
- add reviews and ratings
- complete bookings through a payment flow

The backend serves APIs under `/api/v1/*` and can also serve the built React SPA from `client/dist`.

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Image processing (`multer`, `sharp`)
- Payments integration (`axios` + payment provider endpoints)
- Security middleware (`helmet`, `express-mongo-sanitize`, `hpp`, `cors`)

### Frontend

- React
- React Router
- Vite
- Tailwind CSS

## Project Structure

```text
node-3 natours/
├─ client/                 # React app (Vite)
├─ public/                 # Static assets
├─ scripts/                # Utility scripts
├─ server/
│  ├─ config/              # Env bootstrap/loading
│  ├─ controllers/         # Route controllers
│  ├─ dev-data/            # Seed JSON data and import script
│  ├─ models/              # Mongoose schemas
│  ├─ routes/              # Express route modules
│  ├─ utils/               # Helpers and shared utilities
│  ├─ app.js               # Express app setup
│  └─ server.js            # App entrypoint + DB connection
├─ .env                    # Local environment variables (gitignored)
└─ package.json            # Root scripts and backend dependencies
```

## Features

- User authentication and authorization
- Role-based route protection
- Tour CRUD, filtering, sorting, pagination
- Nested reviews per tour
- Ratings aggregation and automatic tour rating updates
- Geospatial tour queries (distance/within radius)
- Tour image upload + resize pipeline
- Booking workflows with payment verification
- SPA fallback routing and static asset hosting

## Prerequisites

- Node.js 18+ recommended (project currently declares `>=10`)
- npm
- MongoDB database (Atlas or self-hosted)

## Environment Variables

This project loads env files through `server/config/loadEnv.js` in this order:

1. `.env.local`
2. `.env`
3. `config.env`

Create a root `.env` file and define at least the following keys:

```env
NODE_ENV=development
PORT=8000

DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_db_password_if_needed

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

FRONTEND_URL=http://localhost:5173

CLIENT_ID=your_payment_client_id
CLIENT_KEY_SECRET=your_payment_secret

EMAIL_FROM="TourSphere <no-reply@example.com>"
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

BREVO_HOST=
BREVO_PORT=587
BREVO_LOGIN=
BREVO_PASSWORD=
```

## Installation

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
npm --prefix client install
```

## Running the Project

Run backend in dev mode:

```bash
npm run dev
```

Run frontend in dev mode (separate terminal):

```bash
npm run client:dev
```

Build frontend:

```bash
npm run client:build
```

Run production backend:

```bash
npm start
```

## Available Scripts

From `package.json` (root):

- `npm start` - start backend server
- `npm run dev` - run backend with nodemon
- `npm run client:dev` - run Vite dev server
- `npm run client:build` - build React app
- `npm run client:preview` - preview built frontend
- `npm run build` - install deps and build frontend
- `npm run watch:js` - watch Parcel bundle for legacy public JS
- `npm run build:js` - legacy Parcel watch/build command

From `client/package.json`:

- `npm --prefix client run dev`
- `npm --prefix client run build`
- `npm --prefix client run lint`
- `npm --prefix client run preview`

## High-Level Route Map

The backend mounts these route groups in `server/app.js`:

- `/api/v1/tours`
- `/api/v1/users`
- `/api/v1/reviews`
- `/api/v1/bookings`
- `/pug` (legacy server-rendered views)

All non-API requests are routed to the frontend `client/dist/index.html` when available.

## Data Seeding

Seed data lives in:

- `server/dev-data/data/tours.json`
- `server/dev-data/data/users.json`
- `server/dev-data/data/reviews.json`

Import/delete utility:

- `server/dev-data/data/import-dev-data.js`

Use:

```bash
node server/dev-data/data/import-dev-data.js --import
node server/dev-data/data/import-dev-data.js --delete
```

## Security and Middleware

Key protections configured in `server/app.js`:

- `helmet` and CSP headers
- `express-mongo-sanitize`
- `hpp`
- request body size limiting
- `cookie-parser`
- `cors`

## Troubleshooting

- **Backend fails to start**: confirm `DATABASE` and `JWT_SECRET` are defined in root `.env`.
- **Frontend routes 404 in production**: ensure `npm run client:build` has generated `client/dist`.
- **Payment flow not working**: verify `CLIENT_ID` and `CLIENT_KEY_SECRET`.
- **Email not sending**: configure either SMTP (`EMAIL_*`) or Brevo (`BREVO_*`) env vars.
- **Auth cookies/session issues**: verify `NODE_ENV`, CORS credentials, and frontend URL settings.

## Production Notes

- Keep secrets only in env files or deployment secret stores.
- Set strict production values for CORS origins and cookie behavior.
- Consider enabling API rate limiting in production (`app.use('/api', limiter)` is currently commented).
- Replace in-memory pending payment transaction storage with Redis/DB-backed storage for horizontal scaling.
