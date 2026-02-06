Project: Tarsis

Genre: Techno-Gothic Browser MMORPG
Setting: Post-Earth Grimdark Mars (The "Red Tomb")
Core Pillars: Harvesting (Isolation), Trading (Social), Fighting (Territory)

1. Executive Summary

Tarsis is a browser-based MMORPG set on a dying, industrial Mars. Players manage a private bunker, venture into hazardous "Wild Plots" to harvest resources, and command drone swarms to defend their claims. While all players can perform every action in the game, three specializations offer massive efficiency bonuses that drive a player-driven economy.

2. The World: The Red Tomb

The Company: An automated corporate ghost that demands "Service Credits" (earned via quests) to allow players to claim territory.

The Environment: 3rd-person 3D world. Players interact with physical terminals in their bunkers or social hubs to access menus (Diegetic UI).

Death: "Meat-Vat Reset." You regrow your body, but lose whatever you were carrying in your backpack.

3. The Triangle of Efficiency (Specializations)

Every player can harvest, craft, and trade. However, a specialist performs their role with "Industrial Excellence," making them vital for high-level play.

I. The Cogitator Cathedral (Efficiency Focus)

The Baseline: Everyone can harvest and craft basic AI chips.

The Specialist Bonus:

Resource Extraction: 3x faster harvesting speed and a 20% chance to double the yield.

Techno-Sight: Deep Scan reveals the exact rarity and remaining amount of resource nodes.

Advanced Logic: Can craft High-Tier AI Chips with 4+ logic slots.

Company Clearance: Pays 75% less in "Protection Fees" to the Company to claim and lock resource nodes in Wild Plots.

II. The Corpse-Fuelled Forge (Combat Focus)

The Baseline: Everyone can build basic drones and defend themselves.

The Specialist Bonus:

Battle Hardened: Drones have 50% more HP and 25% higher damage output.

Industrial Repair: Can repair damaged drones for half the resource cost of other roles.

Master Fabrication: Access to "Heavy Class" drone chassis and high-tier armor plating for pressurized suits.

III. The Void-Gate of Tharsis (Market Focus)

The Baseline: Everyone can carry items and list goods on the Global Auction House.

The Specialist Bonus:

Mass Logistics: 5x larger inventory capacity and no movement speed penalty when carrying "Heavy" resources.

Industrial Alchemy: Converts raw materials (Sludge/Ore) into Refined Compounds at a 5x higher yield than other roles.

Zero-Tax Protocol: Pays 0% Sales Tax on the Global Auction House and can list items remotely via their suit terminal.

Market Insight: Their Auction House terminal shows price history graphs and predicts "Company Audit" trends (supply/demand shifts).

4. Economic Interdependence (Solo-Market Loop)

Since there are no multiplayer expeditions, players interact through the Global Auction House and Social Hubs, creating a cycle of dependency:

The Component Cycle: A Forge specialist needs high-end AI chips for their drones. They buy these from a Cogitator on the market. In return, the Cogitator buys heavy armor plating from the Forge to survive longer in the dust.

The Refining Cycle: Both Cogitators and Forge players harvest raw materials, but their refining yields are poor. They sell their raw "Sludge" to a Merchant in bulk. The Merchant refines it with 5x efficiency and sells the "Pure Fuel" back to the others at a profit, but still cheaper than they could make it themselves.

The Market Flow: Because the Merchant pays no sales tax and can carry massive loads, they act as the primary market makers. They buy up cheap raw goods during "Efficiency Audits" and stockpile them to sell when "Embargoes" hit, using their "Market Insight" to predict the best times to trade.

The Combat Reset: When a player is defeated and sent to the Meat-Vats, they lose their loot. The Forge specialist thrives here by scavenging the wreckage for parts, which they then sell back to the other roles as "Recycled Components."

5. Progression

Bunker Evolution: Upgrading your bunker improves the terminals related to your specialization (e.g., the Cogitator's scanner becomes more powerful).

Visual Identity: * Cogitators: Lean suits with glowing data-ports and multi-lens helmets.

Forge: Bulkier, rusted suits with visible exhaust pipes and hydraulic limbs.

Merchants: Suits integrated with modular cargo racks and high-frequency trade antennas.

6. Technical Setup

Engine: Three.js (3D View), React (UI/Menus), Supabase (Database/Auth).

Network: WebSocket for real-time presence in the 10-player Wild Plots and Social Hubs.