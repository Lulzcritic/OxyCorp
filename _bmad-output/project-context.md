---
project_name: 'OxyCorp'
user_name: 'Lulz'
date: '2026-03-14T19:02:37+01:00'
sections_completed:
  ['technology_stack', 'engine_rules', 'performance_rules', 'organization_rules', 'testing_rules', 'platform_rules', 'anti_patterns']
status: 'complete'
rule_count: 12
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing game code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Frontend:** React 19, React Three Fiber (9.2.0), React Three Rapier (2.1.0), Zustand (5.0.11), Socket.io-client (4.8.3), Vite (7.1.2)
- **Backend:** Node.js (20.11 LTS), NestJS (11.0.1), Prisma (7.3.0), PostgreSQL (Supabase), Redis, Socket.io (4.8.3)
- **Tooling:** Turborepo (1.11.3), TypeScript (5.7.3/5.8.3)

## Critical Implementation Rules

### Engine-Specific Rules (NestJS & React)

- **Redis Adapter for Sockets:** All WebSocket events in NestJS must use `@socket.io/redis-adapter` for scaling across Node instances.
- **Optimistic UI:** Frontend components must update `Zustand` immediately for high-frequency actions and handle rollback if the asynchronous backend validation fails.
- **Zustand for State:** Use `Zustand` for rapid game state mutations; avoid complex Redux architectures.

### Performance Rules

- **Background Workers:** Deterministic task resolution (e.g., Tactical Grid Resolver combat) and async tasks must be dispatched to BullMQ/Redis worker services, never calculated in the main request thread.
- **Redis Caching for Modifiers:** Computed stat modifiers (like User Skills) must be cached heavily in Redis to reduce database read pressure.

### Code Organization Rules

- **Modular Monolith:** Group related domain logic (Economy, Combat, User) into NestJS modules. Do not split into microservices for the MVP phase.
- **Repository Pattern:** All database access must be abstracted behind typed NestJS Repositories to isolate Prisma.

### Testing Rules

- **Frontend:** Use `Vitest` with React Testing Library (`@testing-library/react`) for component tests.
- **Backend:** Use `Jest` for unit testing and `Supertest` for e2e endpoint coverage in NestJS.

### Platform & Build Rules

- **Browser Priority:** The primary platform is modern Web browsers. 
- **Turborepo:** The monorepo heavily relies on `turbo`. Always use appropriate `turbo run` commands rather than changing individual package directories.

### Critical Don't-Miss Rules

- **Deterministic Combat:** The Tactical Grid Resolver (TGR) must be perfectly deterministic. The React Three Fiber frontend replay matches the backend's JSON combat output turn-by-turn.
- **Secrets Management:** NEVER commit `.env` files. Secrets are managed securely by the deployment host and Supabase Vault.
- **Prisma is Source of Truth:** Do not write raw SQL migrations. All schema changes must be driven strictly through Prisma.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any game code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-03-14T19:02:37+01:00
