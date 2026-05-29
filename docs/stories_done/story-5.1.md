# Story 5.1: Global Chat WebSocket

**Epic:** Epic 5: Comm-Link (Chat)
**Role:** Player
**Goal:** I want to chat with other players in real-time so I can coordinate and socialize.

## Acceptance Criteria

1.  **WebSocket Gateway**:
    - Create `ChatGateway` using Socket.io via NestJS.
    - Handle `handleConnection` and `handleDisconnect`.
    - Authenticate with JWT from handshake headers or query params.
2.  **Global Room**:
    - On connect, join a 'global' room.
    - `chat:message` event triggers `chat:broadcast` to all members of 'global'.
3.  **Basic Persistence (MVP)**:
    - Store last N messages in-memory or Redis for late joiners (optional MVP).

## Technical Notes

- Use `@nestjs/websockets` and `socket.io` adapter.
- Frontend connects via `socket.io-client`.

## Dev Agent Record

### Status

- [x] WebSocket Gateway (`ChatGateway`)
- [x] JWT Authentication (handshake headers/query)
- [x] Global Room (`client.join('global')`)
- [x] Message Broadcasting (`chat:message` -> `chat:broadcast`)

### Completion Notes

- **Pre-existing Implementation**: `ChatGateway` was already implemented before this story was drafted.
- Gateway authenticates JWT on connection and disconnects invalid tokens.
- `@SubscribeMessage('chat:message')` broadcasts to 'global' room.
- In-memory persistence not implemented (MVP scope).

### File List

- `apps/api/src/chat/chat.gateway.ts`
- `apps/api/src/chat/chat.module.ts`
- `apps/api/src/auth/ws-jwt.guard.ts`
