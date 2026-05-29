# Story 13.1: The RISK-16 Virtual Machine (Rust + WASM)

**Epic:** Epic 13: Diegetic OS & The RISK-16 Virtual Machine
**Role:** Developer
**Goal:** I want to build the RISK-16 Virtual Machine in Rust and compile it to WASM, so that we have a secure, deterministic engine for executing drone logic.

## Acceptance Criteria

1.  **Rust VM Architecture**:
    - Initialize a new Rust library crate (`risk16-vm`).
    - Define the VM state struct: 16-bit architecture, limited registers (e.g., 8 general-purpose), and a small memory array (e.g., 2KB per drone).

2.  **Instruction Set & Syscalls**:
    - Implement a basic bytecode instruction set for math, logic, and control flow (Add, Sub, Jump, Jump-If-Zero).
    - Implement a `Syscall` interrupt instruction designed for game interaction (e.g., `0x10 = MOVE`, `0x11 = FIRE`, `0x12 = SCAN_ENEMY`). The VM should yield control back to the host environment when a syscall is triggered.

3.  **Execution Quota (Sandboxing)**:
    - The `vm.tick()` function must enforce a maximum instruction limit per call (e.g., max 100 instructions).
    - If the quota is exceeded (due to an infinite loop), the VM pauses execution until the next game tick, preventing server lockups.

4.  **WASM Compilation & Export**:
    - Use `wasm-pack` and `wasm-bindgen` to compile the Rust VM into a WASM module.
    - Expose functions to load a bytecode array into memory, execute a tick, and read the state.
    - Ensure the WASM package can be imported into both the React frontend and NestJS backend.

## Dev Agent Record

### Status
- [ ] Rust VM Architecture
- [ ] Instruction Set & Syscalls
- [ ] Execution Quota
- [ ] WASM Compilation
