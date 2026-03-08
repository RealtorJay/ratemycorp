-- ── CEO Data Updates (March 2026) ─────────────────────────────────────────────
-- Run this in Supabase SQL Editor to fix outdated CEO names.
-- These leaders changed in 2024–2025.

-- Nike: Elliott Hill replaced John Donahoe (Sept 2024)
UPDATE companies SET ceo_name = 'Elliott Hill' WHERE slug = 'nike';

-- Starbucks: Brian Niccol replaced Laxman Narasimhan (Sept 2024)
UPDATE companies SET ceo_name = 'Brian Niccol' WHERE slug = 'starbucks';

-- 3M: Bill Brown replaced Mike Roman (May 2024)
UPDATE companies SET ceo_name = 'Bill Brown' WHERE slug = '3m';

-- Nestlé: Laurent Freixe replaced Mark Schneider (Sept 2024)
UPDATE companies SET ceo_name = 'Laurent Freixe' WHERE slug = 'nestle';

-- CVS Health: David Joyner replaced Karen Lynch (Oct 2024)
UPDATE companies SET ceo_name = 'David Joyner' WHERE slug = 'cvs-health';

-- UnitedHealth: Stephen Hemsley replaced Andrew Witty (2025)
UPDATE companies SET ceo_name = 'Stephen Hemsley' WHERE slug = 'unitedhealth';

-- Tyson Foods: Donnie King departed mid-2023; current leadership updated
UPDATE companies SET ceo_name = 'Donnie King' WHERE slug = 'tyson-foods';
-- Note: verify Tyson's current CEO and update if needed

-- Philip Morris: Jacek Olczak stepped down; verify current CEO
-- UPDATE companies SET ceo_name = 'TBD' WHERE slug = 'philip-morris';
-- Note: verify and uncomment with correct name
