# Authentication Integration Setup Guide

This guide will help you set up authentication for your Sales Analytics Dashboard using Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Existing Dashboard**: Your Sales Analytics Dashboard should be running

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Project name: `sales-analytics-dashboard`
   - Database password: Choose a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Set Up Database Tables

Run this SQL in your Supabase SQL editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE row_level_security;

-- Create users profile table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create user sessions table for analytics
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS policies
ALTER TABLE public.users ENABLE row_level_security;
ALTER TABLE public.user_sessions ENABLE row_level_security;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Configure Environment Variables

### Frontend (.env)
Create `frontend/.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (.env)
Update `backend/.env` file:

```env
# Existing Druid config...
DRUID_BROKER_HOST=localhost
DRUID_BROKER_PORT=8888
DRUID_DATASOURCE=sales_data

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Environment
ENV=development
DEBUG=true

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Step 4: Get Supabase Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the following:
   - **Project URL**: Use for `SUPABASE_URL`
   - **anon public key**: Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role secret key**: Use for `SUPABASE_SERVICE_KEY` (backend only)

⚠️ **Important**: Never expose the service role key in frontend code!

## Step 5: Create First Admin User

1. In Supabase dashboard, go to Authentication > Users
2. Click "Add user"
3. Enter email and password
4. After creation, go to SQL editor and run:

```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "full_name": "Admin User"}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

## Step 6: Test Authentication

1. Start your backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start your frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Visit `http://localhost:5173`
4. You should see the login page
5. Sign up with a new account or login with your admin account

## Step 7: Configure Druid for User Analytics

Add these datasources to your Druid ingestion:

### User Sessions Datasource
```json
{
  "type": "kafka",
  "dataSchema": {
    "dataSource": "user_sessions",
    "timestampSpec": {
      "column": "__time",
      "format": "iso"
    },
    "dimensionsSpec": {
      "dimensions": [
        "user_id",
        "session_action",
        "ip_address",
        "user_agent",
        "browser",
        "platform"
      ]
    },
    "metricsSpec": [
      {
        "name": "session_duration",
        "type": "longSum",
        "fieldName": "session_duration"
      }
    ],
    "granularitySpec": {
      "type": "uniform",
      "segmentGranularity": "DAY",
      "queryGranularity": "MINUTE"
    }
  }
}
```

## Features Included

### ✅ Authentication Features
- [x] Email/password authentication
- [x] User registration
- [x] Password reset
- [x] Protected routes
- [x] Role-based access control
- [x] Session management

### ✅ Analytics Integration
- [x] User session tracking in Druid
- [x] Login/logout events
- [x] User interaction tracking
- [x] Dashboard usage analytics
- [x] Browser and platform detection

### ✅ Security Features
- [x] JWT token validation
- [x] Row Level Security (RLS)
- [x] CORS protection
- [x] Environment variable configuration

## Troubleshooting

### Common Issues

1. **"Authentication service not configured"**
   - Check your Supabase environment variables
   - Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set

2. **Login page not showing**
   - Check that AuthProvider is wrapping your app
   - Verify Supabase client configuration

3. **Token verification failed**
   - Check that the anon key matches your project
   - Ensure RLS policies are set up correctly

4. **User data not syncing to Druid**
   - Check Druid connection
   - Verify ingestion endpoints are working

### Debug Mode

Add to your `.env` files:
```env
DEBUG=true
```

This will enable detailed logging for troubleshooting.

## Next Steps

1. **Customize User Roles**: Add more specific roles for your organization
2. **Add Profile Management**: Create user profile editing pages
3. **Implement Dashboard Permissions**: Restrict certain dashboards by role
4. **Add User Analytics Dashboard**: Create visualizations for user behavior
5. **Set Up Email Templates**: Customize Supabase email templates
6. **Configure OAuth**: Add Google/GitHub login options

## Support

For issues with this integration:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure Supabase and Druid services are running
4. Check the authentication logs in Supabase dashboard
