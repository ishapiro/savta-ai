-- Cleanup: Soft delete faces for assets that are already deleted
-- This ensures data consistency for faces associated with deleted assets

-- Update faces to be soft-deleted when their asset is deleted
UPDATE faces
SET 
  deleted = true
WHERE deleted = false
  AND asset_id IN (
    SELECT id 
    FROM assets 
    WHERE deleted = true
  );

-- Report on the cleanup
SELECT 
  COUNT(*) as faces_soft_deleted,
  'Soft-deleted faces for deleted assets' as description
FROM faces
WHERE deleted = true
  AND asset_id IN (
    SELECT id 
    FROM assets 
    WHERE deleted = true
  );

