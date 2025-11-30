# EchoSoul API Documentation

Complete list of all API endpoints organized by category.

## 📊 APIs Using Database (PostgreSQL)

All these endpoints use the PostgreSQL database via Drizzle ORM:

### Authentication APIs
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/register` - Register new user (creates user in DB)
- `POST /api/auth/login` - Login user (reads user from DB)
- `POST /api/auth/logout` - Logout user (destroys session in DB)
- `PATCH /api/auth/profile` - Update user profile (updates user in DB)

### Vault APIs (8-Minute Journaling)
- `POST /api/vault` - Create vault entry (saves to `vault_entries` table)
- `GET /api/vault` - Get user's vault entries (reads from `vault_entries` table)

### Let It Go Room APIs
- `POST /api/letitgo` - Create Let It Go entry (saves to `let_it_go_entries` table)
- `GET /api/letitgo` - Get user's Let It Go entries (reads from `let_it_go_entries` table)

### Mood Tracking APIs
- `POST /api/mood` - Create mood entry (saves to `mood_entries` table)
- `GET /api/mood` - Get user's mood entries (reads from `mood_entries` table)

### Letters Live APIs
- `POST /api/letters` - Create letter (saves to `letters` table)
- `GET /api/letters` - Get user's letters (reads from `letters` table)

### Whisper (Voice Journaling) APIs
- `POST /api/whisper` - Create whisper entry (saves to `whispers` table)
- `GET /api/whisper` - Get user's whispers (reads from `whispers` table)
- `DELETE /api/whisper/:id` - Delete whisper (deletes from `whispers` table)

### Feed (Community Posts) APIs
- `GET /api/feed` - Get public posts (reads from `posts` table)
- `POST /api/feed` - Create post (saves to `posts` table)

### Smash Mode APIs
- `POST /api/smash/stats` - Save smash mode statistics (saves to `smash_mode_stats` table)
- `GET /api/smash/stats` - Get user's smash stats (reads from `smash_mode_stats` table)

### Calm Space APIs
- `GET /api/calm/preferences` - Get calm space preferences (reads from `calm_space_preferences` table)
- `POST /api/calm/preferences` - Save calm space preferences (saves to `calm_space_preferences` table)
- `POST /api/calm/meditation` - Log meditation session (saves to DB)
- `GET /api/calm/meditation/stats` - Get meditation statistics (reads from DB)

### Humour Club APIs
- `GET /api/humour/entries` - Get public humour entries (reads from `humour_club_entries` table)
- `POST /api/humour/entries` - Create humour entry (saves to `humour_club_entries` table)
- `POST /api/humour/entries/:id/like` - Like humour entry (updates `humour_club_entries` table)
- `GET /api/humour/polls` - Get active polls (reads from `humour_club_polls` table)
- `POST /api/humour/polls` - Create poll (saves to `humour_club_polls` table)
- `POST /api/humour/polls/:id/vote` - Vote in poll (updates `humour_club_polls` table)

### Lyra (AI Companion) APIs
- `GET /api/lyra/conversations` - Get conversation history (reads from `lyra_conversations` table)
- `GET /api/lyra/sessions` - Get user's chat sessions (reads from `lyra_conversations` table)
- `DELETE /api/lyra/history` - Clear chat history (deletes from `lyra_conversations` table)

### Reflection Room APIs
- `GET /api/reflections` - Get user reflections (reads from `reflections` table)
- `POST /api/reflections` - Create reflection (saves to `reflections` table)

---

## 🤖 APIs Using AI Services

### APIs Using Groq AI (meta-llama/llama-4-scout-17b-16e-instruct)

1. **Lyra AI Chatbot**
   - `POST /api/lyra/chat`
   - **Purpose**: Emotional support AI companion
   - **AI Service**: Groq API
   - **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
   - **Features**:
     - Mood-aware responses based on user's current emotional state
     - Conversation history context
     - Empathetic, non-judgmental support
   - **Environment Variable**: `GROQ_API_KEY`
   - **Fallback**: Has fallback empathetic responses if AI fails

2. **Humour Club Joke Generator**
   - `POST /api/humour/joke`
   - **Purpose**: Generate clean, positive jokes
   - **AI Service**: Groq API
   - **Model**: `meta-llama/llama-4-scout-17b-16e-instruct`
   - **Features**:
     - Category-based jokes (general, dad jokes, etc.)
     - Clean, uplifting content
   - **Environment Variable**: `GROQ_API_KEY`
   - **Fallback**: Has predefined fallback jokes if AI fails

### APIs Using OpenAI (Currently Initialized but Not Used)

- **OpenAI Client**: Initialized in routes but no endpoints currently use it
- **Environment Variable**: `OPENAI_API_KEY`
- **Note**: OpenAI was likely used for Letters AI assistance in the past, but currently not active

---

## ☁️ APIs Using Cloudinary (File Storage)

### Whisper Audio Upload
- `POST /api/whisper/upload`
- **Purpose**: Upload audio files for voice journaling
- **External Service**: Cloudinary
- **Storage Type**: Audio files (stored as "video" resource type)
- **Folder**: `echosoul/whispers`
- **Format**: WAV
- **Environment Variables Required**:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- **Database**: Also saves whisper metadata to `whispers` table with Cloudinary URL

---

## 🗄️ APIs Using Session Storage (PostgreSQL Sessions Table)

These APIs use the PostgreSQL `sessions` table for session management:

- `POST /api/auth/login` - Creates session in `sessions` table
- `POST /api/auth/register` - Creates session in `sessions` table
- `POST /api/auth/logout` - Destroys session from `sessions` table
- All authenticated endpoints - Read session from `sessions` table

**Session Configuration**:
- **Store**: `connect-pg-simple` (PostgreSQL session store)
- **Table**: `sessions`
- **TTL**: 7 days
- **Environment Variable**: `DATABASE_URL` (same as main DB)

---

## 📝 Other APIs (No External Services)

### Health Check
- `GET /api/health` - Health check endpoint (no DB, no external services)

### Humour Club Meme
- `GET /api/humour/meme` - Returns predefined memes (no DB, no external services, static data)

### Redirect
- `GET /api/login` - Redirects to `/login` page (no DB, no external services)

---

## 📋 Summary by Service

### PostgreSQL Database (Main DB)
**Total: 35 endpoints**
- All authentication endpoints
- All CRUD operations for user data
- All feature-specific data storage
- Session management

### Groq AI
**Total: 2 endpoints**
- `/api/lyra/chat` - AI chatbot
- `/api/humour/joke` - Joke generator

### Cloudinary
**Total: 1 endpoint**
- `/api/whisper/upload` - Audio file upload

### Session Storage (PostgreSQL Sessions Table)
**Total: 3 endpoints**
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`

