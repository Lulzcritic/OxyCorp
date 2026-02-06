# Developer Guide: The Venture (OxyCorp)

## 1. Project Overview

"The Venture" is a browser-based realtime multiplayer game built with **React**, **Three.js**, and **Supabase**. The project focuses on creating an immersive 3D environment ("The Town") where players can interact, mine resources, and trade.

**Current Status:** Prototype / MVP.
**Repository Name:** `theventure` (in `package.json`)

## 2. Tech Stack Setup

### Frontend (Client)

- **Framework:** [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- **Language:** TypeScript
- **3D Engine:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (Three.js)
- **Physics:** [React Three Rapier](https://github.com/pmndrs/react-three-rapier)
- **State Management:** React Context + Hooks (`useAuth`, `useControlStore`)

### Backend (Serverless)

- **Platform:** [Supabase](https://supabase.com/)
- **Database:** PostgreSQL
- **Auth:** Supabase Auth (JWT)
- **Realtime:** Supabase Realtime (Channels for position syncing)
- **Logic:** Supabase Edge Functions (Deno)

## 3. Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- **Supabase CLI** (installed and logged in)
- **Docker** (required for local Supabase)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd OxyCorp
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    npm install
    ```

3.  **Start Local Backend (Supabase):**

    ```bash
    supabase start
    ```

    _This will spin up local Postgres, Auth, Realtime, and Edge Functions._

4.  **Start Frontend:**
    ```bash
    npm run dev
    ```
    Access the game at `http://localhost:5173`.

## 4. Architecture Deep Dive

### Authentication Flow

- **Entry Point:** `src/App.tsx`
- **Logic:**
  - Checks `useAuth()` hook.
  - If no session, renders `<AuthScreen />`.
  - If session exists, fetches user profile (`profiles` table) and renders `<World />`.

### Realtime Multiplayer (`useTownChannel`)

- **File:** `src/game/useTownChannel.tsx`
- **Technology:** Supabase Realtime Channels.
- **Mechanism:**
  - **Presence:** Tracks who is online (`sync`, `join`, `leave`).
  - **Broadcast:** Sends player position (`p`) and rotation (`ry`) at ~10Hz.
  - **Interpolation:** Clients interpolate received positions for smooth movement.

### Game Logic & Edge Functions

- **Location:** `supabase/functions/`
- **Key Functions:**
  - `enterTown`: Handles logic when a player enters the game world.
  - `leaveTown`: Cleanup or state saving on exit.
  - `mineRock`: Server-side validation for mining actions (anti-cheat).
- **Execution:** Functions are invoked via `supabase.functions.invoke()` from the client.

## 5. Directory Structure

```
OxyCorp/
├── src/
│   ├── auth/           # Authentication components & context
│   ├── components/     # Reusable UI components
│   ├── game/           # Core game logic hooks (controls, networking)
│   ├── scenes/         # 3D Scenes (World.tsx, Town.tsx)
│   ├── App.tsx         # Main entry point & routing logic
│   └── main.tsx        # React root
├── supabase/
│   ├── functions/      # Deno Edge Functions
│   ├── config.toml     # Local Supabase configuration
│   └── seed.sql        # Initial database data
├── docs/               # Documentation
└── package.json        # Frontend dependencies
```

## 6. Common Tasks

### Deploying Edge Functions

To deploy a specific function (e.g., `mineRock`) to the hosted Supabase project:

```bash
supabase functions deploy mineRock
```

### Database Migrations

To create a new migration after changing the schema:

```bash
supabase db diff -f my_new_migration
supabase db push
```

### Linting

```bash
npm run lint
```

> [!NOTE]
> This project structure differs from the `docs/architecture.md` document, which describes a NestJS-based Modular Monolith. The current implementation is a Serverless architecture using Supabase.
