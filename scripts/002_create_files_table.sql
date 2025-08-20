-- Create files table for file upload management
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  s3_bucket VARCHAR(100) NOT NULL,
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster user file lookups
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

-- Create index on upload_status for filtering
CREATE INDEX IF NOT EXISTS idx_files_upload_status ON files(upload_status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
