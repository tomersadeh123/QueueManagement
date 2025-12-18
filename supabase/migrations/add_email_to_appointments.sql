-- Add customer_email column to appointments table
ALTER TABLE appointments
ADD COLUMN customer_email TEXT;

-- Add index for faster email lookups
CREATE INDEX idx_appointments_email ON appointments(customer_email);

-- Add comment
COMMENT ON COLUMN appointments.customer_email IS 'Customer email address for notifications';
