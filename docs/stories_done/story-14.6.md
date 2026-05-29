# Story 14.6: Grimdark Terminal Theme Design System

**Epic:** Epic 14: Immersive Terminal Interface & Three.js Integration  
**Role:** UX Designer / Frontend Developer  
**Goal:** I want a comprehensive grimdark terminal theme, so that all UI feels cohesive and atmospheric.

## Acceptance Criteria

1. **Color Palette Update**:
   - Create `apps/web/src/styles/grimdark-theme.css`:
     - Background: `#0A0A0A` (deeper black)
     - Surface: `#161616` (darker terminal panels)
     - Primary: `#00CC66` (dimmer, sickly green)
     - Secondary: `#FFA500` (amber warning)
     - Accent: `#CC0000` (blood red)
     - Text primary: `#00FF9D` (retro green phosphor)
     - Text secondary: `#888888` (dim gray)

2. **Typography System**:
   - Import retro monospace fonts:
     - Primary: VT323 or Press Start 2P
     - Fallback: Courier New
   - Font settings:
     - Increased letter-spacing: `0.1em`
     - Line height: `1.4`
   - Add text flickering effect (subtle CSS animation)

3. **CRT Visual Effects**:
   - Create CRT effect components/shaders:
     - Scanlines overlay (horizontal lines)
     - Screen border vignette (rounded CRT edges)
     - Phosphor glow on text (text-shadow)
     - Optional: chromatic aberration
     - Optional: subtle screen curvature
   - Effects should be toggleable via CSS class

4. **Terminal Boot Sequence Animation**:
   - Create `BootSequence.tsx` component:
     - Shows on terminal first access
     - ASCII-style loading animation
     - Example text:
       ```
       > INITIALIZING TERMINAL...
       > LOADING SYSTEM PROTOCOLS...
       > NEURAL LINK ESTABLISHED
       > ACCESS GRANTED
       ```
     - Duration: ~2 seconds
     - Can be skipped with any key

5. **UI Element Redesign**:
   - Create grimdark component variants:
     - `GrimdarkButton.tsx` - chunky, retro buttons with brackets `[>>> ACTION <<<]`
     - `GrimdarkProgressBar.tsx` - ASCII-style `[####----]`
     - `GrimdarkInput.tsx` - terminal-style text input
     - `GrimdarkCard.tsx` - bordered panel with scanlines
   - Document usage in `docs/grimdark-ui-components.md`

## Technical Notes

- CRT effects should be CSS-based where possible (performance)
- For advanced effects, consider using CSS filters or post-processing shaders
- Scanlines: repeating-linear-gradient background
- Provide high-contrast toggle for accessibility (WCAG AA compliance)
- Boot sequence should only play once per terminal per session (use localStorage)
- Consider motion-reduced mode for users with vestibular disorders

## Dev Agent Record

### Status

- [x] Color palette defined
- [x] Typography system updated
- [x] CRT effects implemented
- [x] Boot sequence animation created
- [x] UI element variants designed

### Completion Notes

**Story 14.6 Implementation Complete**

1. **grimdark-theme.css**: Full CSS design system with:
   - CSS custom properties for all colors, fonts, spacing
   - VT323 + Share Tech Mono font imports
   - CRT effects (scanlines, vignette, flicker, aberration, curvature)
   - Animations (cursor blink, glitch, boot line, pulse glow)
   - Utility classes for text colors, backgrounds, borders
   - High-contrast mode and `prefers-reduced-motion` support

2. **BootSequence.tsx**: ASCII boot animation with sequential line reveals,
   sessionStorage-based once-per-session logic, any-key skip, blinking cursor

3. **GrimdarkButton.tsx**: Bracket-decorated buttons `[>>> ACTION <<<]`,
   3 variants (primary/warning/danger), 3 sizes, hover transitions

4. **GrimdarkProgressBar.tsx**: ASCII bar `[####----] 45%`,
   configurable width, label, percentage display

5. **GrimdarkInput.tsx**: Terminal input with `>` prompt prefix,
   error state with red highlighting, label support

6. **GrimdarkCard.tsx**: Bordered panel with corner bracket decorations,
   status indicator (online/offline/warning with pulse), optional scanlines

7. **grimdark-ui-components.md**: Full documentation with usage examples,
   props reference, CRT effects guide, accessibility notes

### File List

- `apps/web/src/styles/grimdark-theme.css` [NEW]
- `apps/web/src/components/grimdark/BootSequence.tsx` [NEW]
- `apps/web/src/components/grimdark/GrimdarkButton.tsx` [NEW]
- `apps/web/src/components/grimdark/GrimdarkProgressBar.tsx` [NEW]
- `apps/web/src/components/grimdark/GrimdarkInput.tsx` [NEW]
- `apps/web/src/components/grimdark/GrimdarkCard.tsx` [NEW]
- `docs/grimdark-ui-components.md` [NEW]
