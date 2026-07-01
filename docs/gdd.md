# Game Design Document: Tarsis

## 1. Project Overview
- **Project Name:** Tarsis
- **Genre:** Techno-Gothic Browser MMORPG
- **Target Platform:** Web Browser
- **Engine Setup:** Three.js (3D View), React (UI/Menus), PostgreSQL (Database)
- **Setting:** Post-Earth Grimdark Mars (The "Red Tomb")
- **Core Pillars:** 
  - Harvesting (Isolation & Risk)
  - Trading & Crafting (Social Economy)
  - Fighting & Programming (Territorial Control & Automation)

## 2. Executive Summary
Tarsis is a highly immersive, browser-based MMORPG set on the decaying, industrial wasteland of Mars. Players manage their private bunkers, venture into hazardous 10-player "Wild Plots" to harvest vital resources, and command drone swarms to defend their territorial claims. While every player has the capability to perform all primary actions, three distinct Specializations offer massive efficiency multipliers. This design fosters a deeply interdependent, player-driven economy without forced multiplayer expeditions, creating a unique "Solo-Market Loop."

## 3. World and Setting
### 3.1 The Red Tomb (Mars)
Mars has become a grimdark, industrial wasteland. Players navigate a 3rd-person 3D world filled with decaying infrastructure, toxic dust, and remnants of forgotten technologies, embodying the techno-gothic aesthetic. The map is not static; it is generated procedurally and expands infinitely outwards as new players awaken in their respective bunkers, ensuring a constantly growing frontier.

### 3.2 The Company
An omnipresent, automated corporate ghost that dictates the overarching laws of the Red Tomb. Unbeknownst to the players, "The Company" is actually a highly advanced, hidden Artificial Intelligence. It demands "Service Credits" to grant players the rights to claim territory. This AI dynamically triggers global server events and provides players with daily and weekly missions, constantly shifting the economy and driving regional conflicts.

### 3.3 Death and Respawn Mechanics (Meat-Vat Reset)
Death in Tarsis is punishing but deeply integrated into the lore. Upon death, a player undergoes a "Meat-Vat Reset"—regrowing a new body in their bunker. They lose whatever raw materials, loot, or components they were carrying in their backpack at the time of death, leaving their wreckage to be scavenged by others in the Wild Plots.

## 4. Game Interfaces
### 4.1 Diegetic UI and Terminals
Immersion is paramount. Players interact with physical, in-world terminals located within their private bunkers or social hubs to access menus, craft, manage drones, and trade. The UI matches a grimdark, retro-terminal aesthetic, bridging the 3D world (Three.js) with deep data management interfaces (React).

### 4.2 In-Game Operating System (Drone Programming)
A core gameplay mechanic revolves around a functional, diegetic computer OS accessed via in-game terminals. Here, players write actual code (or use visual logic blocks) to program the combat behaviors and automation routines for their drones. These scripts dictate how drones react, fight, and patrol. Highly effective scripts can be saved onto physical "Cartridges" and sold on the global market to players who prefer not to program their own drones.

## 5. Classes and Specializations (The Triangle of Efficiency)
Every player can perform basic actions. Specializations define absolute economic dominance in specific sectors, requiring players to trade with other classes to operate optimally.

### 5.1 The Cogitator Cathedral (Mining & Refining Focus)
The absolute masters of resource extraction and material refinement.
- **Baseline:** Can harvest nodes and refine basic materials.
- **Bonuses:**
  - **Resource Extraction:** 3x faster harvesting speed and a 20% chance to double yield.
  - **Techno-Sight:** Deep Scan reveals exact rarity and the remaining amount of resource nodes.
  - **Industrial Alchemy:** Converts raw materials (Sludge/Ore) into Refined Compounds at a massive 5x higher yield.
  - **Company Clearance:** Pays 75% less in "Protection Fees" to the Company to lock resource nodes in Wild Plots.
