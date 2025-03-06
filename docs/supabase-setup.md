# Supabase Setup Guide

This guide provides instructions for setting up Supabase for the Marching Band Manager application.

## Overview

Our application uses Supabase for:
- Database storage (PostgreSQL)
- Row-level security
- User authentication (future implementation)
- Real-time updates (future implementation)

## Setup Steps

### 1. Create a Supabase Account

If you haven't already, create a Supabase account at https://supabase.com/

### 2. Create a New Project

1. Log in to your Supabase account
2. Click "New Project"
3. Fill in the required information:
   - Name: marching-band-manager
   - Database Password: Create a secure password
   - Region: Choose the region closest to your users
4. Click "Create new project"

### 3. Get Project Credentials

Once your project is created:

1. Go to the project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - Project URL (under "Project Settings")
   - anon/public API key (under "Project API Keys")

### 4. Update Environment Variables

Add these values to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

For production, add these environment variables to your Vercel project settings.

### 5. Create Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `docs/supabase-schema.sql`
3. Run the SQL to create all necessary tables

The schema will create:
- `band_members` table
- `formations` table
- `formation_positions` table (junction table)
- Row-level security policies
- Triggers for `updated_at` timestamps

### 6. Test the Connection

After completing the setup:

1. Run your local development server with `npm run dev`
2. Navigate to a page that interacts with Supabase
3. Check the console for any connection errors

## Database Schema

### Band Members Table

```sql
CREATE TABLE band_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  instrument TEXT NOT NULL,
  skill_level INTEGER NOT NULL DEFAULT 1,
  years_experience INTEGER NOT NULL DEFAULT 0,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Formations Table

```sql
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Formation Positions Table

```sql
CREATE TABLE formation_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  band_member_id UUID NOT NULL REFERENCES band_members(id) ON DELETE CASCADE,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(formation_id, band_member_id)
);
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure your environment variables are correctly set.
2. **Missing Tables**: Check if you've run the SQL script correctly in the Supabase SQL Editor.
3. **Authentication Error**: Verify that your API key has the necessary permissions.

For additional help, refer to the [Supabase documentation](https://supabase.com/docs). 