-- ── AI Moderation & Insights Migration ────────────────────────────────────────
-- Run this in Supabase SQL Editor after existing migrations.
-- Adds AI moderation columns, review summaries, discovery table, and user insights.

-- ══════════════════════════════════════════════════════════════════════════════
-- Feature 1: Forum Moderation
-- ══════════════════════════════════════════════════════════════════════════════

-- Moderation columns on forum_posts
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS moderation_scores jsonb;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS moderated_by text DEFAULT 'manual';

-- Moderation columns on forum_comments
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS moderation_scores jsonb;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS moderated_by text DEFAULT 'manual';

-- Indexes for polling pending + unmoderated items
CREATE INDEX IF NOT EXISTS forum_posts_pending_unmoderated_idx
  ON forum_posts(status) WHERE status = 'pending' AND moderated_at IS NULL;
CREATE INDEX IF NOT EXISTS forum_comments_pending_unmoderated_idx
  ON forum_comments(status) WHERE status = 'pending' AND moderated_at IS NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- Feature 2: Review Summarization
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_review_summary text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_summary_updated_at timestamptz;

-- ══════════════════════════════════════════════════════════════════════════════
-- Feature 3: Connection Discovery
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_discoveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  discovery_type  text NOT NULL CHECK (discovery_type IN (
    'scandal', 'lawsuit', 'political_tie', 'lobbying', 'conflict_of_interest'
  )),
  title           text NOT NULL,
  description     text NOT NULL,
  confidence      numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  source_type     text CHECK (source_type IN ('review', 'forum_post', 'news')),
  source_id       uuid,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'verified', 'rejected', 'duplicate')),
  matched_existing uuid,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_discoveries_company_idx ON ai_discoveries(company_id);
CREATE INDEX IF NOT EXISTS ai_discoveries_status_idx ON ai_discoveries(status);

ALTER TABLE ai_discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_discoveries_select" ON ai_discoveries
  FOR SELECT USING (status = 'verified');

-- Track which content has been scanned
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ai_scanned_at timestamptz;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS ai_scanned_at timestamptz;

-- ══════════════════════════════════════════════════════════════════════════════
-- Feature 4: Personalized Dashboard Insights
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_insights (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  insights_data   jsonb NOT NULL DEFAULT '{"cards":[]}',
  generated_at    timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '1 day')
);

CREATE INDEX IF NOT EXISTS user_insights_user_idx ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS user_insights_expires_idx ON user_insights(expires_at);

ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_insights_select" ON user_insights
  FOR SELECT USING (auth.uid() = user_id);
