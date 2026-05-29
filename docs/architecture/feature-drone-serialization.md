# Design Doc: Drone Stats Serialization

## 1. Problem Statement

Currently, Drone statistics (Attack, Defense, Health) are hardcoded in `CombatService` using a switch statement. This makes balancing changes require code deployments and prevents dynamic adjustments.

## 2. Proposed Solution

Introduce a `DroneVariant` database model to store the base statistics for each drone type. The `CombatService` will fetch these stats (cached) instead of using hardcoded values.

## 3. Database Schema

We will add a new model `DroneVariant` to `schema.prisma`.

```prisma
// New Model
model DroneVariant {
  id          String   @id  // Matches Inventory.item (e.g., 'DRONE_ATTACK_V1')
  name        String   // Display Name (e.g., 'Wasp I')
  description String?

  // Core Stats
  attack      Int      @default(0)
  defense     Int      @default(0)
  speed       Int      @default(1) // Initiative
  range       Int      @default(1)
  health      Int      @default(10)

  // Meta
  tier        Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("drone_variants")
}
```

## 4. Integration Logic

1.  **Inventory Link**: The `id` of `DroneVariant` corresponds 1:1 with the `item` string stored in `Inventory` and `Swarm.formation`.
2.  **Service Layer**: `CombatService` will have a `getDroneStats(variantId: string)` method.
3.  **Caching**: To prevent DB hits on every battle tick, `DroneVariant` data should be cached in Redis or in-app memory (LRU) since it changes rarely.

## 5. Seed Data

We will migrate the existing hardcoded values to the seed script.

| ID                 | Name       | Attack | Defense | Speed | Health |
| :----------------- | :--------- | :----- | :------ | :---- | :----- |
| `DRONE_ATTACK_V1`  | Wasp I     | 10     | 2       | 5     | 50     |
| `DRONE_DEFENSE_V1` | Guardian I | 2      | 10      | 2     | 100    |
| `DRONE_SPEED_V1`   | Runner I   | 5      | 5       | 8     | 40     |

## 6. Migration Plan

1.  Apply schema change.
2.  Run seed script to populate `drone_variants`.
3.  Refactor `CombatService` to read from DB (Repo).