- **Visual Identity:** Lean suits equipped with glowing data-ports, heavy drilling rigs, and multi-lens helmets.

### 5.2 The Corpse-Fuelled Forge (Combat & Programming Focus)
The vanguard of the wasteland, specializing in drone warfare, territory defense, and logic programming.
- **Baseline:** Can build basic drones and defend themselves natively.
- **Bonuses:**
  - **Battle Hardened:** Drones possess 50% more HP and output 25% higher damage natively.
  - **Logic Mastery:** Gains access to advanced API hooks within the in-game OS for more complex drone programming.
  - **Scavenger Protocol:** Recovers 50% more usable components from destroyed player wreckage and defeated drones.
- **Visual Identity:** Bulkier, rusted suits featuring visible exhaust pipes and exposed hydraulic limbs.

### 5.3 The Void-Gate of Tharsis (Crafting Focus)
The grand artisans of the wasteland, responsible for fabricating the high-end equipment that keeps everyone alive.
- **Baseline:** Can craft standard items and process basic components.
- **Bonuses:**
  - **Master Fabrication:** Unlocks exclusive access to craft "Heavy Class" drone chassis, high-tier armor plating, and advanced AI chips.
  - **Assembly Line:** 5x faster crafting speed and a 25% chance to refund crafting materials.
  - **Mass Logistics:** 5x larger inventory capacity; suffers zero movement speed penalty when carrying "Heavy" equipment.
- **Visual Identity:** Suits integrated with modular cargo racks, robotic assembly arms, and heavy protective shielding.

## 6. Core Gameplay Loops & Economic Interdependence
Players operate in a **Solo-Market Loop**: individual, localized gameplay feeds into a highly social, interdependent macro-economy. 

### 6.1 The Crafting & Extraction Cycle
Cogitators efficiently harvest raw Sludge and Ore, refining it in bulk. They sell these refined materials to Tharsis Artisans. The Tharsis Artisans use these materials to craft heavy armor, advanced drone chassis, and logic chips, which they then sell to Forge combatants and Cogitators alike.

### 6.2 The Cartridge Economy
Forge specialists purchase high-end drone chassis from Tharsis Artisans. Using the in-game OS, Forge specialists program advanced combat behaviors onto Cartridges. A master programmer can sell highly efficient Cartridges on the market, allowing other classes to effectively defend themselves without needing to code.

### 6.3 The Combat Reset & Scavenging
When any player is defeated and routed back to the Meat-Vats, their dropped loot creates an economic opportunity. Forge specialists thrive in these scenarios, scavenging player wreckage for parts, which are then sold back to Tharsis Artisans as "Recycled Components" to fuel the crafting loop.

### 6.4 Syndicates (Guilds and Territory Control)
Players can form or join Syndicates to combine forces. Syndicates operate on a macro scale:
- **Territory Control:** Syndicates can claim specific plots on the expanding procedural map.
- **Infrastructure:** Within claimed territory, Syndicates can build massive automated factories and continuous mining machines.
- **Warfare:** Syndicates can declare war, invading rival territories to conquer their lands or pillage resources from their automated infrastructure, creating a dynamic, player-driven geopolitical landscape.

## 7. Player Progression
### 7.1 Bunker Evolution
The player's private bunker serves as their base of operations and respawn point. The primary progression path involves upgrading the bunker's physical terminals. Upgrading terminals enhances the player's specialization bonuses.

## 8. Technical Architecture
### 8.1 Stack Overview
- **Client (3D Environment):** Three.js for handling the 3rd-person 3D world rendering and character controllers.
- **Client (UI / Menus):** React for rendering deep, stateful diegetic terminal menus, HUD overlays, and the OS environment.
- **Backend & Database:** PostgreSQL for relational data storage. Custom Auth for authentication.
- **Networking:** WebSockets for handling real-time presence, state synchronization, spatial awareness, and combat within the instanced Wild Plots and Social Hubs.
   