-- Create users table for registration data
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  fb_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tribes table
CREATE TABLE public.tribes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  element TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tribe_assignments table to track who got which tribe
CREATE TABLE public.tribe_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE CASCADE,
  assigned_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public app)
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view tribes" ON public.tribes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tribes" ON public.tribes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view tribe assignments" ON public.tribe_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tribe assignments" ON public.tribe_assignments FOR INSERT WITH CHECK (true);

-- Insert the four tribes data
INSERT INTO public.tribes (name, element, symbol, description, color) VALUES
('Judah', 'Lion', '🦁', 'Courageous leaders with the heart of a lion, born to rule with wisdom.', 'from-yellow-600 to-orange-500'),
('Dan', 'Eagle', '🦅', 'Visionary scouts soaring high, seeing what others cannot see.', 'from-blue-600 to-cyan-400'),
('Ephraim', 'Ox', '🐂', 'Strong and steadfast workers, the backbone of every community.', 'from-green-700 to-green-500'),
('Reuben', 'Man', '👤', 'Compassionate servants with hearts for humanity and justice.', 'from-purple-600 to-indigo-400');