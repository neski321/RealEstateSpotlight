# RealEstateSpotlight

A modern, full-stack real estate platform for discovering, listing, and managing properties. Built with React, Express, PostgreSQL, Firebase Auth, and Drizzle ORM.

## Features

- User authentication (email/password, Google)
- Role-based access (buyer, seller/agent)
- Property search and filtering
- Property detail pages with images and reviews
- Create, edit, and manage property listings (for agents/sellers)
- Favorites, search history, and viewing history
- User dashboard and profile management
- Booking system for property viewings
- Responsive, modern UI with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend:** React, TypeScript, Wouter, Tailwind CSS, Radix UI
- **Backend:** Express, TypeScript, Drizzle ORM, PostgreSQL
- **Authentication:** Firebase Auth (client), Firebase Admin SDK (server)
- **ORM:** Drizzle ORM
- **State Management:** React Context, React Query
- **Other:** Vite, esbuild, NeonDB (serverless Postgres)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (or NeonDB)
- Firebase project (for Auth)

### 1. Clone the repository
```bash
git clone <repo-url>
cd RealEstateSpotlight
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root and add the following:

```
# Database
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<db>

# Firebase Admin (server)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk-email
FIREBASE_PRIVATE_KEY=your-firebase-adminsdk-private-key

# Firebase Client (client/src/lib/firebase.ts uses VITE_ prefix)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

> **Note:** Never commit your `.env` or secrets to version control.

### 4. Run database migrations
```bash
npm run db:push
```

### 5. Start the development server
```bash
npm run dev
```
- The app will be available at [http://localhost:4001](http://localhost:4001)

## Authentication & User Roles
- Users can sign up with email/password or Google.
- Roles: `buyer`, `seller` (agent). Roles are managed in the database and synced to Firebase custom claims.
- Only authenticated users can create/edit listings, book viewings, or access the dashboard.
- Role switching is supported for users with multiple roles.

## Project Structure

```
RealEstateSpotlight/
  client/           # React frontend
    src/
      components/   # UI and feature components
      contexts/     # React Contexts (Auth, Theme)
      hooks/        # Custom hooks
      lib/          # API, Firebase, utilities
      pages/        # Route pages
  server/           # Express backend
    db.ts           # Database connection
    routes.ts       # API routes
    firebase.ts     # Firebase Admin SDK
    storage.ts      # Data access layer
  shared/           # Shared types and schema (Drizzle ORM)
  migrations/       # SQL migrations
  scripts/          # Utility scripts
```

## Scripts
- `npm run dev` — Start dev server (API + client)
- `npm run build` — Build client and server
- `npm run start` — Start production server
- `npm run db:push` — Run Drizzle ORM migrations

## License

MIT 