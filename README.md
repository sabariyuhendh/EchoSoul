# EchoSoul
A comprehensive emotional wellness platform designed to help users navigate their inner world through journaling, mood tracking, AI-powered conversations, and interactive emotional release activities.

##  Live Demo

[Visit EchoSoul](https://echosoul-6hpk.onrender.com/)

##  Features

### Core Emotional Wellness Tools
- **Vault**: 8-minute guided journaling sessions for emotional release in complete privacy
- **Letters**: AI-assisted letter writing with personalized styles and emotional support
- **Let It Go**: Interactive emotional release through virtual activities and exercises
- **Mood Tracking**: Comprehensive mood journaling with insightful analytics and trends
- **Whisper**: Voice journaling for capturing thoughts and emotions naturally
- **Reflection Room**: Guided self-reflection sessions for personal growth

### Social & Community Features
- **Matchmaking**: Connect with like-minded individuals for meaningful conversations
- **Chat Rooms**: Real-time chat with matched users
- **Feed**: Community posts and shared experiences
- **Humour Club**: AI-generated jokes and community polls for light-hearted moments

### AI-Powered Companions
- **Lyra**: Emotional support AI companion using advanced language models
- **Smart Matchmaking Algorithm**: Intelligent pairing based on emotional compatibility
- **Personalized Content**: AI-tailored suggestions and responses

### Wellness & Mindfulness
- **Calm Space**: Meditation and mindfulness sessions with customizable preferences
- **Burn Mode**: Interactive stress relief activities
- **Soulmate**: Deep connection features for meaningful relationships

##  Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **React Three Fiber** for 3D visualizations
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **WebSockets** for real-time features
- **Passport.js** for authentication
- **Session management** with connect-pg-simple

### AI & External Services
- **Groq AI** (meta-llama/llama-4-scout-17b-16e-instruct) for emotional support and content generation
- **OpenAI** integration (prepared for future use)
- **Cloudinary** for media storage

### Development Tools
- **Drizzle Kit** for database migrations
- **ESBuild** for fast compilation
- **Vitest** for testing (configured)
- **TypeScript** for type checking

##  Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Neon, Supabase, or local PostgreSQL)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echosoul
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   SESSION_SECRET=your-random-secret-key-here
   GROQ_API_KEY=your-groq-api-key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

##  Project Structure

```
echosoul/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database configuration
│   ├── routes.ts         # API routes
│   └── websocket.ts      # WebSocket handling
├── shared/                # Shared types and schemas
└── attached_assets/      # Additional assets
```

##  Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

##  Deployment

The application is configured for deployment on platforms like Render, Vercel, or Railway. For production deployment:

1. Set `NODE_ENV=production`
2. Use a production-grade database
3. Configure environment variables
4. Build the client: `npm run build`
5. Start the server: `npm start`

##  Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Acknowledgments

- Built with modern web technologies for emotional wellness
- Powered by AI for personalized support
- Designed for privacy and user well-being

---

**EchoSoul** - Your companion on the journey to emotional wellness.</content>
<parameter name="filePath">d:\Project\EchoSoul\README.md
