-- Quick fix for ScriptSlap database relationships
-- Run this if you're getting relationship errors

-- Drop and recreate script_metadata table with proper constraints
DROP TABLE IF EXISTS script_metadata CASCADE;

CREATE TABLE script_metadata (
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

-- Create indexes
CREATE INDEX idx_script_metadata_script_id ON script_metadata(script_id);
CREATE INDEX idx_script_metadata_user_id ON script_metadata(user_id);
CREATE INDEX idx_script_metadata_is_favorite ON script_metadata(is_favorite);

-- Enable RLS
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

SELECT 'Script metadata table relationships fixed!' as message;
