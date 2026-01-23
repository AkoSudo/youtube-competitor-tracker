-- Create videos table
-- REQ-VID: Store video metadata with channel relationship

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  view_count BIGINT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate videos
  CONSTRAINT videos_youtube_id_unique UNIQUE (youtube_id)
);

-- Indexes for query patterns
CREATE INDEX IF NOT EXISTS videos_channel_id_idx ON videos(channel_id);
CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS videos_fetched_at_idx ON videos(fetched_at DESC);
CREATE INDEX IF NOT EXISTS videos_duration_seconds_idx ON videos(duration_seconds);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read/write for v1 - no auth)

-- Allow anyone to read videos
CREATE POLICY "Videos are viewable by everyone"
ON videos FOR SELECT
TO public
USING (true);

-- Allow anyone to insert videos
CREATE POLICY "Anyone can add videos"
ON videos FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update videos (for refresh operations)
CREATE POLICY "Anyone can update videos"
ON videos FOR UPDATE
TO public
USING (true);

-- Allow anyone to delete videos
CREATE POLICY "Anyone can delete videos"
ON videos FOR DELETE
TO public
USING (true);

-- Note: In v2 with auth, these policies will be restricted to authenticated users
-- Videos will cascade delete when their parent channel is deleted
