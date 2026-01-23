-- Create ideas table
-- REQ-DM-003: Store saved video ideas with user attribution

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  added_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure notes are meaningful (minimum 10 characters)
  CONSTRAINT ideas_note_min_length CHECK (char_length(note) >= 10)
);

-- Indexes for query patterns
CREATE INDEX IF NOT EXISTS ideas_video_id_idx ON ideas(video_id);
CREATE INDEX IF NOT EXISTS ideas_added_by_idx ON ideas(added_by);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for v1 - no auth)

-- Allow anyone to read ideas
CREATE POLICY "Ideas are viewable by everyone"
ON ideas FOR SELECT
TO public
USING (true);

-- Allow anyone to insert ideas
CREATE POLICY "Anyone can add ideas"
ON ideas FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to delete ideas
CREATE POLICY "Anyone can delete ideas"
ON ideas FOR DELETE
TO public
USING (true);

-- Note: No UPDATE policy - ideas are immutable once saved
-- In v2 with auth, these policies will be restricted to authenticated users
-- Ideas will cascade delete when their parent video is deleted
-- Videos cascade from channels, so deleting a channel removes all its ideas
