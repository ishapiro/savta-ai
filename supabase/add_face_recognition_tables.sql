-- Migration: Add Face Recognition Tables and pgvector Extension
-- Date: 2024-12-19
-- Description: Adds face recognition capabilities using AWS Rekognition + Supabase pgvector

-- Enable pgvector extension for face vector storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Face collections per user (links to AWS Rekognition collections)
CREATE TABLE IF NOT EXISTS face_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  aws_collection_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  deleted BOOLEAN DEFAULT FALSE
);

-- Individual faces with vectors from AWS Rekognition
CREATE TABLE IF NOT EXISTS faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  aws_face_id TEXT NOT NULL,
  face_vector vector(128) NOT NULL,
  bounding_box JSONB NOT NULL, -- {Left, Top, Width, Height, Confidence}
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  age_range JSONB, -- {Low, High} from AWS
  gender JSONB, -- {Value, Confidence} from AWS
  emotions JSONB, -- Array of emotions with confidence scores
  pose JSONB, -- Pose information from AWS
  quality JSONB, -- Quality metrics from AWS
  landmarks JSONB, -- Facial landmarks from AWS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  deleted BOOLEAN DEFAULT FALSE
);

-- Person groups (named people identified by users)
CREATE TABLE IF NOT EXISTS person_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  avatar_face_id UUID REFERENCES faces(id) ON DELETE SET NULL,
  description TEXT,
  relationship TEXT, -- e.g., "Grandmother", "Son", "Friend"
  is_primary_person BOOLEAN DEFAULT FALSE, -- For main family members
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  deleted BOOLEAN DEFAULT FALSE
);

-- Link faces to person groups (many-to-many relationship)
CREATE TABLE IF NOT EXISTS face_person_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  face_id UUID NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  person_group_id UUID NOT NULL REFERENCES person_groups(id) ON DELETE CASCADE,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  assigned_by TEXT DEFAULT 'ai' CHECK (assigned_by IN ('ai', 'user', 'system')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(face_id, person_group_id)
);

-- Face similarity cache for performance optimization
CREATE TABLE IF NOT EXISTS face_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  face1_id UUID NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  face2_id UUID NOT NULL REFERENCES faces(id) ON DELETE CASCADE,
  similarity_score DECIMAL(5,4) NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  similarity_type TEXT DEFAULT 'cosine' CHECK (similarity_type IN ('cosine', 'euclidean', 'l2')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(face1_id, face2_id)
);

-- Face processing queue for background processing
CREATE TABLE IF NOT EXISTS face_processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
-- Vector similarity search using pgvector
CREATE INDEX IF NOT EXISTS idx_faces_face_vector ON faces USING ivfflat (face_vector vector_cosine_ops);

-- User-specific queries
CREATE INDEX IF NOT EXISTS idx_faces_user_id ON faces(user_id);
CREATE INDEX IF NOT EXISTS idx_faces_asset_id ON faces(asset_id);
CREATE INDEX IF NOT EXISTS idx_faces_created_at ON faces(created_at);
CREATE INDEX IF NOT EXISTS idx_faces_confidence ON faces(confidence);

-- Person group queries
CREATE INDEX IF NOT EXISTS idx_person_groups_user_id ON person_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_person_groups_name ON person_groups(name);

-- Face-person relationship queries
CREATE INDEX IF NOT EXISTS idx_face_person_links_face_id ON face_person_links(face_id);
CREATE INDEX IF NOT EXISTS idx_face_person_links_person_group_id ON face_person_links(person_group_id);
CREATE INDEX IF NOT EXISTS idx_face_person_links_confidence ON face_person_links(confidence);

-- Similarity cache queries
CREATE INDEX IF NOT EXISTS idx_face_similarities_face1_id ON face_similarities(face1_id);
CREATE INDEX IF NOT EXISTS idx_face_similarities_face2_id ON face_similarities(face2_id);
CREATE INDEX IF NOT EXISTS idx_face_similarities_score ON face_similarities(similarity_score);

