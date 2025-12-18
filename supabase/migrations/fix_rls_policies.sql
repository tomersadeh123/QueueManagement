-- Fix RLS policies to avoid infinite recursion
-- Drop problematic policies
DROP POLICY IF EXISTS "Staff viewable by everyone" ON staff;
DROP POLICY IF EXISTS "Staff manageable by business staff" ON staff;
DROP POLICY IF EXISTS "Services viewable by everyone" ON services;
DROP POLICY IF EXISTS "Services manageable by business staff" ON services;

-- Recreate staff policies (separate SELECT from other operations)
CREATE POLICY "Staff are viewable by everyone"
    ON staff FOR SELECT
    USING (true);

CREATE POLICY "Staff insertable by authenticated users"
    ON staff FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff updatable by authenticated users"
    ON staff FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Staff deletable by authenticated users"
    ON staff FOR DELETE
    USING (auth.role() = 'authenticated');

-- Recreate services policies (separate SELECT from other operations)
CREATE POLICY "Services are viewable by everyone"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Services insertable by authenticated users"
    ON services FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Services updatable by authenticated users"
    ON services FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Services deletable by authenticated users"
    ON services FOR DELETE
    USING (auth.role() = 'authenticated');
