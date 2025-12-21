/*
  # Fix admin_profiles RLS policies

  The admin_profiles table had RLS enabled but no policies, causing all queries to be blocked.
  This migration adds the necessary RLS policies to allow users to read their own admin profile.

  1. Security Changes
    - Add SELECT policy: authenticated users can read their own profile
    - Add INSERT policy: allow creation of admin profiles
    - Add UPDATE policy: users can update their own profile
*/

CREATE POLICY "Users can read own admin profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own admin profile"
  ON admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own admin profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);