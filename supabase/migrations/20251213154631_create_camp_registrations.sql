/*
  # Camp Registration System

  1. New Tables
    - `camp_registrations`
      - `id` (uuid, primary key) - Unique identifier for each registration
      - `created_at` (timestamptz) - Timestamp when registration was submitted
      - `camper_name` (text) - Full name of the camper
      - `age` (integer) - Age of the camper
      - `parent_name` (text) - Full name of parent/guardian
      - `parent_email` (text) - Email address for parent/guardian
      - `parent_phone` (text) - Phone number for parent/guardian
      - `emergency_contact_name` (text) - Name of emergency contact
      - `emergency_contact_phone` (text) - Phone number for emergency contact
      - `medical_conditions` (text, nullable) - Any medical conditions or allergies
      - `dietary_restrictions` (text, nullable) - Any dietary restrictions
      - `session_preference` (text) - Preferred camp session (e.g., "Week 1", "Week 2")
      
  2. Security
    - Enable RLS on `camp_registrations` table
    - Add policy for anyone to insert registrations (public form submission)
    - Add policy for authenticated users to view all registrations (admin access)
*/

CREATE TABLE IF NOT EXISTS camp_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  camper_name text NOT NULL,
  age integer NOT NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,
  medical_conditions text DEFAULT '',
  dietary_restrictions text DEFAULT '',
  session_preference text NOT NULL
);

ALTER TABLE camp_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit camp registration"
  ON camp_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all registrations"
  ON camp_registrations
  FOR SELECT
  TO authenticated
  USING (true);