-- Add unique constraint to prevent duplicate names
-- First, let's identify and handle any existing duplicates

-- Create a temporary table to store the first occurrence of each name
CREATE TEMP TABLE first_users AS
SELECT DISTINCT ON (TRIM(LOWER(name))) id, name
FROM public.users
ORDER BY TRIM(LOWER(name)), created_at ASC;

-- Delete duplicate users (keeping only the first occurrence of each name)
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM first_users);

-- Add unique constraint on name (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_name_idx 
ON public.users (TRIM(LOWER(name)));

-- Add a constraint to ensure names are trimmed
ALTER TABLE public.users 
ADD CONSTRAINT check_name_trimmed 
CHECK (name = TRIM(name) AND LENGTH(TRIM(name)) > 0);

-- Update existing names to be trimmed (just in case)
UPDATE public.users 
SET name = TRIM(name) 
WHERE name != TRIM(name);
