-- Allow anyone to read avatars (public bucket)
CREATE POLICY "Public avatar read" ON storage.objects FOR SELECT
  USING (bucket_id = 'persona-avatars');

-- Allow anyone to upload avatars (fellows self-serve)
CREATE POLICY "Avatar upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'persona-avatars');

-- Allow overwriting avatars
CREATE POLICY "Avatar update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'persona-avatars');
