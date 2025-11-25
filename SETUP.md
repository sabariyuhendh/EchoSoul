# EchoSoul Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. PostgreSQL database (Neon, Supabase, or any PostgreSQL provider)
3. npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your database URL:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   SESSION_SECRET=your-random-secret-key-here
   ```

### Getting a Database URL

**Option 1: Neon (Recommended - Free tier available)**
1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. It will look like: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`

**Option 2: Supabase**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to Settings > Database
4. Copy the connection string

**Option 3: Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a database: `createdb echosoul`
3. Use: `postgresql://localhost:5432/echosoul`

## Step 3: Generate Session Secret

Generate a random secret for sessions:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the output to your `.env` file as `SESSION_SECRET`.

## Step 4: Set Up Database Tables

Run the database migrations to create all required tables:

```bash
npm run db:push
```

This will create all the necessary tables including:
- `users` - User accounts
- `sessions` - Session storage
- `vault_entries` - Journal entries
- `let_it_go_entries` - Emotional release entries
- `mood_entries` - Mood tracking
- And more...

## Step 5: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure you have a `.env` file in the root directory
- Check that `DATABASE_URL` is set correctly
- Restart your dev server after adding environment variables

### Error: "Connection refused" or "Connection timeout"
- Verify your database URL is correct
- Check if your database allows connections from your IP
- For cloud databases, check firewall/network settings

### Error: "relation does not exist"
- Run `npm run db:push` to create the database tables
- Make sure you're connected to the correct database

### 500 Internal Server Error on Login/Register
- Check server console for detailed error messages
- Verify database connection is working
- Ensure all tables were created successfully
- Check that `SESSION_SECRET` is set

## Testing Authentication

1. Navigate to `http://localhost:5000/login`
2. Click "Register" tab
3. Fill in the form and create an account
4. You should be redirected to the home page
5. Try logging out and logging back in

## Production Deployment

For production:
1. Set `NODE_ENV=production` in your `.env`
2. Use a strong, random `SESSION_SECRET`
3. Set `secure: true` in cookie settings (already configured)
4. Use a production-grade database
5. Set up proper CORS settings
6. Build the client: `npm run build`
7. Start the server: `npm start`


