# Moloch - Epic 14 Terminal Integration Architecture

## 1. Introduction

This document outlines the architectural approach for enhancing Moloch with **Epic 14: Immersive Terminal Interface & Three.js Integration**. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new features while ensuring seamless integration with the existing system.

**Relationship to Existing Architecture:**
This document supplements existing project architecture by defining how the Terminal Integration System components will integrate with current React-based UI systems. Where conflicts arise between new patterns (Three.js/React Three Fiber) and existing patterns (pure React), this document provides guidance on maintaining consistency while implementing the 3D environment enhancement.

### Existing Project Analysis

**DRAFT - AWAITING VALIDATION**

Based on analysis of the Moloch codebase, here are the key findings about the existing system:

#### Current Project State

- **Primary Purpose:** Browser-based MMORPG with economy simulation, resource gathering, combat system, and territory control
- **Current Tech Stack:**
  - Frontend: React 18+ with Zustand for state management
  - Backend: NestJS 10.3+ (Modular Monolith)
  - Database: PostgreSQL 15+ via Supabase with Prisma ORM
  - Realtime: Socket.io 4.7+ for WebSocket connections
  - Build System: Turborepo monorepo
- **Architecture Style:** Modular Monolith with clear module boundaries (User, Economy, Combat, Map)
- **Deployment Method:**
  - Frontend: Static hosting (Vercel)
  - Backend: Self-hosted Node.js instances
  - Database: Managed Supabase

#### Available Documentation

- `docs/prd.md` - Product requirements with Epic 1-12 completed
- `docs/architecture.md` - Backend architecture with data models, API design, Worker Service
- `docs/front-end-spec.md` - UI/UX specification with "Diegetic Cyber-Industrial" design system
- `docs/epic-14-terminal-integration.md` - Epic specification for this enhancement
- Implementation plan already created for Phase 1

#### Identified Constraints

- **Performance**: Dashboard must load in <1s on 4G networks (NFR2 from PRD)
- **Mobile Support**: UI must be fully functional on mobile browsers (touch targets >44px)
- **Browser-Only**: Must run entirely in browser, no client installation
- **Existing UI Patterns**: 16 existing React components (Dashboard, MiningWidget, SkillsWidget, MarketWidget, etc.) that must remain functional
- **Optimistic UI Pattern**: All critical actions use optimistic updates with rollback on failure
- **Backward Compatibility**: Existing API endpoints and database schema must not break
- **Session Speed**: Critical actions must be performable within 3 clicks (NFR1)

---

**VALIDATION CHECKPOINT:**

Based on my analysis of your project, I've identified the following about your existing system:

✅ **Stack**: React + NestJS + Supabase with Socket.io for realtime  
✅ **Architecture**: Modular monolith backend, pure React frontend (no 3D currently)  
✅ **Components**: 16 existing UI components all accessible from Dashboard  
✅ **Constraints**: Strict performance requirements (<1s load, mobile support)  
✅ **PRD Assumption**: Original PRD line 73 stated "3D Deferred: MVP will use 2D/UI only. Three.js scenes are Phase 2"

**This enhancement represents that deferred Phase 2 - adding Three.js for the first time.**

Please confirm these observations are accurate before I proceed with architectural recommendations.

---

### Change Log

| Change        | Date       | Version | Description                                 | Author              |
| ------------- | ---------- | ------- | ------------------------------------------- | ------------------- |
| Initial Draft | 2026-02-11 | 0.1     | Created brownfield architecture for Epic 14 | Winston (Architect) |
