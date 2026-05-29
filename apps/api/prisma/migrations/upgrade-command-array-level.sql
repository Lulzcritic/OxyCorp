-- Upgrade existing COMMAND_ARRAY facilities from level 1 to level 3
-- This allows all users to use the Demo Battle feature (requires 3 drones minimum)

UPDATE "BunkerFacility"
SET level = 3
WHERE type = 'COMMAND_ARRAY' AND level < 3;

-- Verify the upgrade
SELECT 
  "userId", 
  type, 
  level,
  "createdAt"
FROM "BunkerFacility"
WHERE type = 'COMMAND_ARRAY'
ORDER BY "userId";
