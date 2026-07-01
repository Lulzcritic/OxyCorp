# Project Brief: Moloch

## 1. Executive Summary

**Product Concept:** *Moloch* is a Techno-Gothic browser-based MMORPG set on a grimdark Mars, where players manage industrial empires, trade in a player-driven economy, and deploy drone swarms for territory control.
**Primary Problem:** Existing "economy MMOs" (EVE Online, Prosperous Universe) are either non-functional on browsers, require "second job" time commitments, or lack visceral engagement (combat/visuals).
**Target Market:** "Retired Hardcore Gamers" (ages 25-45) who love deep complexity but have limited playtime due to careers/family ("The Lunch Break Warlord").
**Key Value Proposition:** "Eve Online aimed at the busy professional" — high-stakes deep economy and tactical depth playable in 15-minute bursts on any device.

## 2. Problem Statement

**Current State & Pain Points:**
- The "Deep Economy" genre is dominated by *Eve Online*, which demands hours of uninterrupted focus and installation of a heavy client.
- Browser alternatives like *Prosperous Universe* are accessible but "dry," lacking combat or visual rewards ("Spreadsheets in Space" without the space).
- Adult gamers are effectively "aging out" of the genre they love because they cannot compete with students/grinders who play 8+ hours a day.

**Impact:** There is a lost generation of "Whale" players (high disposable income, low time) who are homeless gaming-wise.

**Why Now:**
- WebGPU and modern browser tech finally allow for "good enough" 3D graphics to break the "text game" stigma.
- The "Dad Game" market (simulators, strategy) is booming, proving the demand for depth-over-reflexes.

## 3. Proposed Solution

**Core Concept:**
A browser MMORPG centered on the **"Triangle of Efficiency"**:
1.  **Harvesting (Isolation):** Solo play to gather raw materials.
2.  **Trading (Social):** Interdependent market where specialists MUST trade to survive.
3.  **Fighting (Territory):** Automated drone battles for resource claims.

**Key Differentiators:**
- **Asynchronous Combat:** "Auto-Battler" logic. Pre-program your drone swarm's behavior, deploy it, and watch the results later. No twitch reflexes required.
- **Diegetic UI:** No raw spreadsheets. Terminals look like rusted, holographic Martian tech.
- **Zero Friction:** Login via OAuth, play in a tab. No installs.

**Vision:**
To create the "ultimate second-screen game" that feels like a full AAA MMO experience but fits into the pockets of time during a workday.

## 4. Target Users

### Primary User Segment: "The Lunch Break Warlord"
- **Profile:** Age 28-45, employed in tech/engineering/finance. High disposable income.
- **Behavior:** Keep a browser tab open at work. Uses Discord heavily. nostalgic for classic MMOs.
- **Needs:**
    - "Pause-ability" (can walk away instantly if boss enters).
    - Depth (wants to theory-craft execution).
    - Respect for time (no "waiting 4 hours for a fleet").
- **Goals:** To feel like a powerful industrial magnate or fleet commander without neglecting real life.

### Secondary User Segment: "The Mobile Industrialist"
- **Profile:** Commuters, parents with small windows of free time.
- **Behavior:** Plays primarily on phone/tablet.
- **Needs:** UI that works on touch screens; high-contrast text.

## 5. Goals & Success Metrics

### Business Objectives
- **Validate Niche:** Achieve 1,000 active users within 3 months of Alpha launch.
- **Monetization Viability:** Validate a non-predatory "Time vs. Money" model (e.g., subscription for "Queue Slots" vs. buying power directly).
- **Tech Stability:** Ensure seamless data persistence (inventory/market) with < 1% error rate on transactions.

### MVP Success Metrics
- **Retention:** D1 Retention > 40%, D30 Retention > 15%.
- **Market Liquidity:** Volume of trades > 2x volume of items generated (indicating players are trading, not just hoarding).
- **Session Frequency:** Average 3+ sessions per user per day.

## 6. MVP Scope

### Core Features (Must Have)
- **User Accounts:** OAuth login, Persistent Inventory, "Bunker" management.
- **Harvesting:** Basic timer-based resource gathering in "Safe Plots."
- **Market:** Global Auction House (Buy/Sell orders).
- **Combat (Alpha):** Text-based battle resolution (compare Stats + RNG) to claim resource nodes.
- **Specializations:** Basic "Triangle" implementation (1 bonus per class).

### Out of Scope for MVP
- **3D World Visualization:** (Postponed to Phase 2 - MVP will be 2D/UI only).
- **Alliances/Corporations:** No formal guild tools.
- **Deep Crafting Tree:** Limited to 1-tier refining (Ore -> Metal).

### MVP Success Criteria
A playable loop where a player can Harvest -> Sell -> Buy Upgrade -> Harvest Faster, without critical bugs.

## 7. Post-MVP Vision

### Phase 2 Features
- **3D Visualization:** Three.js view of Mars surface (Visual juice).
- **Corporations:** Shared hangars, tax systems, alliance chat.
- **Tier 2 Economy:** Complex manufacturing (Components -> Modules -> Ships).

### Long-term Vision
"The Pocket Eve" represents a fully simulated, player-governed society living in your browser, running continuously even when you are offline.

## 8. Technical Considerations

### Platform Requirements
- **Target Platforms:** Desktop Browser (Chrome/Firefox/Edge), Mobile Browser (Safari/Chrome).
- **Tech Stack:**
    - **Frontend:** React + Tailwind (UI), Three.js (Future 3D).
    - **Backend:** Node.js/TypeScript (Game Logic).
    - **Database:** PostgreSQL (Relational data for economy is critical).
    - **Realtime:** WebSockets (Socket.io) for market/chat.

### Constraints & Assumptions
- **Budget:** Bootstrapped/Indie ($0 - Time equity only).
- **Timeline:** Alpha prototype in 4 weeks.
- **Assumption:** Players will tolerate text-based combat in MVP if the *economy* is compelling.

## 9. Risks & Open Questions

### Key Risks
- **"Boring" MVP:** Without 3D visuals, it might feel too much like a spreadsheet (Prosperous Universe clone). *Mitigation: High-quality UI art direction.*
- **Economy Breaking:** One exploit could ruin the market. *Mitigation: Strict transaction logging and admin "reset" tools.*

### Open Questions
- Can we make "Auto-Battler" combat exciting to *watch*?
- Will mobile browsers handle the WebSocket load efficiently?

## 10. Next Steps

### Immediate Actions
1.  **Architecture Design:** Define the Database Schema (PostgreSQL) for User/Inventory/Market.
2.  **UI Wireframing:** Design the "Dashboard" and market interface.
3.  **Prototype:** Build the "Harvest Loop" (Click button -> Timer -> Get Item).

### PM Handoff
This Project Brief provides the full context for **Moloch**. Please start in **'PRD Generation Mode'** (via `/architect` or similar), reviewing the brief to create the PRD section by section.

