# Grimdark UI Components

Design system components for the grimdark terminal theme. All components use `VT323` font and the grimdark color palette from `grimdark-theme.css`.

## Setup

Import the theme CSS in your app entry point:

```tsx
import "./styles/grimdark-theme.css";
```

Apply the `.grimdark` class to enable base theme:

```html
<div className="grimdark">...</div>
```

## Color Palette

| Token                 | Value     | Usage                    |
| --------------------- | --------- | ------------------------ |
| `--gd-bg`             | `#0A0A0A` | Page background          |
| `--gd-surface`        | `#161616` | Card/panel background    |
| `--gd-primary`        | `#00CC66` | Primary actions, borders |
| `--gd-primary-bright` | `#00FF9D` | Text, glowing elements   |
| `--gd-secondary`      | `#FFA500` | Warnings, amber accents  |
| `--gd-accent`         | `#CC0000` | Danger, blood red        |
| `--gd-text`           | `#00FF9D` | Primary text             |
| `--gd-text-dim`       | `#888888` | Secondary text           |

## Components

### GrimdarkButton

Retro button with bracket decoration `[>>> ACTION <<<]`.

```tsx
import GrimdarkButton from './components/grimdark/GrimdarkButton';

<GrimdarkButton variant="primary" size="md">DEPLOY</GrimdarkButton>
<GrimdarkButton variant="warning">OVERRIDE</GrimdarkButton>
<GrimdarkButton variant="danger" size="lg">SELF DESTRUCT</GrimdarkButton>
```

**Props**: `variant` (`primary` | `warning` | `danger`), `size` (`sm` | `md` | `lg`), plus all standard `<button>` props.

### GrimdarkProgressBar

ASCII-style progress: `[####----] 45%`

```tsx
import GrimdarkProgressBar from './components/grimdark/GrimdarkProgressBar';

<GrimdarkProgressBar value={45} label="EXTRACTION PROGRESS" />
<GrimdarkProgressBar value={80} max={100} variant="warning" />
<GrimdarkProgressBar value={95} variant="danger" width={30} />
```

**Props**: `value`, `max`, `label`, `variant`, `showPercentage`, `width` (ASCII char count).

### GrimdarkInput

Terminal-style text input with `>` prompt.

```tsx
import GrimdarkInput from './components/grimdark/GrimdarkInput';

<GrimdarkInput label="CALLSIGN" placeholder="Enter designation..." />
<GrimdarkInput prompt="$" error="INVALID CREDENTIAL" />
```

**Props**: `label`, `prompt` (default `>`), `error`, plus all standard `<input>` props.

### GrimdarkCard

Bordered panel with corner decorations and status indicator.

```tsx
import GrimdarkCard from './components/grimdark/GrimdarkCard';

<GrimdarkCard title="SYSTEM STATUS" status="online">
  <p>All systems nominal.</p>
</GrimdarkCard>

<GrimdarkCard title="REACTOR CORE" status="warning" scanlines>
  <p>Temperature exceeding safety threshold.</p>
</GrimdarkCard>
```

**Props**: `title`, `status` (`online` | `offline` | `warning`), `scanlines` (boolean), `children`.

### BootSequence

Terminal boot animation. Plays once per session per terminal.

```tsx
import BootSequence from "./components/grimdark/BootSequence";

<BootSequence terminalId="CRYOPOD" onComplete={() => setBooted(true)} />;
```

**Props**: `terminalId` (unique key for session storage), `onComplete` (callback when finished).

## CRT Effects (CSS Classes)

| Class              | Effect                      |
| ------------------ | --------------------------- |
| `.crt-scanlines`   | Horizontal scanline overlay |
| `.crt-vignette`    | Dark edge vignette          |
| `.crt-glow`        | Subtle text glow            |
| `.crt-glow-strong` | Stronger phosphor glow      |
| `.crt-flicker`     | Screen flicker animation    |
| `.text-flicker`    | Subtle text flicker         |
| `.crt-aberration`  | Chromatic aberration        |
| `.crt-curved`      | Rounded CRT edges           |
| `.glitch`          | Glitch shake effect         |
| `.cursor-blink`    | Appends blinking `█` cursor |

## Accessibility

- **High contrast**: Add `.high-contrast` class to `.grimdark` for WCAG AA compliance
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce`
- Scanlines hidden in reduced motion mode
