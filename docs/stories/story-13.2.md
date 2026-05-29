# Story 13.2: High-Level Compiler & Terminal UI

**Epic:** Epic 13: Diegetic OS & The RISK-16 Virtual Machine
**Role:** Developer
**Goal:** I want a Logic Editor Terminal that compiles high-level script into RISK-16 bytecode, so players don't have to write raw assembly.

## Acceptance Criteria

1.  **Terminal IDE**:
    - Create a retro-styled IDE interface (`LogicEditorWidget.tsx`) accessible via the War Room Terminal.
    - Implement basic syntax highlighting and line numbering.

2.  **High-Level Language Definition**:
    - Define a simple C-style or JS-style scripting language.
    - Base Logic: `if`, `else`, `while` (loops), basic math/comparators.
    - Action Functions (Mapped to Syscalls): `move(x, y)`, `moveToTarget(target_id)`, `aimAt(target_id)`, `fire()`.
    - Sensor Functions (Mapped to Syscalls): `getNearestEnemy()`, `getSelfHP()`.

3.  **The Compiler**:
    - Write a lexer/parser (in TypeScript/Rust) that converts the high-level script into an AST.
    - Write a code generator that translates the AST into a raw array of RISK-16 bytecode bytes.
    - Ensure variables and jump offsets are correctly resolved to memory addresses.

4.  **Feedback & Output**:
    - The IDE should display compilation errors (e.g., "Syntax Error on line 4").
    - On success, display the compiled bytecode size (e.g., "Compiled successfully: 124 bytes. Fits within 2KB memory limit.").

## Dev Agent Record

### Status
- [ ] Terminal IDE
- [ ] Language Definition
- [ ] Compiler (Lexer/Parser/Generator)
- [ ] Error Feedback
