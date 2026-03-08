-- ── RLS Hardening & Text Length Constraints ───────────────────────────────────
-- Run this in Supabase SQL Editor after existing schema migrations.

-- ── Missing UPDATE/DELETE policies for user-submitted politician data ─────────

-- political_promises: allow submitters to edit/delete their own
CREATE POLICY "promises_update_own" ON political_promises
  FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "promises_delete_own" ON political_promises
  FOR DELETE USING (auth.uid() = submitted_by);

-- politician_company_connections: allow submitters to edit/delete their own
CREATE POLICY "connections_update_own" ON politician_company_connections
  FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "connections_delete_own" ON politician_company_connections
  FOR DELETE USING (auth.uid() = submitted_by);


-- ── Text length constraints (defense against oversized payloads) ─────────────

ALTER TABLE forum_posts
  ADD CONSTRAINT forum_posts_title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT forum_posts_body_length  CHECK (char_length(body) <= 10000);

ALTER TABLE forum_comments
  ADD CONSTRAINT forum_comments_body_length CHECK (char_length(body) <= 5000);

ALTER TABLE reviews
  ADD CONSTRAINT reviews_headline_length CHECK (char_length(headline) <= 200),
  ADD CONSTRAINT reviews_body_length     CHECK (char_length(body) <= 10000);

ALTER TABLE flags
  ADD CONSTRAINT flags_reason_length CHECK (char_length(reason) <= 500);
