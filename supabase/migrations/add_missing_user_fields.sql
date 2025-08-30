-- Add missing fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS invited_by TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'reserve',
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Create inviters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inviters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tribe TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for inviters table
ALTER TABLE public.inviters ENABLE ROW LEVEL SECURITY;

-- Create policies for inviters table
CREATE POLICY "Anyone can view inviters" ON public.inviters FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inviters" ON public.inviters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inviters" ON public.inviters FOR UPDATE USING (true);

-- Insert some sample inviters (you can modify this as needed)
INSERT INTO public.inviters (name, tribe, status) VALUES
('John Doe', 'JUDAH', 'active'),
('Jane Smith', 'REUBEN', 'active'),
('Bob Wilson', 'SIMEON', 'active'),
('Alice Brown', 'LEVI', 'active')
ON CONFLICT DO NOTHING;