### No External Services
**Total: 3 endpoints**
- `/api/health`
- `/api/humour/meme`
- `/api/login`

---

## 🔑 Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string (required for all DB operations)

### AI Services
- `GROQ_API_KEY` - For Lyra chatbot and joke generator (has fallback key)
- `OPENAI_API_KEY` - Currently initialized but not actively used

### File Storage
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Session Management
- `SESSION_SECRET` - Secret key for session encryption (has fallback for development)
- `DATABASE_URL` - Also used for session storage

---

## 📊 Database Tables Used

1. `users` - User accounts and profiles
2. `sessions` - Session storage
3. `vault_entries` - 8-minute journaling entries
4. `let_it_go_entries` - Emotional release entries
5. `mood_entries` - Mood tracking data
6. `letters` - Letter entries
7. `whispers` - Voice journaling entries
8. `posts` - Community feed posts
9. `smash_mode_stats` - Smash mode statistics
10. `calm_space_preferences` - Calm space user preferences
11. `humour_club_entries` - Humour club entries
12. `humour_club_polls` - Humour club polls
13. `lyra_conversations` - AI chatbot conversations
14. `reflections` - Reflection room entries

---

## 🔒 Authentication

Most endpoints require authentication via `requireAuth` middleware:
- Checks `req.session.user` from session storage
- Returns 401 if not authenticated
- Sets `req.user` with user data for authenticated requests

**Public Endpoints** (No auth required):
- `GET /api/feed` - Public posts
- `GET /api/humour/entries` - Public humour entries
- `GET /api/humour/polls` - Public polls
- `GET /api/humour/meme` - Memes
- `GET /api/health` - Health check
- `GET /api/login` - Redirect
- `GET /api/reflections` - Reflections (currently uses mock user)






