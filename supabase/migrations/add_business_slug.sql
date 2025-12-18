-- Add slug column to businesses table
ALTER TABLE businesses
ADD COLUMN slug TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_businesses_slug ON businesses(slug);

-- Add constraint to ensure slug is URL-friendly (lowercase, hyphens, no spaces)
ALTER TABLE businesses
ADD CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$');

-- Add comment
COMMENT ON COLUMN businesses.slug IS 'URL-friendly unique identifier for the business (e.g., "dana-salon")';
