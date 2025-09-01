-- Face Similarity Search Functions
-- These functions provide optimized vector similarity search using pgvector

-- Function to find similar faces using vector similarity
CREATE OR REPLACE FUNCTION find_similar_faces(
  source_face_id UUID,
  similarity_threshold DECIMAL DEFAULT 0.8,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  face_id UUID,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as face_id,
    (f.face_vector <=> (
      SELECT face_vector 
      FROM faces 
      WHERE id = source_face_id
    )) as similarity_score
  FROM faces f
  WHERE f.id != source_face_id
    AND f.deleted = false
    AND (f.face_vector <=> (
      SELECT face_vector 
      FROM faces 
      WHERE id = source_face_id
    )) >= similarity_threshold
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Function to find faces by person group
CREATE OR REPLACE FUNCTION find_faces_by_person(
  person_group_id UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  face_id UUID,
  asset_id UUID,
  confidence DECIMAL,
  bounding_box JSONB,
  assigned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as face_id,
    f.asset_id,
    f.confidence,
    f.bounding_box,
    fpl.assigned_at
  FROM faces f
  INNER JOIN face_person_links fpl ON f.id = fpl.face_id
  WHERE fpl.person_group_id = person_group_id
    AND f.deleted = false
    AND fpl.deleted = false
  ORDER BY fpl.assigned_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get person statistics
CREATE OR REPLACE FUNCTION get_person_statistics(user_id_param UUID)
RETURNS TABLE (
  person_id UUID,
  person_name TEXT,
  face_count BIGINT,
  avg_confidence DECIMAL,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg.id as person_id,
    pg.name as person_name,
    COUNT(fpl.face_id) as face_count,
    AVG(f.confidence) as avg_confidence,
    MIN(f.created_at) as first_seen,
    MAX(f.created_at) as last_seen
  FROM person_groups pg
  LEFT JOIN face_person_links fpl ON pg.id = fpl.person_group_id
  LEFT JOIN faces f ON fpl.face_id = f.id
  WHERE pg.user_id = user_id_param
    AND pg.deleted = false
    AND (fpl.deleted = false OR fpl.deleted IS NULL)
    AND (f.deleted = false OR f.deleted IS NULL)
  GROUP BY pg.id, pg.name
  ORDER BY face_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to find unassigned faces
CREATE OR REPLACE FUNCTION find_unassigned_faces(
  user_id_param UUID,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  face_id UUID,
  asset_id UUID,
  confidence DECIMAL,
  bounding_box JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as face_id,
    f.asset_id,
    f.confidence,
    f.bounding_box,
    f.created_at
  FROM faces f
  WHERE f.user_id = user_id_param
    AND f.deleted = false
    AND NOT EXISTS (
      SELECT 1 
      FROM face_person_links fpl 
      WHERE fpl.face_id = f.id 
        AND fpl.deleted = false
    )
  ORDER BY f.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get face detection statistics
CREATE OR REPLACE FUNCTION get_face_detection_stats(user_id_param UUID)
RETURNS TABLE (
  total_faces BIGINT,
  total_people BIGINT,
  avg_confidence DECIMAL,
  faces_today BIGINT,
  faces_this_week BIGINT,
  faces_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(f.id) as total_faces,
    COUNT(DISTINCT pg.id) as total_people,
    AVG(f.confidence) as avg_confidence,
    COUNT(CASE WHEN f.created_at >= CURRENT_DATE THEN f.id END) as faces_today,
    COUNT(CASE WHEN f.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN f.id END) as faces_this_week,
    COUNT(CASE WHEN f.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN f.id END) as faces_this_month
  FROM faces f
  LEFT JOIN face_person_links fpl ON f.id = fpl.face_id
  LEFT JOIN person_groups pg ON fpl.person_group_id = pg.id
  WHERE f.user_id = user_id_param
    AND f.deleted = false
    AND (fpl.deleted = false OR fpl.deleted IS NULL)
    AND (pg.deleted = false OR pg.deleted IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Function to suggest person assignments based on similarity
CREATE OR REPLACE FUNCTION suggest_person_assignments(
  user_id_param UUID,
  similarity_threshold DECIMAL DEFAULT 0.9,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  face_id UUID,
  suggested_person_id UUID,
  suggested_person_name TEXT,
  similarity_score DECIMAL,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    f.id as face_id,
    pg.id as suggested_person_id,
    pg.name as suggested_person_name,
    MAX(fs.similarity_score) as similarity_score,
    f.confidence
  FROM faces f
  INNER JOIN face_similarities fs ON f.id = fs.face1_id OR f.id = fs.face2_id
  INNER JOIN faces f2 ON (fs.face1_id = f2.id AND fs.face2_id = f.id) OR (fs.face2_id = f2.id AND fs.face1_id = f.id)
  INNER JOIN face_person_links fpl ON f2.id = fpl.face_id
  INNER JOIN person_groups pg ON fpl.person_group_id = pg.id
  WHERE f.user_id = user_id_param
    AND f.deleted = false
    AND f2.deleted = false
    AND fpl.deleted = false
    AND pg.deleted = false
    AND fs.similarity_score >= similarity_threshold
    AND NOT EXISTS (
      SELECT 1 
      FROM face_person_links fpl2 
      WHERE fpl2.face_id = f.id 
        AND fpl2.deleted = false
    )
  GROUP BY f.id, pg.id, pg.name, f.confidence
  ORDER BY similarity_score DESC, f.confidence DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION find_similar_faces(UUID, DECIMAL, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION find_faces_by_person(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_person_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_unassigned_faces(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_face_detection_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION suggest_person_assignments(UUID, DECIMAL, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION find_similar_faces(UUID, DECIMAL, INTEGER) IS 'Find faces similar to a given face using vector similarity search';
COMMENT ON FUNCTION find_faces_by_person(UUID, INTEGER) IS 'Find all faces assigned to a specific person';
COMMENT ON FUNCTION get_person_statistics(UUID) IS 'Get statistics for all people in a user account';
COMMENT ON FUNCTION find_unassigned_faces(UUID, INTEGER) IS 'Find faces that have not been assigned to any person';
COMMENT ON FUNCTION get_face_detection_stats(UUID) IS 'Get overall face detection statistics for a user';
COMMENT ON FUNCTION suggest_person_assignments(UUID, DECIMAL, INTEGER) IS 'Suggest person assignments for unassigned faces based on similarity';
