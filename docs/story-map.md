# Moloch Story Map

## Executive Summary

This document visualizes the release strategy for **Moloch**, breaking down the 11 Epics into logical release phases to ensure a playable loop is delivered early and then expanded upon.

## Release Phases

```mermaid
gantt
    title Moloch Release Schedule
    dateFormat  YYYY-MM-DD
    section Phase 1: Launchpad
    Genesis (Auth/Profile)     :done,    e1, 2026-02-01, 7d
    Harvest Loop (Mining)      :active,  e2, after e1, 7d
    Map V1 (Basic Grid)        :         e6, after e1, 5d
    section Phase 2: Economy
    The Exchange (Market)      :         e3, after e2, 7d
    The Forge (Refining)       :         e8, after e3, 7d
    Infrastructure (Bunker)    :         e10, after e8, 5d
    section Phase 3: Progression
    Directives (Quests)        :         e11, after e10, 7d
    Neural Skills (XP)         :         e9, after e11, 7d
    Chat (Social)              :         e5, after e3, 5d
    section Phase 4: Warlord
    Drone Command (Combat)     :         e4, after e9, 10d
    Territory (Adv Map)        :         e7, after e4, 7d
```

## Detailed Flow

### Phase 1: The Launchpad (Foundation)

**Goal:** A player can login, spawn on Mars, and mine a rock.

- **Epic 1: Genesis** - User Auth, Persistent Profile.
- **Epic 6: The Red Frontier (Part 1)** - Spawning logic, Sector viewer.
- **Epic 2: Harvest Loop** - Mining timers, Inventory backend.

### Phase 2: The Industrialist (Economy)

**Goal:** A player can refine ore and sell it to others.

- **Epic 3: The Exchange** - Buying/Selling on global market.
- **Epic 8: The Forge** - Converting Ore -> Alloys (adding value).
- **Epic 10: Infrastructure** - Building upgrades to increase limits.

### Phase 3: The Specialist (Progression)

**Goal:** Players specialize into Roles (Triangle of Efficiency).

- **Epic 11: Directives** - Contracts to earn Credits & Skill Points.
- **Epic 9: Neural Conditioning** - Spending SP to unlock efficiency bonuses.
- **Epic 5: Comm-Link** - Global chat to facilitate deals.

### Phase 4: The Warlord (Conflict)

**Goal:** Players fight for territory and resources.

- **Epic 4: Drone Command** - TGR Combat Resolver, Swarm Config.
- **Epic 7: Industrial Ownership** - Claiming plots, PVP over resources.

## Dependency Graph

```mermaid
graph TD
    E1[E1: Genesis] --> E2[E2: Harvest]
    E1 --> E6[E6: Map V1]
    E2 --> E3[E3: Exchange]
    E2 --> E8[E8: Forge]
    E3 --> E10[E10: Bunker]
    E8 --> E10
    E10 --> E11[E11: Directives]
    E11 --> E9[E9: Skills]
    E9 --> E4[E4: Drone Cmd]
    E6 --> E7[E7: Territory]
    E4 --> E7
```
