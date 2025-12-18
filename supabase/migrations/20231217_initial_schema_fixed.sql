-- Drop existing objects if they exist (clean slate)
DROP VIEW IF EXISTS today_queue CASCADE;
DROP TABLE IF EXISTS queue_entries CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff_services CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP FUNCTION IF EXISTS get_next_queue_number(UUID);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    working_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff-Services junction table (many-to-many)
CREATE TABLE staff_services (
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, service_id)
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    appointment_time TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queue entries table
CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id),
    queue_number INTEGER NOT NULL,
    status TEXT CHECK (status IN ('waiting', 'called', 'in_progress', 'completed', 'cancelled')) DEFAULT 'waiting',
    estimated_wait_minutes INTEGER,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_appointments_business_time ON appointments(business_id, appointment_time);
CREATE INDEX idx_appointments_staff ON appointments(staff_id, appointment_time);
CREATE INDEX idx_queue_business_status ON queue_entries(business_id, status, created_at);
CREATE INDEX idx_staff_business ON staff(business_id);
CREATE INDEX idx_services_business ON services(business_id);

-- Create a function to get the next queue number (NOTE: Use $$ for function body)
CREATE OR REPLACE FUNCTION get_next_queue_number(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(queue_number), 0) + 1
    INTO next_number
    FROM queue_entries
    WHERE business_id = p_business_id
    AND DATE(created_at) = CURRENT_DATE;

    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Businesses are viewable by everyone"
    ON businesses FOR SELECT
    USING (true);

CREATE POLICY "Businesses can be inserted by authenticated users"
    ON businesses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Businesses can be updated by staff members"
    ON businesses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.business_id = businesses.id
            AND staff.user_id = auth.uid()
        )
    );

-- RLS Policies for staff
CREATE POLICY "Staff viewable by everyone"
    ON staff FOR SELECT
    USING (true);

CREATE POLICY "Staff manageable by business staff"
    ON staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE s.business_id = staff.business_id
            AND s.user_id = auth.uid()
        )
    );

-- RLS Policies for services
CREATE POLICY "Services viewable by everyone"
    ON services FOR SELECT
    USING (true);

CREATE POLICY "Services manageable by business staff"
    ON services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.business_id = services.business_id
            AND staff.user_id = auth.uid()
        )
    );

-- RLS Policies for staff_services
CREATE POLICY "Staff services viewable by everyone"
    ON staff_services FOR SELECT
    USING (true);

CREATE POLICY "Staff services manageable by staff"
    ON staff_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.id = staff_services.staff_id
            AND staff.user_id = auth.uid()
        )
    );

-- RLS Policies for appointments
CREATE POLICY "Appointments viewable by everyone"
    ON appointments FOR SELECT
    USING (true);

CREATE POLICY "Appointments insertable by everyone"
    ON appointments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Appointments manageable by business staff"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.business_id = appointments.business_id
            AND staff.user_id = auth.uid()
        )
    );

-- RLS Policies for queue_entries
CREATE POLICY "Queue entries viewable by everyone"
    ON queue_entries FOR SELECT
    USING (true);

CREATE POLICY "Queue entries insertable by everyone"
    ON queue_entries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Queue entries manageable by business staff"
    ON queue_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.business_id = queue_entries.business_id
            AND staff.user_id = auth.uid()
        )
    );

-- Create a view for today's queue with position info
CREATE OR REPLACE VIEW today_queue AS
SELECT
    qe.*,
    s.name as service_name,
    s.duration_minutes,
    ROW_NUMBER() OVER (PARTITION BY qe.business_id ORDER BY qe.created_at) as position
FROM queue_entries qe
JOIN services s ON qe.service_id = s.id
WHERE DATE(qe.created_at) = CURRENT_DATE
AND qe.status IN ('waiting', 'called', 'in_progress')
ORDER BY qe.business_id, qe.created_at;
