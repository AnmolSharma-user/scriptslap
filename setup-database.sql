-- ScriptSlap Database Setup Script
-- Run this in your Supabase SQL Editor to set up all necessary tables

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_scripts table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_title TEXT,
  topic TEXT,
  youtube_url TEXT,
  language TEXT,
  video_length TEXT,
  generation_status TEXT DEFAULT 'pending',
  script_body_markdown TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create script_refinements table if it doesn't exist
CREATE TABLE IF NOT EXISTS script_refinements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES generated_scripts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  refinement_type TEXT,
  original_text TEXT,
  user_message TEXT,
  generated_options TEXT[],
  selected_option TEXT,
  paragraph_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create script_metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS script_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(script_id, user_id),
  CONSTRAINT fk_script_metadata_script_id
    FOREIGN KEY (script_id) REFERENCES generated_scripts(id) ON DELETE CASCADE,
  CONSTRAINT fk_script_metadata_user_id
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_generated_scripts_user_id ON generated_scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_scripts_status ON generated_scripts(generation_status);
CREATE INDEX IF NOT EXISTS idx_script_refinements_script_id ON script_refinements(script_id);
CREATE INDEX IF NOT EXISTS idx_script_refinements_user_id ON script_refinements(user_id);
CREATE INDEX IF NOT EXISTS idx_script_metadata_script_id ON script_metadata(script_id);
CREATE INDEX IF NOT EXISTS idx_script_metadata_user_id ON script_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_script_metadata_is_favorite ON script_metadata(is_favorite);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_refinements ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_metadata ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own scripts" ON generated_scripts;
DROP POLICY IF EXISTS "Users can insert their own scripts" ON generated_scripts;
DROP POLICY IF EXISTS "Users can update their own scripts" ON generated_scripts;
DROP POLICY IF EXISTS "Users can delete their own scripts" ON generated_scripts;

DROP POLICY IF EXISTS "Users can view their own refinements" ON script_refinements;
DROP POLICY IF EXISTS "Users can insert their own refinements" ON script_refinements;
DROP POLICY IF EXISTS "Users can update their own refinements" ON script_refinements;
DROP POLICY IF EXISTS "Users can delete their own refinements" ON script_refinements;

DROP POLICY IF EXISTS "Users can view their own script metadata" ON script_metadata;
DROP POLICY IF EXISTS "Users can insert their own script metadata" ON script_metadata;
DROP POLICY IF EXISTS "Users can update their own script metadata" ON script_metadata;
DROP POLICY IF EXISTS "Users can delete their own script metadata" ON script_metadata;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for generated_scripts
CREATE POLICY "Users can view their own scripts" ON generated_scripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scripts" ON generated_scripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts" ON generated_scripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts" ON generated_scripts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for script_refinements
CREATE POLICY "Users can view their own refinements" ON script_refinements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own refinements" ON script_refinements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own refinements" ON script_refinements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own refinements" ON script_refinements
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for script_metadata
CREATE POLICY "Users can view their own script metadata" ON script_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own script metadata" ON script_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own script metadata" ON script_metadata
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own script metadata" ON script_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'ScriptSlap database setup completed successfully!' as message;
