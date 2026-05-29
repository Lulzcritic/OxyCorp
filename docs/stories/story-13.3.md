# Story 13.3: Cartridge Equipping & Market Exchange

**Epic:** Epic 13: Diegetic OS & The RISK-16 Virtual Machine
**Role:** Developer
**Goal:** I want to save compiled RISK-16 bytecode to physical Cartridges, equip them to swarms, and trade them on the market.

## Acceptance Criteria

1.  **Cartridge Item Data**:
    - Add `CARTRIDGE` as a new item type in the database schema.
    - Add a `bytecode` column (Buffer or Base64 String) to store the compiled RISK-16 binary output.

2.  **Compilation Endpoint**:
    - Add a "Burn to Cartridge" button in `LogicEditorWidget`.
    - Backend endpoint `POST /cartridges/compile` that receives the bytecode, validates its size, consumes a blank cartridge resource, and creates a programmed Cartridge in the inventory.

3.  **Equipping to Swarms**:
    - Update `SwarmConfigWidget` to allow players to slot a programmed Cartridge into a Drone Swarm.
    - The backend combat resolver must fetch this Cartridge's bytecode and load it into the RISK-16 VM when resolving combat.

4.  **Market Integration**:
    - Ensure Cartridges can be listed on the Exchange.
    - Buyers can view the metadata (e.g., script size, custom name) and purchase the AI, transferring the bytecode seamlessly to their inventory.

## Dev Agent Record

### Status
- [ ] Cartridge Item Data
- [ ] Compilation Endpoint
- [ ] Equipping to Swarms
- [ ] Market Integration
