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

-- Insert the six tribes data
INSERT INTO public.tribes (name, element, symbol, description, color) VALUES
('Shadow Wolves', 'Darkness', '🐺', 'Masters of stealth and cunning, guardians of the night realm.', 'from-purple-900 to-gray-900'),
('Fire Phoenixes', 'Fire', '🔥', 'Passionate warriors who rise from ashes, keepers of eternal flame.', 'from-red-600 to-orange-500'),
('Earth Guardians', 'Earth', '🌿', 'Wise protectors of nature, healers of the ancient forest.', 'from-green-700 to-green-500'),
('Storm Riders', 'Air', '⚡', 'Swift as lightning, masters of wind and sky.', 'from-blue-600 to-cyan-400'),
('Crystal Seers', 'Spirit', '💎', 'Mystic oracles who see beyond the veil of reality.', 'from-indigo-600 to-purple-400'),
('Ocean Depths', 'Water', '🌊', 'Flowing like tides, keepers of ancient water wisdom.', 'from-teal-600 to-blue-500');