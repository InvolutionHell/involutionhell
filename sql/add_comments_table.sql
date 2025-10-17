-- Add comments table for the custom comment system
-- This replaces the Giscus commenting system with a unified auth experience

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  doc_id VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  parent_id INTEGER,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) 
    REFERENCES comments(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_doc_id ON comments(doc_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Add comments relation to users table (handled by Prisma)
-- Prisma will manage this relationship through the schema

