-- Create channels table
-- REQ-DM-001: id, youtube_id, name, thumbnail_url, subscriber_count, added_by, created_at

CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  subscriber_count BIGINT,
  added_by UUID,  -- Will reference auth.users in v2
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- REQ-CH-006: Prevent duplicate channel additions
  CONSTRAINT channels_youtube_id_unique UNIQUE (youtube_id)
);

-- Create index for faster lookups by youtube_id
CREATE INDEX IF NOT EXISTS channels_youtube_id_idx ON channels (youtube_id);

-- Create index for chronological ordering
CREATE INDEX IF NOT EXISTS channels_created_at_idx ON channels (created_at DESC);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anyone to read channels (public data, no auth required for v1)
CREATE POLICY "Channels are viewable by everyone"
ON channels FOR SELECT
TO public
USING (true);

-- Allow anyone to insert channels (no auth for v1)
CREATE POLICY "Anyone can add channels"
ON channels FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to delete channels (no auth for v1)
CREATE POLICY "Anyone can delete channels"
ON channels FOR DELETE
TO public
USING (true);

-- Note: In v2 with auth, these policies will be restricted to authenticated users
-- and delete will be restricted to the user who added the channel.

-- Enable Realtime for this table (REQ-CH-005)
-- This needs to be done in Supabase Dashboard: Database -> Replication -> Source
-- Or via: ALTER PUBLICATION supabase_realtime ADD TABLE channels;
