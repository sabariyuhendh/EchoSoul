# EchoSoul - Emotional Wellness Platform

## Overview

EchoSoul is a comprehensive emotional wellness platform designed to provide users with various tools for emotional expression, mental health support, and personal growth. The application offers multiple interactive features including timed journaling sessions, emotional release activities, mood tracking, AI-powered letter writing, voice recording, and anonymous social support.

## System Architecture

### Frontend Architecture
The frontend is built using modern React with TypeScript, leveraging Vite for development and build tooling. The application uses a component-based architecture with:
- **React Router** for client-side routing
- **Shadcn/ui** component library with Radix UI primitives for consistent, accessible UI components
- **Tailwind CSS** for styling with a custom design system focused on calming, therapeutic colors
- **TanStack Query** for state management and data fetching
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
The backend follows a Node.js/Express.js server architecture with:
- **Express.js** server with custom middleware for logging and error handling
- **TypeScript** throughout the entire stack for type safety
- **Modular route structure** with placeholder for API endpoints
- **Storage abstraction layer** allowing for different storage implementations

### Component Structure
The application is organized into distinct functional areas:
- **Vault**: Timed 8-minute emotional release sessions
- **Letters**: AI-assisted letter writing with styling options
- **Let It Go**: Interactive emotional release through virtual activities (burn, smash, scream modes)
- **Mood Tracking**: Daily mood logging with trend analysis
- **Whisper**: Voice recording and playback functionality
- **Soulmate**: AI chatbot for emotional support
- **Feed**: Anonymous social platform for sharing experiences
- **Calm Space**: Meditation and ambient sound player

## Key Components

### Data Flow
The application implements a client-server architecture where:
1. React frontend communicates with Express backend via REST API
2. State management handled by TanStack Query for server state
3. Local state managed through React hooks
4. Form validation through React Hook Form + Zod schemas

### Authentication & Storage
- **PostgreSQL**: User authentication system with username/password (schema defined in `shared/schema.ts`)
- **MongoDB**: General application data storage for user content, posts, mood tracking, etc.
- **Cloudinary**: Voice file storage for Whisper functionality
- Configurable storage layer with in-memory implementation for development
- Database-ready with Drizzle ORM configured for PostgreSQL

### UI/UX Design System
- Dark theme with therapeutic color palette (calm blue, sage green, lavender, rose, amber)
- Consistent component library using Shadcn/ui
- Mobile-responsive design with progressive enhancement
- Accessibility-first approach using Radix UI primitives

## Data Flow

1. **User Interaction**: Users interact with React components through forms, buttons, and interactive elements
2. **State Management**: TanStack Query manages server state while React hooks handle local UI state
3. **API Communication**: Frontend makes HTTP requests to Express backend APIs
4. **Data Processing**: Backend processes requests using the storage abstraction layer
5. **Response Handling**: Data flows back through the query layer to update UI components

## External Dependencies

### Core Dependencies
- **React 18** with TypeScript for frontend framework
- **Express.js** for backend server
- **Drizzle ORM** with PostgreSQL support for database operations
- **Vite** for development server and build tooling
- **Tailwind CSS** for styling

### UI Libraries
- **Shadcn/ui** component library
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent iconography

### Development Tools
- **TypeScript** for type safety across the stack
- **ESBuild** for production builds
- **Replit-specific plugins** for development environment integration

## Deployment Strategy

The application is configured for deployment on Replit's infrastructure with:
- **Development mode**: Vite dev server with hot module replacement
- **Production build**: Vite builds static assets, ESBuild bundles server code
- **Auto-scaling deployment** target configured in `.replit`
- **PostgreSQL** database provisioning through Replit modules
- **Environment variable** configuration for database connections

### Build Process
1. `npm run build` compiles client assets with Vite and bundles server with ESBuild
2. Static assets output to `dist/public`
3. Server bundle output to `dist/index.js`
4. Production startup via `npm run start`

### Database Setup
- Drizzle ORM configured for PostgreSQL with connection via `DATABASE_URL`
- Schema definitions in `shared/schema.ts` for type-safe database operations
- Migration system configured in `drizzle.config.ts`

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Migration from Lovable to Replit completed:
  * Converted routing from React Router to Wouter
  * Fixed dark mode styling for Let It Go Room
  * Implemented backend API for Let It Go functionality with ephemeral storage
  * Added proper component styling and glassmorphism effects
  * Completed all interactive mode components (Burn, Smash, Scream)
  * Removed icons from navbar, switched to plain text navigation
  * Fixed button text visibility issues with proper contrast
- June 27, 2025. Database integration completed:
  * Added PostgreSQL database with Drizzle ORM
  * Migrated from MemStorage to DatabaseStorage implementation
  * Successfully pushed schema to database with users and letItGoEntries tables
  * Database connection established and verified
- June 29, 2025. Google OAuth authentication and UI fixes completed:
  * Implemented Google OAuth login using passport-google-oauth20
  * Added googleId field to users table schema for OAuth support
  * Created comprehensive authentication flow with Google sign-in
  * Fixed button text visibility issues with enhanced CSS styling
  * Added page-content class to all pages for proper navbar spacing
  * Updated login page with Google OAuth button and improved UI
  * Successfully configured authentication routes and user session handling
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```