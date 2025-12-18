-- Temporarily allow inserts for testing/development
-- You can tighten these later for production

-- Allow anyone to insert businesses (for testing)
DROP POLICY IF EXISTS "Businesses can be inserted by authenticated users" ON businesses;
CREATE POLICY "Businesses insertable by anyone"
    ON businesses FOR INSERT
    WITH CHECK (true);

-- Allow anyone to insert/update staff (for testing)
DROP POLICY IF EXISTS "Staff insertable by authenticated users" ON staff;
DROP POLICY IF EXISTS "Staff updatable by authenticated users" ON staff;
DROP POLICY IF EXISTS "Staff deletable by authenticated users" ON staff;

CREATE POLICY "Staff insertable by anyone"
    ON staff FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff updatable by anyone"
    ON staff FOR UPDATE
    USING (true);

CREATE POLICY "Staff deletable by anyone"
    ON staff FOR DELETE
    USING (true);

-- Allow anyone to insert/update services (for testing)
DROP POLICY IF EXISTS "Services insertable by authenticated users" ON services;
DROP POLICY IF EXISTS "Services updatable by authenticated users" ON services;
DROP POLICY IF EXISTS "Services deletable by authenticated users" ON services;

CREATE POLICY "Services insertable by anyone"
    ON services FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Services updatable by anyone"
    ON services FOR UPDATE
    USING (true);

CREATE POLICY "Services deletable by anyone"
    ON services FOR DELETE
    USING (true);

-- Staff services policies
DROP POLICY IF EXISTS "Staff services viewable by everyone" ON staff_services;
DROP POLICY IF EXISTS "Staff services manageable by staff" ON staff_services;

CREATE POLICY "Staff services viewable by everyone"
    ON staff_services FOR SELECT
    USING (true);

CREATE POLICY "Staff services insertable by anyone"
    ON staff_services FOR INSERT
    WITH CHECK (true);
