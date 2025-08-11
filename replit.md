# EchoSoul - Emotional Wellness Platform

## Overview
EchoSoul is a comprehensive emotional wellness platform providing tools for emotional expression, mental health support, and personal growth. It features interactive tools like timed journaling, emotional release activities, mood tracking, AI-powered letter writing, voice recording, and anonymous social support. The project aims to offer a holistic approach to mental well-being, fostering self-expression and community support.

## Recent Changes (August 2025)
- ✅ **Complete Authentication System**: Implemented dual authentication supporting both Google OAuth and email/password registration with bcrypt password hashing
- ✅ **Database Integration**: All user actions now properly save to PostgreSQL database with UUID-based user identification
- ✅ **Session Management**: Fixed session persistence across all protected API endpoints with PostgreSQL session storage
- ✅ **API Endpoint Testing**: Verified all core features (Letters, Let It Go, Vault, Mood Tracking) work with authentication
- ✅ **SmashMode Fixes**: Resolved orb breaking mechanics at 100% charge in both 3D and Simple modes
- ✅ **UI Polish**: Fixed font contrast issues on Letters page and removed inconsistent glass effects
- ✅ **App Testing Complete**: Verified Google OAuth, microphone functionality in Let It Go modes, Lyra AI chatbot, and all core features working properly
- ✅ **Feature Rename**: Updated "Letters You'll Never Send" to "Letters Live" while maintaining "EchoSoul" as app name
- ✅ **Groq AI Integration**: Integrated Groq API with meta-llama/llama-4-scout-17b-16e-instruct model for enhanced Lyra chatbot and Humour Club
- ✅ **Mood-Based Responses**: Added mood selection interface to Lyra for tailored emotional support based on user's current feelings
- ✅ **Enhanced AI Features**: Lyra now provides contextual responses using conversation history and mood state

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with React and TypeScript, using Vite for development. It employs a component-based architecture with React Router for routing, Shadcn/ui and Radix UI for consistent UI, Tailwind CSS for styling, TanStack Query for state management, and React Hook Form with Zod for form handling. The design system focuses on a calming, therapeutic color palette with a dark theme.

### Backend
The backend is a Node.js/Express.js server, written in TypeScript. It features a modular route structure, custom middleware for logging and error handling, and a storage abstraction layer for flexible data handling.

### Core Features
The application is organized into several functional areas:
- **Vault**: Timed emotional release sessions.
- **Letters**: AI-assisted letter writing with styling options.
- **Let It Go**: Interactive emotional release through virtual activities (burn, smash, scream modes).
- **Mood Tracking**: Daily mood logging with trend analysis.
- **Whisper**: Voice recording and playback.
- **Lyra (AI Companion)**: AI chatbot for emotional support.
- **Feed**: Anonymous social platform.
- **Calm Space**: Meditation and ambient sound player with a simplified, peaceful cosmic aesthetic.
- **Reflection Room**: Introspective questions for self-exploration.
- **Humour Club**: A section with an AI joke bot, meme generator, and stress-relief games.

### Data Flow and Storage
The application uses a client-server architecture. The React frontend communicates with the Express backend via REST APIs. Data is stored in:
- **PostgreSQL**: For user authentication and relational data, managed with Drizzle ORM.
- **MongoDB**: For general application data and user content.
- **Cloudinary**: For voice file storage.
- An in-memory storage implementation is available for development.

### UI/UX Design System
The application features a dark theme with a therapeutic color palette (blue, green, lavender, rose, amber). It leverages Shadcn/ui and Radix UI for a consistent, accessible, and mobile-responsive design. Glassmorphism effects are selectively applied to cards and action buttons for a premium feel.

## External Dependencies
- **React 18**: Frontend framework.
- **Express.js**: Backend server.
- **Drizzle ORM**: For PostgreSQL database operations.
- **Vite**: Development server and build tooling.
- **Tailwind CSS**: Styling framework.
- **Shadcn/ui & Radix UI**: UI component libraries.
- **Lucide React**: Iconography.
- **TypeScript**: Type safety across the stack.
- **ESBuild**: Production builds.
- **OpenAI API**: For AI-powered features (e.g., Letters AI assistance).
- **Groq API**: For Lyra chatbot and Humour Club using meta-llama/llama-4-scout-17b-16e-instruct model.
- **Cloudinary**: For voice file storage in Whisper.
- **passport-google-oauth20**: For Google OAuth authentication.