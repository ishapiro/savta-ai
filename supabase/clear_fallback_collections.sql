-- Clear existing fallback collections to force new AWS collection creation
-- This will allow the system to test if AWS permissions are now working

-- Delete fallback face collections
DELETE FROM face_collections 
WHERE is_fallback = true;

-- Delete fallback faces
DELETE FROM faces 
WHERE is_fallback = true;

-- Reset the sequence if needed
-- SELECT setval('face_collections_id_seq', (SELECT MAX(id) FROM face_collections));
-- SELECT setval('faces_id_seq', (SELECT MAX(id) FROM faces));
