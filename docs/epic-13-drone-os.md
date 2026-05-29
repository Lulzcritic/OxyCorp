# Epic 13: Diegetic OS & The RISK-16 Virtual Machine

## Epic Goal
Build the RISK-16 Virtual Machine in Rust (compiled to WASM) and a high-level language compiler in the Diegetic OS terminal, allowing Forge specialists to program drone combat AI securely and deterministically.

## Background Context
To ensure 100% determinism in combat and protect the backend from malicious player scripts (e.g., infinite loops), we cannot execute raw JavaScript on the server. Instead, players will write high-level scripts in the game's terminal. These scripts are compiled into bytecode for a custom 16-bit processor (the "RISK-16"). This bytecode is executed by a sandboxed Rust Virtual Machine shared between the client (for testing/replays) and the backend (for authoritative combat resolution).

## Features
### Feature 1: The RISK-16 Virtual Machine (Rust + WASM)
- A custom sandboxed VM written in Rust with a limited memory footprint and register set.
- Defines an instruction set including standard operations (add, jump) and game-specific Syscalls (move, fire, scan).
- Enforces a strict execution quota (e.g., 100 instructions per tick) to prevent infinite loops and guarantee server stability.
- Compiled to WebAssembly (WASM) for frontend integration and used natively (or via WASM) on the backend.

### Feature 2: High-Level Compiler & Terminal UI
- A retro-styled IDE interface accessible via the War Room Terminal.
- A custom lexer/parser that translates a simplified high-level scripting language (similar to C or JS) into RISK-16 bytecode.
- Players use high-level commands like `if (getNearestEnemy().hp < 20) { fire(); }`, which the compiler turns into assembly operations.

### Feature 3: The Cartridge System
- Compiled RISK-16 bytecode is saved to physical in-game items called "Cartridges".
- Cartridges act as the "brain" of the drone swarms.
- Cartridges can be traded on the global market, allowing master programmers to sell their compiled AI to other classes.

## Stories
- **Story 13.1:** As a system architect, I want to build the RISK-16 VM in Rust and compile it to WASM, to securely execute drone AI.
- **Story 13.2:** As a Forge specialist, I want a Logic Editor Terminal that compiles high-level script into RISK-16 bytecode, so I don't have to write raw assembly.
- **Story 13.3:** As a tactician, I want to save bytecode to physical Cartridges and equip them to my swarm for combat.
