-- ============================================================
-- Migration: Create avatars Storage Bucket + RLS
-- Date: 2026-04-22
-- ============================================================

-- ── 1. Create the bucket (if not exists) ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                          -- Public bucket (URLs are readable without auth)
  2097152,                       -- 2 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage RLS Policies ───────────────────────────────────

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Authenticated upload to own folder" ON storage.objects;
CREATE POLICY "Authenticated upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/replace their own files
DROP POLICY IF EXISTS "Authenticated update own files" ON storage.objects;
CREATE POLICY "Authenticated update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Authenticated delete own files" ON storage.objects;
CREATE POLICY "Authenticated delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (so avatar URLs work without auth)
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
