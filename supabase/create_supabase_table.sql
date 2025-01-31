-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists
DROP TABLE IF EXISTS search_results;

-- Create search_results table
CREATE TABLE search_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "searchTerm" TEXT NOT NULL,
  mode TEXT NOT NULL,
  "refinedQuery" TEXT,
  "refinedQueryExplanation" TEXT,
  sources JSONB,
  "knowledgeGraph" JSONB,
  "reasoningContent" TEXT,
  "aiResponse" TEXT,
  "rawSources" JSONB,
  "createDate" TIMESTAMPTZ DEFAULT NOW(),
  "publishArticle" BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Add indexes for common queries
CREATE INDEX idx_search_term ON search_results ("searchTerm");
CREATE INDEX idx_mode ON search_results (mode);
CREATE INDEX idx_create_date ON search_results ("createDate");
