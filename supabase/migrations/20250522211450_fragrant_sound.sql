/*
  # Disable RLS on profiles table
  
  This migration disables row level security on the profiles table,
  making it completely unprotected and accessible to all authenticated users.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;