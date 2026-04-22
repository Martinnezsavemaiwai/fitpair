-- ============================================================
-- Migration: Couple Linking (v2 — fixes infinite recursion)
-- Date: 2026-04-22
-- ============================================================

-- ── 1. Add columns ────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_id  TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS couple_code TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_partner_id  ON public.profiles(partner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_couple_code ON public.profiles(couple_code);

-- ── 2. RLS ────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies first (clean slate)
DROP POLICY IF EXISTS "Users can read own profile"                          ON public.profiles;
DROP POLICY IF EXISTS "Users can read partner profile"                      ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"                        ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"                        ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can lookup profiles by id prefix" ON public.profiles;

-- ── SELECT: any logged-in user can read any profile row ──────
-- This is the ONLY select policy — no subquery, no recursion.
-- It covers: reading own profile, reading partner profile,
-- and the invite-code prefix lookup in connectCouple().
CREATE POLICY "Authenticated users can select profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── INSERT: users can only create their own row ───────────────
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- ── UPDATE: users can only update their own row ───────────────
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING  (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ── DELETE: nobody can delete (safety net) ───────────────────
-- (No DELETE policy = DELETE is blocked by default under RLS)

-- ── 3. Verification query (run manually) ─────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;
