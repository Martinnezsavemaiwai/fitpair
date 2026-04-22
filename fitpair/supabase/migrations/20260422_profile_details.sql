-- ============================================================
-- Migration: Add Profile Detail Columns
-- Date: 2026-04-22
-- ============================================================

-- Add missing columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender       TEXT,
  ADD COLUMN IF NOT EXISTS health_flags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight       NUMERIC,
  ADD COLUMN IF NOT EXISTS height       NUMERIC,
  ADD COLUMN IF NOT EXISTS goal         TEXT,
  ADD COLUMN IF NOT EXISTS name         TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.health_flags IS 'Array of health conditions/flags (e.g., anemia, heart)';
COMMENT ON COLUMN public.profiles.gender IS 'User gender: male, female, or other';
