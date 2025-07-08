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
- June 29, 2025. Google OAuth authentication and comprehensive UI fixes completed:
  * Implemented Google OAuth login using passport-google-oauth20
  * Added googleId field to users table schema for OAuth support
  * Created comprehensive authentication flow with Google sign-in
  * Fixed button text visibility issues with enhanced CSS styling and proper contrast
  * Added page-content class to all pages for proper navbar spacing
  * Updated login page with Google OAuth button and improved UI
  * Successfully configured authentication routes and user session handling
  * Fixed Scream Mode voice input with improved microphone access and error handling
  * Enhanced Whisper page microphone functionality with better audio quality
  * Fixed header layout issues across all pages (Letters, Mood, Feed, Soulmate)
  * Added comprehensive error messages for microphone permission issues
  * Improved apple-button styling with better shadows and transitions
- June 29, 2025. Fixed critical navbar overlap and button styling issues:
  * Resolved navbar overlap issue by adding proper page-content class spacing (90px top padding)
  * Applied page-content class consistently across all pages (Vault, Letters, Feed, LetItGo, CalmSpace)
  * Reverted button styling to premium, elegant, minimal design with subtle shadows and hover effects
  * Restored original calming color palette values for better aesthetic consistency
  * Enhanced button styling with proper glassmorphism effects and smooth transitions
  * Fixed text visibility while maintaining clean, minimal appearance
- June 29, 2025. Comprehensive UI refinement and consistency fixes:
  * Implemented universal 85px top spacing to eliminate navbar overlap across all pages
  * Removed unintended borders and backdrop effects from headings and text elements
  * Applied premium glassmorphism exclusively to cards and action buttons, not text
  * Enhanced button contrast with white text (#ffffff) and proper text shadows
  * Created consistent text gradient styles without background interference
  * Optimized dark mode colors for strong contrast and premium appearance
  * Applied smooth hover transitions and scaling effects for premium feel
  * Ensured consistent aesthetic across all pages: Vault, Calm Space, Let It Go, Feed, Whisper, Soulmate, Mood
- June 29, 2025. Major immersive experience enhancements:
  * Fixed DOM exceptions and voice input issues in ScreamMode with better error handling
  * Created 3D realistic SmashMode with physics-based destruction and power charging
  * Implemented realistic paper burning animation in BurnMode with text char-by-char burning
  * Developed interstellar black hole visualization for Calm Space with orbiting accretion disk
  * Added comprehensive animations: rotate-slow, pulse-slow, wobble, lens-distort, jet-pulse
  * Created Signup page with Google OAuth integration and premium styling
  * Fixed infinite loop issues in 3D components
  * Enhanced all interactive modes for maximum immersion and realism
- July 1, 2025. Hyper-realistic 3D Smash Mode and Calm Space cosmic integration:
  * Created SmashModeHyperRealistic component with ultra-realistic physics-based destruction
  * Implemented 5 distinct object types with realistic materials: Crystal Orb, Ceramic Vase, Glass Bottle, Obsidian Cube, Golden Sphere
  * Added power charging mechanism for smash force control (0-100%)
  * Integrated React Three Fiber with Rapier physics for realistic object destruction
  * Added complex material-based sound generation for each object type
  * Extended database schema with smashModeStats and calmSpacePreferences tables
  * Implemented analytics tracking for emotional release sessions
  * Enhanced Calm Space with toggleable cosmic debris effects
  * Added interactive smashable crystals to Calm Space for emotional release
  * Created debris intensity controls (0-100%) affecting particle count and crystal visibility
  * Integrated user preferences saving with PostgreSQL backend
  * Added post-processing effects: Bloom, Depth of Field, Vignette for cinematic quality
  * Optimized performance with PerformanceMonitor and conditional rendering
- July 1, 2025. Comprehensive Humour Club implementation and system fixes:
  * Created complete Humour Club page with bright, playful cosmic theme and joyful animations
  * Integrated OpenAI API for AI joke bot generating clean, positive, uplifting jokes
  * Built meme generator with curated collection of relatable, wholesome content
  * Implemented mini stress-relief games: bubble pop game and memory challenges
  * Added dance party feature with animated emoji GIFs and cosmic sparkle effects
  * Created community polling system for fun, lighthearted user engagement
  * Added comprehensive sound effects using Web Audio API (pop, cheer, whoosh, ding)
  * Implemented confetti animations and interactive visual feedback
  * Extended database schema with humourClubEntries and humourClubPolls tables
  * Added complete API endpoints for jokes, memes, polls, and voting functionality
  * Integrated Humour Club into navigation menu and home page feature cards
  * Fixed login API endpoint (/api/auth/login) that was missing from routes
  * Resolved Three.js material compatibility issues in Calm Space (meshPhysicalMaterial → meshStandardMaterial)
  * Added database fallback mechanisms to gracefully handle connection issues
  * Reduced excessive padding on Index page for better visual balance
  * Successfully tested sign-in functionality with proper API responses
- July 2, 2025. Navbar redesign and spacing optimization:
  * Redesigned navbar with centered floating pill design matching user specifications
  * Fixed navbar text alignment issues with proper flexbox layout
  * Changed AI companion name from "AI Soulmate" to "Lyra" throughout the application
  * Updated navbar spacing to 70px padding-top for better content alignment
  * Removed excessive blank spaces and prevented upward scrolling beyond page bounds
  * Fixed database schema synchronization with db:push command
  * Optimized page container structure to eliminate phantom spacing
  * Applied consistent layout across all pages with unified spacing system
  * Enhanced navbar responsiveness with proper mobile breakpoints
  * Fixed Calm Space page display issues and API preference errors
- July 8, 2025. Fixed critical "Cannot read properties of undefined (reading 'replit')" runtime errors:
  * Resolved persistent Three.js/React Three Fiber errors by replacing problematic 3D components
  * Created simplified CalmSpace component without complex Three.js dependencies
  * Added comprehensive error boundaries and protective wrapper functions
  * Enhanced error handling for Web Audio API, microphone access, and window object usage
  * Fixed HumourClub syntax errors and audio playback issues
  * Implemented fallback mechanisms for browser compatibility issues
  * Improved application stability with proper try-catch blocks around audio contexts
  * Successfully eliminated crashes and restored smooth application functionality
  * Redesigned navigation with main wellness tools (Vault, Letters, Let It Go, Mood, Calm Space) and "More" dropdown for community features
  * Created new Reflection Room page with 35 introspective questions across 6 categories for deep self-exploration
  * Enhanced CalmSpace UI with improved glassmorphism design and better visual hierarchy
  * Replaced problematic Three.js SmashMode components with simplified, stable alternatives
  * Added comprehensive database schema and API endpoints for reflection storage and retrieval
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```