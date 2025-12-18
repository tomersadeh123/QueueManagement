-- Add role column to staff table
ALTER TABLE staff
ADD COLUMN role TEXT CHECK (role IN ('super_admin', 'business_admin', 'staff')) DEFAULT 'staff';

-- Create index for faster role lookups
CREATE INDEX idx_staff_role ON staff(role);

-- Update RLS policy to allow super admins to manage all businesses
DROP POLICY IF EXISTS "Businesses can be updated by staff members" ON businesses;

CREATE POLICY "Businesses can be updated by authorized staff"
    ON businesses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE (
                -- Super admins can update any business
                staff.role = 'super_admin'
                OR
                -- Business admins can update their own business
                (staff.business_id = businesses.id AND staff.role IN ('business_admin', 'super_admin'))
            )
            AND staff.user_id = auth.uid()
        )
    );

-- Allow super admins to insert new businesses
DROP POLICY IF EXISTS "Businesses can be inserted by authenticated users" ON businesses;

CREATE POLICY "Businesses can be inserted by super admins"
    ON businesses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE staff.role = 'super_admin'
            AND staff.user_id = auth.uid()
        )
    );

-- Update staff policies to allow super admins to manage all staff
DROP POLICY IF EXISTS "Staff manageable by business staff" ON staff;

CREATE POLICY "Staff manageable by authorized users"
    ON staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE (
                -- Super admins can manage all staff
                s.role = 'super_admin'
                OR
                -- Business admins can manage staff in their business
                (s.business_id = staff.business_id AND s.role IN ('business_admin', 'super_admin'))
            )
            AND s.user_id = auth.uid()
        )
    );

-- Comment with instructions
COMMENT ON COLUMN staff.role IS 'User role: super_admin (manages all businesses), business_admin (manages own business), staff (regular employee)';
