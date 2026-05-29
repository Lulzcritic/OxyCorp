-- Insert demo swarms for battle testing
-- Uses camelCase column names as they appear in Prisma schema (no @map annotations)

INSERT INTO swarms (id, "userId", name, formation, "isActive", "createdAt", "updatedAt")
VALUES 
  (
    'demo-swarm-a',
    '00000000-0000-0000-0000-000000000000',
    'Alpha Squadron',
    '[{"x":0,"y":2,"droneId":"DRONE_ATTACK_V1"},{"x":1,"y":1,"droneId":"DRONE_ATTACK_V1"},{"x":1,"y":3,"droneId":"DRONE_DEFENSE_V1"}]'::json,
    true,
    NOW(),
    NOW()
  ),
  (
    'demo-swarm-b',
    '00000000-0000-0000-0000-000000000000',
    'Bravo Squadron',
    '[{"x":4,"y":2,"droneId":"DRONE_DEFENSE_V1"},{"x":3,"y":1,"droneId":"DRONE_SPEED_V1"},{"x":3,"y":3,"droneId":"DRONE_ATTACK_V1"}]'::json,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
