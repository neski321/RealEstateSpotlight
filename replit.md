# PropertyHub - Real Estate Property Management Platform

## Overview

PropertyHub is a full-stack real estate property management platform built with React, Express.js, and PostgreSQL. The application allows users to browse, search, and manage property listings with features including user authentication, property filtering, image galleries, reviews, and bookings.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and data fetching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: express-session with PostgreSQL store

### Database Design
- **Users**: Stores user profiles with Replit Auth integration
- **Properties**: Main property listings with detailed information
- **Property Images**: Associated images for each property
- **Reviews**: User reviews and ratings for properties
- **Bookings**: Property viewing appointments
- **Sessions**: Session storage for authentication

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Automatic user creation and profile updates
- **Authorization**: Route-level authentication middleware

### Property Management
- **Listing Creation**: Multi-step form for property creation
- **Search & Filtering**: Advanced filtering by location, type, price, amenities
- **Image Management**: Multiple image upload and gallery display
- **Property Details**: Comprehensive property information pages

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component System**: shadcn/ui components for consistent design
- **Navigation**: Persistent navigation with user authentication state
- **Search Experience**: Real-time search with filtering capabilities

### Review System
- **Rating System**: 5-star rating system for properties
- **Comments**: Text-based reviews with user attribution
- **Aggregation**: Average ratings and review counts

## Data Flow

1. **User Authentication**: 
   - Users authenticate via Replit Auth
   - Session stored in PostgreSQL
   - User profile synchronized with database

2. **Property Discovery**:
   - Landing page shows featured properties
   - Search and filter functionality
   - Paginated results with sorting options

3. **Property Management**:
   - Authenticated users can create listings
   - Multi-step creation process
   - Image upload and management
   - Property editing and deletion

4. **Booking System**:
   - Contact form for property inquiries
   - Email and phone contact information
   - Booking request management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **openid-client**: OpenID Connect authentication
- **express-session**: Session management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Production bundling

### Third-party Services
- **Replit Auth**: Authentication provider
- **Neon**: Serverless PostgreSQL database
- **Unsplash**: Placeholder images for properties

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with development database
- **Authentication**: Replit Auth with development credentials

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: ESBuild bundling Node.js application
- **Database**: Drizzle migrations for schema management
- **Deployment**: Single-command deployment to Replit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit application identifier
- **ISSUER_URL**: OpenID Connect issuer URL

## Changelog

- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.