-- Processing queue queries
CREATE INDEX IF NOT EXISTS idx_face_processing_queue_status ON face_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_face_processing_queue_user_id ON face_processing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_face_processing_queue_priority ON face_processing_queue(priority);

-- Add unique constraints
ALTER TABLE face_collections ADD CONSTRAINT unique_user_collection UNIQUE(user_id);
ALTER TABLE person_groups ADD CONSTRAINT unique_user_person_name UNIQUE(user_id, name);

-- Add comments for documentation
COMMENT ON TABLE face_collections IS 'AWS Rekognition face collections per user for face indexing';
COMMENT ON TABLE faces IS 'Individual detected faces with 128-dimensional vectors from AWS Rekognition';
COMMENT ON TABLE person_groups IS 'Named people identified by users for organizing photos';
COMMENT ON TABLE face_person_links IS 'Links between detected faces and named people';
COMMENT ON TABLE face_similarities IS 'Cached similarity scores between faces for performance';
COMMENT ON TABLE face_processing_queue IS 'Queue for background face processing tasks';

COMMENT ON COLUMN faces.face_vector IS '128-dimensional face embedding vector from AWS Rekognition';
COMMENT ON COLUMN faces.bounding_box IS 'JSON with Left, Top, Width, Height coordinates (0-1 scale)';
COMMENT ON COLUMN faces.confidence IS 'AWS confidence score for face detection (0-1)';
COMMENT ON COLUMN face_similarities.similarity_score IS 'Similarity score between two faces (0-1, higher = more similar)';

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS update_face_collections_updated_at ON face_collections;
CREATE TRIGGER update_face_collections_updated_at 
    BEFORE UPDATE ON face_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faces_updated_at ON faces;
CREATE TRIGGER update_faces_updated_at 
    BEFORE UPDATE ON faces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_person_groups_updated_at ON person_groups;
CREATE TRIGGER update_person_groups_updated_at 
    BEFORE UPDATE ON person_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_face_person_links_updated_at ON face_person_links;
CREATE TRIGGER update_face_person_links_updated_at 
    BEFORE UPDATE ON face_person_links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_face_processing_queue_updated_at ON face_processing_queue;
CREATE TRIGGER update_face_processing_queue_updated_at 
    BEFORE UPDATE ON face_processing_queue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE face_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_person_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for face_collections
DROP POLICY IF EXISTS "Users can manage their own face collections" ON face_collections;
CREATE POLICY "Users can manage their own face collections" ON face_collections
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- RLS Policies for faces
DROP POLICY IF EXISTS "Users can manage their own faces" ON faces;
CREATE POLICY "Users can manage their own faces" ON faces
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- RLS Policies for person_groups
DROP POLICY IF EXISTS "Users can manage their own person groups" ON person_groups;
CREATE POLICY "Users can manage their own person groups" ON person_groups
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- RLS Policies for face_person_links
DROP POLICY IF EXISTS "Users can manage their own face-person links" ON face_person_links;
CREATE POLICY "Users can manage their own face-person links" ON face_person_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM faces f 
            WHERE f.id = face_person_links.face_id 
            AND f.user_id = (SELECT auth.uid())
        )
    );

-- RLS Policies for face_similarities
DROP POLICY IF EXISTS "Users can view their own face similarities" ON face_similarities;
CREATE POLICY "Users can view their own face similarities" ON face_similarities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM faces f 
            WHERE f.id = face_similarities.face1_id 
            AND f.user_id = (SELECT auth.uid())
        )
    );

-- RLS Policies for face_processing_queue
DROP POLICY IF EXISTS "Users can manage their own processing queue" ON face_processing_queue;
CREATE POLICY "Users can manage their own processing queue" ON face_processing_queue
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample data for testing (optional - remove in production)
-- INSERT INTO person_groups (user_id, name, display_name, relationship) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Person', 'Test', 'Family');

-- Verify the extension and tables were created
SELECT 'pgvector extension enabled' as status WHERE EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
);

SELECT 'face_collections table created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'face_collections'
);

SELECT 'faces table created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'faces'
);

SELECT 'person_groups table created' as status WHERE EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'person_groups'
);
