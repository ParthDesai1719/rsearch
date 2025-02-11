CREATE EXTENSION IF NOT EXISTS uuid-ossp;

CREATE TABLE deep_research_results (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    searchTerm TEXT NOT NULL,
    learnings TEXT[],
    visitedUrls TEXT[],
    researchProgress TEXT,
    finalReport TEXT,
    metadata JSONB
);
