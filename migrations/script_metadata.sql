-- Create script_metadata table for enhanced script management
CREATE TABLE script_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES generated_scripts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(script_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_script_metadata_script_id ON script_metadata(script_id);
CREATE INDEX idx_script_metadata_user_id ON script_metadata(user_id);
CREATE INDEX idx_script_metadata_is_favorite ON script_metadata(is_favorite);

-- Enable Row Level Security
ALTER TABLE script_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own script metadata" ON script_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own script metadata" ON script_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own script metadata" ON script_metadata
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own script metadata" ON script_metadata
  FOR DELETE USING (auth.uid() = user_id);
