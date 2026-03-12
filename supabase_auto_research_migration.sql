-- ═══════════════════════════════════════════════════════════════════════════
-- Auto-Research Migration
-- Adds INSERT policies so authenticated users can add companies/politicians
-- via real-time Wikidata research when searching for unknown entities.
-- ═══════════════════════════════════════════════════════════════════════════

-- Allow authenticated users to insert new companies (auto-research)
CREATE POLICY "companies_insert_authenticated" ON companies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert new politicians (auto-research)
CREATE POLICY "politicians_insert_authenticated" ON politicians
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
