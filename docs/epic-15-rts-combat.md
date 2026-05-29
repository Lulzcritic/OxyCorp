# Epic 15: Deterministic RTS Combat & Rendering

## Epic Goal
Create a headless, deterministic combat simulator that executes the drone AI scripts, and a frontend Three.js viewer that renders the battle like an RTS (e.g., Starcraft).

## Background Context
Currently, combat resolves instantly via a backend text log. The user wants the render of the drone fight to look like a Starcraft fight, where units follow their programmed AI in real-time.

## Features
### Feature 1: Deterministic Physics & Combat Engine (Backend)
- A tick-based resolver that takes drone stats, positions, and Cartridge AI scripts as input.
- Simulates the entire battle to completion on the server, generating a deterministic tick-by-tick event log (movement, firing, damage, death).
- Ensures that the fight outcome cannot be manipulated by the client.

### Feature 2: RTS Battle Viewer (Frontend)
- A Three.js visualizer (or high-quality 2D top-down) that consumes the event log.
- Plays back the fight in real-time, showing units moving, shooting projectiles, and exploding.
- Provides play, pause, and speed controls.

## Stories
- **Story 15.1:** As a server system, I want to simulate drone combat on a tick-by-tick basis using AI scripts, so that the outcome is perfectly deterministic and recorded.
- **Story 15.2:** As a Tactician, I want to watch my drone battles in an RTS-style viewer, so that I can see how my AI scripts performed in real-time.
- **Story 15.3:** As a frontend developer, I want to implement visual effects for lasers, movement, and explosions in the Battle Viewer to make the combat feel visceral.
