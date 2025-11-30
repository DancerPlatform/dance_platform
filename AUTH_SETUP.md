# Authentication Setup Documentation

This document describes the authentication system implemented for the dance platform.

## Overview

The authentication system uses **Supabase Auth** and supports three distinct user types:
- **Client Users** - Organizations/companies looking to hire dancers
- **Artist Users** - Professional dancers and performers
- **Normal Users** - Regular platform users

## Database Schema

### User Type Tables

Each user type has its own table with a foreign key to `auth.users`:

1. **client_user** - Stores client user information
   - `client_id` (PK)
   - `name`, `email`, `phone`, `company_id`
   - `auth_id` (FK to auth.users)

2. **artist_user** - Stores artist user information
   - `artist_id` (PK)
   - `name`, `email`, `phone`, `birth`
   - `auth_id` (FK to auth.users)

3. **user** - Stores normal user information
   - `user_id` (PK)
   - `name`, `email`, `phone`
   - `auth_id` (FK to auth.users)

### User Profiles Table

The `user_profiles` table maps auth users to their user type:
- `auth_id` (PK, FK to auth.users)
- `user_type` (enum: 'client', 'artist', 'user')
- `created_at`, `updated_at`

### Automatic Profile Creation

A database trigger automatically creates a user profile when a new user signs up. The `user_type` is extracted from the user's metadata.

## Frontend Implementation

### Auth Context

The auth system is built around a React context provider: `AuthProvider`

Located in: [contexts/AuthContext.tsx](frontend/contexts/AuthContext.tsx)

The context provides:
- `user` - Current auth user
- `profile` - User profile with user type
- `clientUser` / `artistUser` / `normalUser` - Type-specific user data
- `loading` - Loading state
- `error` - Error state
- `signIn(email, password)` - Sign in function
- `signOut()` - Sign out function
- `refreshUser()` - Refresh user data

### Auth Utilities

Authentication utilities are provided in [lib/auth.ts](frontend/lib/auth.ts):

- `signUp()` - Register a new user with user type
- `signIn()` - Authenticate a user
- `signOut()` - Sign out current user
- `getUserProfile()` - Get user profile
- `getClientUser()` / `getArtistUser()` / `getNormalUser()` - Get type-specific data
- `getCompleteUserData()` - Get all user data based on type

### Type Definitions

TypeScript types are defined in [lib/types/auth.ts](frontend/lib/types/auth.ts)

## Usage

### Protecting Routes

Use the `useRequireAuth` hook to protect routes:

```tsx
import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function ProtectedPage() {
  // Require any authenticated user
  const { user, loading } = useRequireAuth()

  // Or require specific user type
  const { user, loading } = useRequireAuth('artist')

  if (loading) return <div>Loading...</div>

  return <div>Protected content</div>
}
```

### Using Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, profile, artistUser, clientUser, normalUser, signOut } = useAuth()

  if (profile?.user_type === 'artist' && artistUser) {
    return <div>Welcome {artistUser.name}!</div>
  }

  return null
}
```

### Sign Up Flow

```tsx
import { signUp } from '@/lib/auth'

const handleSignUp = async () => {
  const { user, error } = await signUp(
    'user@example.com',
    'password123',
    'artist', // user type
    {
      name: 'John Doe',
      phone: '123-456-7890',
      birth: '1990-01-01'
    }
  )

  if (error) {
    console.error('Signup failed:', error)
  }
}
```

## Row Level Security (RLS)

RLS policies ensure users can only access their own data:

- Users can **read** and **update** their own profile
- Users can **insert** their type-specific record after signup
- Anonymous users can **read** artist portfolios (for public viewing)

## Login Pages

Three separate login pages handle authentication:

- [/login/client](frontend/app/login/client/page.tsx) - Client login
- [/login/artist](frontend/app/login/artist/page.tsx) - Artist login
- [/login/user](frontend/app/login/user/page.tsx) - Normal user login

Each page validates that the user has the correct user type before allowing access.

## Environment Variables

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Migration

The auth setup migration is: `setup_auth_user_types`

This migration:
1. Adds `auth_id` columns to user tables
2. Creates the `user_type` enum
3. Creates the `user_profiles` table
4. Sets up RLS policies
5. Creates the trigger for automatic profile creation

## Security Considerations

1. **Email Confirmation** - Consider enabling email confirmation in Supabase settings
2. **Password Policy** - Configure password requirements in Supabase Auth settings
3. **JWT Expiration** - Review JWT expiration settings for your use case
4. **Rate Limiting** - Enable rate limiting on auth endpoints to prevent abuse
5. **MFA** - Consider implementing multi-factor authentication for sensitive operations

## Next Steps

To complete the auth system:

1. Create signup pages for each user type
2. Implement password reset functionality
3. Add email verification flow
4. Create user profile management pages
5. Add role-based access control if needed
6. Implement OAuth providers (Google, GitHub, etc.) if desired
