-- ── News Expansion Migration ────────────────────────────────────────────────
-- Run in Supabase SQL Editor after the agents migration.
-- Adds politician news, makes company_id nullable, adds news_type column.

-- Make company_id nullable so we can store politician-only and general news
ALTER TABLE company_news ALTER COLUMN company_id DROP NOT NULL;

-- Add politician_id for politician-related news
ALTER TABLE company_news ADD COLUMN IF NOT EXISTS politician_id uuid REFERENCES politicians(id) ON DELETE CASCADE;

-- Add news_type to distinguish company vs politician vs general news
ALTER TABLE company_news ADD COLUMN IF NOT EXISTS news_type text DEFAULT 'company'
  CHECK (news_type IN ('company', 'politician', 'legislation', 'general'));

-- Index for politician news
CREATE INDEX IF NOT EXISTS company_news_politician_idx
  ON company_news(politician_id, published_at DESC)
  WHERE politician_id IS NOT NULL;

-- Index for news_type filtering
CREATE INDEX IF NOT EXISTS company_news_type_idx
  ON company_news(news_type, published_at DESC);

-- Add more category options for political news
ALTER TABLE company_news DROP CONSTRAINT IF EXISTS company_news_category_check;
ALTER TABLE company_news ADD CONSTRAINT company_news_category_check
  CHECK (category IN (
    'environmental', 'labor', 'consumer', 'legal', 'financial',
    'regulatory', 'scandal', 'positive', 'neutral', 'other',
    'policy', 'election', 'executive_order', 'legislation', 'investigation'
  ));
